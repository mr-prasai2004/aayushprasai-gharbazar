using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationsController(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetMyNotifications()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var notifications = await _notificationRepository.GetByUserAsync(userId);
        return Ok(notifications.Select(MapToNotificationDto).ToList());
    }

    [HttpGet("unread")]
    public async Task<ActionResult<List<NotificationDto>>> GetUnreadNotifications()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var notifications = await _notificationRepository.GetUnreadByUserAsync(userId);
        return Ok(new { count = notifications.Count, notifications = notifications.Select(MapToNotificationDto).ToList() });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] NotificationCreateRequest request)
    {
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid().ToString(),
            OwnerId = request.OwnerId,
            PropertyId = request.PropertyId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            PropertyTitle = request.PropertyTitle,
            ActionNotes = request.ActionNotes,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyNotifications), MapToNotificationDto(notification));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<NotificationDto>> MarkAsRead(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null)
        {
            return NotFound("Notification not found");
        }

        if (notification.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to update this notification");
        }

        notification.ReadAt = DateTime.UtcNow;
        await _notificationRepository.UpdateAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return Ok(MapToNotificationDto(notification));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null)
        {
            return NotFound("Notification not found");
        }

        if (notification.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to delete this notification");
        }

        await _notificationRepository.DeleteAsync(id);
        await _notificationRepository.SaveChangesAsync();

        return NoContent();
    }

    private NotificationDto MapToNotificationDto(Notification notification)
    {
        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            OwnerId = notification.OwnerId,
            PropertyId = notification.PropertyId,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            PropertyTitle = notification.PropertyTitle,
            CreatedAt = notification.CreatedAt,
            Read = notification.ReadAt.HasValue,
            ActionNotes = notification.ActionNotes
        };
    }
}
