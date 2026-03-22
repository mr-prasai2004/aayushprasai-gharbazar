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
public class TourBookingsController : ControllerBase
{
    private readonly ITourBookingRepository _bookingRepository;
    private readonly IPropertyRepository _propertyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;

    public TourBookingsController(
        ITourBookingRepository bookingRepository,
        IPropertyRepository propertyRepository,
        IUserRepository userRepository,
        INotificationRepository notificationRepository)
    {
        _bookingRepository = bookingRepository;
        _propertyRepository = propertyRepository;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
    }

    // GET api/tourbookings — buyer sees their own bookings
    [HttpGet]
    public async Task<ActionResult<List<TourBookingDto>>> GetMyBookings()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var bookings = await _bookingRepository.GetByBuyerAsync(userId);
        return Ok(bookings.Select(MapToDto).ToList());
    }

    // GET api/tourbookings/seller — seller sees visits scheduled on their properties
    [HttpGet("seller")]
    public async Task<ActionResult<List<TourBookingDto>>> GetSellerBookings()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var bookings = await _bookingRepository.GetBySellerAsync(userId);
        return Ok(bookings.Select(MapToDto).ToList());
    }

    // POST api/tourbookings — buyer schedules a tour
    [HttpPost]
    public async Task<ActionResult<TourBookingDto>> CreateBooking([FromBody] CreateTourBookingRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var property = await _propertyRepository.GetByIdAsync(request.PropertyId);
        if (property == null) return NotFound("Property not found");

        if (!DateTime.TryParse(request.TourDate, out var parsedDate))
            return BadRequest("Invalid date format. Use YYYY-MM-DD");

        var booking = new TourBooking
        {
            BookingId = Guid.NewGuid().ToString(),
            BuyerId = userId,
            PropertyId = request.PropertyId,
            SellerId = property.OwnerId,
            TourDate = parsedDate.Date,
            TourTime = request.TourTime,
            Notes = request.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddAsync(booking);
        await _bookingRepository.SaveChangesAsync();

        // Add notifications
        var buyerNotification = new Notification
        {
            OwnerId = userId,
            PropertyId = property.PropertyId,
            Type = "tour_scheduled",
            Title = "Tour Scheduled",
            Message = $"You have successfully scheduled a tour for {property.Title} on {parsedDate:MMM dd, yyyy} at {request.TourTime}.",
            PropertyTitle = property.Title
        };
        await _notificationRepository.AddAsync(buyerNotification);

        var sellerNotification = new Notification
        {
            OwnerId = property.OwnerId,
            PropertyId = property.PropertyId,
            Type = "tour_scheduled",
            Title = "New Tour Request",
            Message = $"A buyer has scheduled a tour for your property {property.Title} on {parsedDate:MMM dd, yyyy} at {request.TourTime}.",
            PropertyTitle = property.Title
        };
        await _notificationRepository.AddAsync(sellerNotification);

        await _notificationRepository.SaveChangesAsync();

        // Re-fetch with navigation props
        var saved = await _bookingRepository.GetByIdAsync(booking.BookingId);
        return Ok(MapToDto(saved!));
    }

    // PUT api/tourbookings/{id}/cancel — buyer cancels
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null) return NotFound();
        if (booking.BuyerId != userId) return Forbid();

        booking.Status = "Cancelled";
        await _bookingRepository.UpdateAsync(booking);
        await _bookingRepository.SaveChangesAsync();
        return Ok(MapToDto(booking));
    }

    // PUT api/tourbookings/{id}/confirm — seller confirms
    [HttpPut("{id}/confirm")]
    public async Task<IActionResult> ConfirmBooking(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var booking = await _bookingRepository.GetByIdAsync(id);
        if (booking == null) return NotFound();
        if (booking.SellerId != userId) return Forbid();

        booking.Status = "Confirmed";
        await _bookingRepository.UpdateAsync(booking);
        await _bookingRepository.SaveChangesAsync();
        return Ok(MapToDto(booking));
    }

    private static TourBookingDto MapToDto(TourBooking b) => new TourBookingDto
    {
        BookingId = b.BookingId,
        PropertyId = b.PropertyId,
        PropertyTitle = b.Property?.Title ?? string.Empty,
        PropertyLocation = b.Property?.Location ?? string.Empty,
        PropertyImage = b.Property?.Images?.OrderBy(i => i.DisplayOrder).FirstOrDefault()?.ImageUrl,
        BuyerId = b.BuyerId,
        BuyerName = b.Buyer?.FullName ?? "Buyer",
        BuyerEmail = b.Buyer?.Email ?? string.Empty,
        SellerName = b.Seller?.FullName ?? "Seller",
        TourDate = b.TourDate.ToString("yyyy-MM-dd"),
        TourTime = b.TourTime,
        Status = b.Status,
        Notes = b.Notes,
        CreatedAt = b.CreatedAt
    };
}
