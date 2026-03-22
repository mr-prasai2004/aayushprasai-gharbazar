using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IUserRepository _userRepository;

    public ReviewsController(IReviewRepository reviewRepository, IUserRepository userRepository)
    {
        _reviewRepository = reviewRepository;
        _userRepository = userRepository;
    }

    [HttpGet("property/{propertyId}")]
    public async Task<ActionResult<List<ReviewDto>>> GetByProperty(string propertyId)
    {
        var reviews = await _reviewRepository.GetByPropertyAsync(propertyId);
        return Ok(reviews.Select(MapToReviewDto));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetAll()
    {
        var reviews = await _reviewRepository.GetAllAsync();
        return Ok(reviews.Select(MapToReviewDto));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] ReviewCreateRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var review = new Review
        {
            ReviewId = Guid.NewGuid().ToString(),
            UserId = userId,
            PropertyId = request.PropertyId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.AddAsync(review);
        await _reviewRepository.SaveChangesAsync();

        // Fetch user to populate in response
        review.User = await _userRepository.GetByIdAsync(userId);
        
        return CreatedAtAction(nameof(GetByProperty), new { propertyId = review.PropertyId }, MapToReviewDto(review));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        var review = await _reviewRepository.GetByIdAsync(id);
        if (review == null)
        {
            return NotFound();
        }

        await _reviewRepository.DeleteAsync(id);
        await _reviewRepository.SaveChangesAsync();

        return NoContent();
    }

    private static ReviewDto MapToReviewDto(Review review)
    {
        return new ReviewDto
        {
            ReviewId = review.ReviewId,
            UserId = review.UserId,
            UserName = review.User?.UserName ?? "Unknown",
            PropertyId = review.PropertyId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
