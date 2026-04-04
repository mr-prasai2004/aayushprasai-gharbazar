using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GharBazar.API.DTOs;
using GharBazar.API.Services;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    // GET: api/users - Get all users (Admin only)
    [HttpGet]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        
        var userDtos = users.Select(u => new UserDto
        {
            UserId = u.UserId,
            UserName = u.UserName,
            Email = u.Email,
            Role = u.Role,
            FullName = u.FullName,
            PhoneNumber = u.PhoneNumber,
            ProfilePictureUrl = u.ProfilePictureUrl,
            Bio = u.Bio,
            Address = u.Address,
            CreatedAt = u.CreatedAt
        }).ToList();

        return Ok(userDtos);
    }

    // GET: api/users/{id} - Get user by ID
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetById(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(new UserDto
        {
            UserId = user.UserId,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Address = user.Address,
            CreatedAt = user.CreatedAt
        });
    }

    // DELETE: api/users/{id} - Delete user (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult> Delete(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        await _userRepository.DeleteAsync(id);
        await _userRepository.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/users/profile - Get current user profile
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(new UserDto
        {
            UserId = user.UserId,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Address = user.Address,
            CreatedAt = user.CreatedAt
        });
    }

    // PUT: api/users/profile - Update user profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        user.FullName = request.FullName ?? user.FullName;
        user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
        user.Address = request.Address ?? user.Address;
        user.Bio = request.Bio ?? user.Bio;
        user.ProfilePictureUrl = request.ProfilePictureUrl ?? user.ProfilePictureUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new UserDto
        {
            UserId = user.UserId,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Address = user.Address,
            CreatedAt = user.CreatedAt
        });
    }

    // PUT: api/users/{id}/role - Update user role (Admin only)
    [HttpPut("{id}/role")]
    [Authorize(Roles = "ADMIN")]
    public async Task<ActionResult<UserDto>> UpdateRole(string id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (!new[] { "BUYER", "SELLER", "ADMIN" }.Contains(request.Role?.ToUpper()))
            return BadRequest(new { message = "Invalid role. Must be BUYER, SELLER, or ADMIN" });

        user.Role = request.Role!.ToUpper();
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new UserDto
        {
            UserId = user.UserId,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Address = user.Address,
            CreatedAt = user.CreatedAt
        });
    }
}

public class UpdateRoleRequest
{
    public string? Role { get; set; }
}
