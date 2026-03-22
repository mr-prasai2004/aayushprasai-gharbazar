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
public class WishlistController : ControllerBase
{
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IPropertyRepository _propertyRepository;

    public WishlistController(IWishlistRepository wishlistRepository, IPropertyRepository propertyRepository)
    {
        _wishlistRepository = wishlistRepository;
        _propertyRepository = propertyRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<PropertyDto>>> GetWishlist()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var items = await _wishlistRepository.GetByUserAsync(userId);
        var properties = new List<PropertyDto>();

        foreach (var item in items)
        {
            var property = await _propertyRepository.GetByIdAsync(item.PropertyId);
            if (property != null)
            {
                // We'll map property to DTO manually or use a shared mapper
                // For simplicity, replicating mapping logic or fetching mapped
                 properties.Add(new PropertyDto
                {
                    PropertyId = property.PropertyId,
                    OwnerId = property.OwnerId,
                    Title = property.Title,
                    Description = property.Description,
                    PropertyType = property.PropertyType,
                    Price = property.Price,
                    Location = property.Location,
                    City = property.City,
                    State = property.State,
                    Bedrooms = property.Bedrooms,
                    Bathrooms = property.Bathrooms,
                    AreaSqft = property.AreaSqft,
                    Status = property.Status,
                    VerificationStatus = property.VerificationStatus,
                    VerificationNotes = property.VerificationNotes,
                    ListedDate = property.ListedDate,
                    Images = property.Images?.OrderBy(i => i.DisplayOrder).Select(i => new PropertyImageDto
                    {
                        ImageId = i.ImageId,
                        ImageUrl = i.ImageUrl,
                        DisplayOrder = i.DisplayOrder
                    }).ToList() ?? new List<PropertyImageDto>(),
                    Documents = property.Documents?.Select(d => new PropertyDocumentDto
                    {
                        DocumentId = d.DocumentId,
                        DocumentType = d.DocumentType,
                        DocumentUrl = d.DocumentUrl,
                        DocumentName = d.DocumentName,
                        Verified = d.Verified
                    }).ToList() ?? new List<PropertyDocumentDto>()
                });
            }
        }

        return Ok(properties);
    }

    [HttpPost("{propertyId}")]
    public async Task<IActionResult> AddToWishlist(string propertyId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        if (await _wishlistRepository.IsInWishlistAsync(userId, propertyId))
        {
            return BadRequest("Property already in wishlist");
        }

        var item = new WishlistItem
        {
            WishlistId = Guid.NewGuid().ToString(),
            UserId = userId,
            PropertyId = propertyId,
            CreatedAt = DateTime.UtcNow
        };

        await _wishlistRepository.AddAsync(item);
        await _wishlistRepository.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{propertyId}")]
    public async Task<IActionResult> RemoveFromWishlist(string propertyId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        await _wishlistRepository.RemoveAsync(userId, propertyId);
        await _wishlistRepository.SaveChangesAsync();

        return NoContent();
    }
}
