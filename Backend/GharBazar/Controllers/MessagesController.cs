using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;

namespace GharBazar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPropertyRepository _propertyRepository;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(
        IMessageRepository messageRepository, 
        IUserRepository userRepository,
        IPropertyRepository propertyRepository,
        ILogger<MessagesController> logger)
    {
        _messageRepository = messageRepository;
        _userRepository = userRepository;
        _propertyRepository = propertyRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<ConversationDto>>> GetConversations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        Console.WriteLine($">>>> DEBUG: GetConversations called for User {userId}");

        var messages = await _messageRepository.GetConversationsAsync(userId);
        
        Console.WriteLine($">>>> DEBUG: Found {messages.Count} conversations for User {userId}");
        if (messages.Count > 0)
        {
            Console.WriteLine($">>>> DEBUG: First message: Sender={messages[0].SenderId}, Receiver={messages[0].ReceiverId}");
        }

        var conversations = messages.Select(m => {
            var isSender = m.SenderId == userId;
            var otherUser = isSender ? m.Receiver : m.Sender;
            
            return new ConversationDto
            {
                UserId = otherUser?.UserId ?? (isSender ? m.ReceiverId : m.SenderId),
                UserName = otherUser?.FullName ?? "Unknown User",
                UserProfilePicture = otherUser?.ProfilePictureUrl,
                LastMessage = MapToMessageDto(m, userId),
                UnreadCount = 0 
            };
        }).ToList();

        return Ok(conversations);
    }

    [HttpGet("{otherUserId}")]
    public async Task<ActionResult<List<MessageDto>>> GetChatHistory(string otherUserId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        Console.WriteLine($">>>> DEBUG: GetChatHistory for User {userId} with {otherUserId}");

        var messages = await _messageRepository.GetMessagesAsync(userId, otherUserId);
        
        // Mark received messages as read
        foreach (var msg in messages.Where(m => m.ReceiverId == userId && !m.IsRead))
        {
            msg.IsRead = true;
            await _messageRepository.UpdateAsync(msg);
        }
        await _messageRepository.SaveChangesAsync();

        return Ok(messages.Select(m => MapToMessageDto(m, userId)).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] MessageCreateRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        Console.WriteLine($">>>> DEBUG: SendMessage from {userId} to {request.ReceiverId} with PropId={request.PropertyId}");

        if (userId == request.ReceiverId)
        {
            return BadRequest("Cannot send message to yourself");
        }

        var receiver = await _userRepository.GetByIdAsync(request.ReceiverId);
        if (receiver == null) 
        {
            Console.WriteLine($">>>> DEBUG: Receiver {request.ReceiverId} NOT FOUND");
            return NotFound("Receiver not found");
        }

        var message = new Message
        {
            MessageId = Guid.NewGuid().ToString(),
            SenderId = userId,
            ReceiverId = request.ReceiverId,
            PropertyId = request.PropertyId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _messageRepository.AddAsync(message);
        await _messageRepository.SaveChangesAsync();

        Console.WriteLine($">>>> DEBUG: Message {message.MessageId} SAVED successfully");

        // Re-fetch to get navigation properties if needed or just return dto
        // Ideally we should return what we created.
        // We can manually populate Sender/Receiver for the response
        message.Sender = await _userRepository.GetByIdAsync(userId);
        message.Receiver = receiver;
        if (!string.IsNullOrEmpty(request.PropertyId))
        {
            message.Property = await _propertyRepository.GetByIdAsync(request.PropertyId);
        }

        return CreatedAtAction(nameof(GetChatHistory), new { otherUserId = request.ReceiverId }, MapToMessageDto(message, userId));
    }

    [HttpGet("unread")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var count = await _messageRepository.GetUnreadCountAsync(userId);
        return Ok(count);
    }

    private static MessageDto MapToMessageDto(Message message, string currentUserId)
    {
        return new MessageDto
        {
            MessageId = message.MessageId,
            SenderId = message.SenderId,
            SenderName = message.Sender?.FullName ?? "Unknown",
            SenderProfilePicture = message.Sender?.ProfilePictureUrl,
            ReceiverId = message.ReceiverId,
            ReceiverName = message.Receiver?.FullName ?? "Unknown",
            ReceiverProfilePicture = message.Receiver?.ProfilePictureUrl,
            PropertyId = message.PropertyId,
            PropertyTitle = message.Property?.Title,
            Content = message.Content,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt
        };
    }
}
