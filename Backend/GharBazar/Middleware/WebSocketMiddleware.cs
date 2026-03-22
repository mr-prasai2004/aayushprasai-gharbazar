using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace GharBazar.API.Middleware;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<WebSocketMiddleware> _logger;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public WebSocketMiddleware(RequestDelegate next, ILogger<WebSocketMiddleware> logger, IServiceScopeFactory serviceScopeFactory)
    {
        _next = next;
        _logger = logger;
        _serviceScopeFactory = serviceScopeFactory;
    }

    public async Task InvokeAsync(HttpContext context, IWebSocketManager webSocketManager)
    {
        if (context.Request.Path == "/api/ws" && context.WebSockets.IsWebSocketRequest)
        {
            try
            {
                var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                
                // Try to get userId from JWT claims first
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                // If not authenticated via JWT, we'll wait for the client to send token
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("WebSocket connection attempt without authentication, waiting for client token...");
                    // We'll accept anyway and let client authenticate via message
                }
                else
                {
                    _logger.LogInformation($"WebSocket connection established for user {userId}");
                }

                await HandleWebSocketAsync(context, webSocket, userId, webSocketManager);
            }
            catch (Exception ex)
            {
                _logger.LogError($"WebSocket error: {ex.Message}");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            }
        }
        else
        {
            await _next(context);
        }
    }

    private async Task HandleWebSocketAsync(HttpContext context, WebSocket webSocket, string? userId, IWebSocketManager webSocketManager)
    {
        byte[] buffer = new byte[1024 * 4];

        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult result = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer),
                    CancellationToken.None
                );

                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string json = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    
                    try
                    {
                        var message = JsonSerializer.Deserialize<WebSocketMessage>(json);
                        if (message != null)
                        {
                            // Handle authentication message
                            if (message.Type == "authenticate" && string.IsNullOrEmpty(userId))
                            {
                                // Extract userId from message
                                userId = message.SenderId ?? Guid.NewGuid().ToString();
                                _logger.LogInformation($"WebSocket client authenticated as {userId}");
                                
                                // Add the WebSocket connection to the manager
                                await webSocketManager.AddConnectionAsync(userId, webSocket);
                                
                                // Send confirmation
                                var response = new { type = "authenticated", status = "ok" };
                                var responseBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(response));
                                await webSocket.SendAsync(
                                    new ArraySegment<byte>(responseBytes),
                                    WebSocketMessageType.Text,
                                    true,
                                    CancellationToken.None
                                );
                                _logger.LogInformation($"Sent authentication confirmation to {userId}");
                            }
                            else if (!string.IsNullOrEmpty(userId) && message.Type == "message")
                            {
                                _logger.LogInformation($"Message from {userId} to {message.ReceiverId}: {message.Content}");
                                if (!string.IsNullOrEmpty(message.ReceiverId))
                                {
                                    // Save message to database
                                    using (var scope = _serviceScopeFactory.CreateScope())
                                    {
                                        var messageRepository = scope.ServiceProvider.GetRequiredService<IMessageRepository>();
                                        var dbMessage = new GharBazar.API.Models.Message
                                        {
                                            MessageId = Guid.NewGuid().ToString(),
                                            SenderId = userId,
                                            ReceiverId = message.ReceiverId,
                                            Content = message.Content,
                                            CreatedAt = DateTime.UtcNow,
                                            IsRead = false
                                        };
                                        await messageRepository.AddAsync(dbMessage);
                                        await messageRepository.SaveChangesAsync();
                                        _logger.LogInformation($"Persisted message {dbMessage.MessageId} from {userId} to {message.ReceiverId}");
                                    }

                                    await webSocketManager.SendMessageAsync(userId, message.ReceiverId, message.Content);
                                }
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogError($"Invalid JSON received: {ex.Message}");
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    _logger.LogInformation($"WebSocket close message received from {userId}");
                    await webSocket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Closed",
                        CancellationToken.None
                    );
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"WebSocket communication error: {ex.Message}");
        }
        finally
        {
            webSocket.Dispose();
            if (!string.IsNullOrEmpty(userId))
            {
                _logger.LogInformation($"Removing WebSocket connection for user {userId}");
                await webSocketManager.RemoveConnectionAsync(userId);
            }
        }
    }
}

public class WebSocketMessage
{
    public string Type { get; set; }
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public string Content { get; set; }
}
