using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;
using System.Text.Json;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyRepository _propertyRepository;
    private readonly IPropertyDocumentRepository _documentRepository;
    private readonly IPropertyImageRepository _imageRepository;
    private readonly IUserRepository _userRepository;

    public PropertiesController(
        IPropertyRepository propertyRepository,
        IPropertyDocumentRepository documentRepository,
        IPropertyImageRepository imageRepository,
        IUserRepository userRepository)
    {
        _propertyRepository = propertyRepository;
        _documentRepository = documentRepository;
        _imageRepository = imageRepository;
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<List<PropertyDto>>> GetAllProperties(
        [FromQuery] string? city = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? search = null)
    {
        List<PropertyDto> result;

        if (!string.IsNullOrEmpty(search) || !string.IsNullOrEmpty(city) || minPrice.HasValue || maxPrice.HasValue)
        {
            var properties = await _propertyRepository.SearchAsync(search ?? "", city, minPrice, maxPrice);
            result = properties.Select(MapToPropertyDto).ToList();
        }
        else
        {
            var properties = await _propertyRepository.GetAllAsync();
            result = properties.Select(MapToPropertyDto).ToList();
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PropertyDto>> GetPropertyById(string id)
    {
        var property = await _propertyRepository.GetByIdAsync(id);
        if (property == null)
        {
            return NotFound("Property not found");
        }

        return Ok(MapToPropertyDto(property));
    }

    [Authorize]
    [HttpGet("owner/listings")]
    public async Task<ActionResult<List<PropertyDto>>> GetMyListings()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var properties = await _propertyRepository.GetByOwnerAsync(userId);
        return Ok(properties.Select(MapToPropertyDto).ToList());
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("pending")]
    public async Task<ActionResult<List<PropertyDto>>> GetPendingProperties()
    {
        var properties = await _propertyRepository.GetPendingAsync();
        return Ok(properties.Select(MapToPropertyDto).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PropertyDto>> CreateProperty([FromBody] PropertyCreateRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var property = new Property
            {
                PropertyId = Guid.NewGuid().ToString(),
                OwnerId = userId,
                Title = request.Title,
                Description = request.Description,
                PropertyType = request.PropertyType,
                Price = request.Price,
                Location = request.Location,
                City = request.City,
                State = request.State,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Bedrooms = request.Bedrooms,
                Bathrooms = request.Bathrooms,
                AreaSqft = request.AreaSqft,
                Amenities = JsonSerializer.Serialize(request.Amenities),
                Status = "Pending",
                VerificationStatus = "pending",
                ListedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _propertyRepository.AddAsync(property);

            // Save Images
            if (request.Images != null)
            {
                foreach (var img in request.Images)
                {
                    var image = new PropertyImage
                    {
                        ImageId = Guid.NewGuid().ToString(),
                        PropertyId = property.PropertyId,
                        ImageUrl = img.ImageUrl,
                        DisplayOrder = img.DisplayOrder
                    };
                    await _imageRepository.AddAsync(image);
                }
            }

            // Save Documents
            if (request.Documents != null)
            {
                foreach (var doc in request.Documents)
                {
                    var document = new PropertyDocument
                    {
                        DocumentId = Guid.NewGuid().ToString(),
                        PropertyId = property.PropertyId,
                        DocumentType = doc.DocumentType,
                        DocumentUrl = doc.DocumentUrl,
                        DocumentName = doc.DocumentName,
                        UploadedDate = DateTime.UtcNow,
                        Verified = false
                    };
                    await _documentRepository.AddAsync(document);
                }
            }

            await _propertyRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPropertyById), new { id = property.PropertyId }, MapToPropertyDto(property));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating property: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<PropertyDto>> UpdateProperty(string id, [FromBody] PropertyUpdateRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var property = await _propertyRepository.GetByIdAsync(id);
        if (property == null)
        {
            return NotFound("Property not found");
        }

        if (property.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to update this property");
        }

        if (!string.IsNullOrEmpty(request.Title))
            property.Title = request.Title;
        if (!string.IsNullOrEmpty(request.Description))
            property.Description = request.Description;
        if (request.Price.HasValue)
            property.Price = request.Price.Value;
        if (request.Bedrooms.HasValue)
            property.Bedrooms = request.Bedrooms.Value;
        if (request.Bathrooms.HasValue)
            property.Bathrooms = request.Bathrooms.Value;
        if (request.AreaSqft.HasValue)
            property.AreaSqft = request.AreaSqft.Value;
        if (request.Amenities != null)
            property.Amenities = JsonSerializer.Serialize(request.Amenities);
        if (!string.IsNullOrEmpty(request.Status))
            property.Status = request.Status;
        if (request.Latitude.HasValue)
            property.Latitude = request.Latitude.Value;
        if (request.Longitude.HasValue)
            property.Longitude = request.Longitude.Value;

        property.UpdatedAt = DateTime.UtcNow;

        await _propertyRepository.UpdateAsync(property);
        await _propertyRepository.SaveChangesAsync();

        return Ok(MapToPropertyDto(property));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProperty(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var property = await _propertyRepository.GetByIdAsync(id);
        if (property == null)
        {
            return NotFound("Property not found");
        }

        if (property.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to delete this property");
        }

        await _propertyRepository.DeleteAsync(id);
        await _propertyRepository.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id}/verify")]
    public async Task<ActionResult<PropertyDto>> VerifyProperty(string id, [FromBody] PropertyVerificationRequest request)
    {
        var property = await _propertyRepository.GetByIdAsync(id);
        if (property == null)
        {
            return NotFound("Property not found");
        }

        property.VerificationStatus = request.VerificationStatus ?? property.VerificationStatus;
        property.VerificationNotes = request.VerificationNotes ?? property.VerificationNotes;

        if (property.VerificationStatus == "verified")
        {
            property.Status = "For Sale";
        }

        property.UpdatedAt = DateTime.UtcNow;

        await _propertyRepository.UpdateAsync(property);
        await _propertyRepository.SaveChangesAsync();

        return Ok(MapToPropertyDto(property));
    }

    private PropertyDto MapToPropertyDto(Property property)
    {
        var amenities = new List<string>();
        if (!string.IsNullOrEmpty(property.Amenities))
        {
            try
            {
                amenities = JsonSerializer.Deserialize<List<string>>(property.Amenities) ?? new List<string>();
            }
            catch { }
        }

        var averageRating = property.Reviews?.Count > 0
    ? (double?)property.Reviews.Average(r => r.Rating)
    : null;

        return new PropertyDto
        {
            PropertyId = property.PropertyId,
            OwnerId = property.OwnerId,
            Title = property.Title,
            Description = property.Description ?? "",
            PropertyType = property.PropertyType,
            Price = property.Price,
            Location = property.Location,
            City = property.City,
            State = property.State,
            Latitude = property.Latitude,
            Longitude = property.Longitude,
            Bedrooms = property.Bedrooms,
            Bathrooms = property.Bathrooms,
            AreaSqft = property.AreaSqft,
            Status = property.Status,
            ListedDate = property.ListedDate,
            VerificationStatus = property.VerificationStatus,
            VerificationNotes = property.VerificationNotes,
            Amenities = amenities,
            Images = property.Images?.Select(i => new PropertyImageDto
            {
                ImageId = i.ImageId,
                PropertyId = i.PropertyId,
                ImageUrl = i.ImageUrl,
                DisplayOrder = i.DisplayOrder
            }).ToList() ?? new List<PropertyImageDto>(),
            Documents = property.Documents?.Select(d => new PropertyDocumentDto
            {
                DocumentId = d.DocumentId,
                PropertyId = d.PropertyId,
                DocumentType = d.DocumentType,
                DocumentUrl = d.DocumentUrl,
                DocumentName = d.DocumentName,
                UploadedDate = d.UploadedDate,
                Verified = d.Verified,
                VerificationNotes = d.VerificationNotes
            }).ToList() ?? new List<PropertyDocumentDto>(),
            AverageRating = averageRating,
            ReviewCount = property.Reviews?.Count ?? 0,
            OwnerName = property.Owner?.FullName ?? "Unknown Seller",
            OwnerEmail = property.Owner?.Email,
            OwnerProfilePicture = property.Owner?.ProfilePictureUrl
        };
    }
}
