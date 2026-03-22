using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace GharBazar.API.Services;

public interface IWebSocketManager
{
    Task AddConnectionAsync(string userId, WebSocket webSocket);
    Task RemoveConnectionAsync(string userId);
    Task SendMessageAsync(string senderId, string receiverId, string message);
    Task BroadcastMessageAsync(string senderId, string message);
    bool IsUserConnected(string userId);
}

public class WebSocketManager : IWebSocketManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _connections = new();
    private readonly ILogger<WebSocketManager> _logger;

    public WebSocketManager(ILogger<WebSocketManager> logger)
    {
        _logger = logger;
    }

    public async Task AddConnectionAsync(string userId, WebSocket webSocket)
    {
        if (_connections.TryAdd(userId, webSocket))
        {
            _logger.LogInformation($"User {userId} connected via WebSocket");
        }
        else
        {
            _logger.LogWarning($"Failed to add WebSocket connection for user {userId}");
        }
    }

    public async Task RemoveConnectionAsync(string userId)
    {
        if (_connections.TryRemove(userId, out var webSocket))
        {
            if (webSocket.State == WebSocketState.Open)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
            }
            webSocket.Dispose();
            _logger.LogInformation($"User {userId} disconnected from WebSocket");
        }
    }

    public async Task SendMessageAsync(string senderId, string receiverId, string message)
    {
        if (_connections.TryGetValue(receiverId, out var webSocket) && webSocket.State == WebSocketState.Open)
        {
            try
            {
                var messageData = new
                {
                    type = "message",
                    senderId,
                    content = message,
                    timestamp = DateTime.UtcNow
                };

                var json = JsonSerializer.Serialize(messageData);
                var bytes = Encoding.UTF8.GetBytes(json);

                await webSocket.SendAsync(
                    new ArraySegment<byte>(bytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );

                _logger.LogInformation($"Message sent from {senderId} to {receiverId}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending message: {ex.Message}");
                await RemoveConnectionAsync(receiverId);
            }
        }
    }

    public async Task BroadcastMessageAsync(string senderId, string message)
    {
        var messageData = new
        {
            type = "broadcast",
            senderId,
            content = message,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(messageData);
        var bytes = Encoding.UTF8.GetBytes(json);

        var tasks = _connections
            .Where(kvp => kvp.Key != senderId && kvp.Value.State == WebSocketState.Open)
            .Select(kvp => SendToConnectionAsync(kvp.Value, bytes))
            .ToList();

        await Task.WhenAll(tasks);
    }

    private async Task SendToConnectionAsync(WebSocket webSocket, byte[] bytes)
    {
        try
        {
            await webSocket.SendAsync(
                new ArraySegment<byte>(bytes),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in SendToConnectionAsync: {ex.Message}");
        }
    }

    public bool IsUserConnected(string userId)
    {
        return _connections.TryGetValue(userId, out var webSocket) && webSocket.State == WebSocketState.Open;
    }
}
