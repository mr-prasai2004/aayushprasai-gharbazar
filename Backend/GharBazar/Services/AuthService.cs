using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using GharBazar.API.Models;
using BCrypt.Net;

namespace GharBazar.API.Services;

public interface IAuthService
{
    Task<(bool Success, string? Token, string? Error)> LoginAsync(string email, string password);
    Task<(bool Success, string? UserId, string? Otp, string? Error)> RegisterAsync(string userName, string email, string password, string fullName, string role);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateJwtToken(User user, string secretKey, string issuer, string audience);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<(bool Success, string? Token, string? Error)> LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null || !user.IsActive)
        {
            return (false, null, "Invalid email or password");
        }

        if (!user.IsEmailVerified)
        {
            return (false, null, "Please verify your email address to continue. Check your inbox for the OTP.");
        }

        var isPasswordValid = VerifyPassword(password, user.PasswordHash);
        
        if (!isPasswordValid)
        {
            return (false, null, "Invalid email or password");
        }

        return (true, user.UserId, null);
    }

    public async Task<(bool Success, string? UserId, string? Otp, string? Error)> RegisterAsync(
        string userName, string email, string password, string fullName, string role)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null)
        {
            return (false, null, null, "Email already registered");
        }

        var existingUserName = await _userRepository.GetByUserNameAsync(userName);
        if (existingUserName != null)
        {
            return (false, null, null, $"Username '{userName}' is already taken. Please try a different one.");
        }

        var otp = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = userName,
            Email = email,
            PasswordHash = HashPassword(password),
            FullName = fullName,
            Role = role,
            IsActive = true,
            IsEmailVerified = false,
            EmailOtp = otp,
            EmailOtpExpiry = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return (true, user.UserId, otp, null);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public string GenerateJwtToken(User user, string secretKey, string issuer, string audience)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(secretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserName", user.UserName)
            }),
            Expires = DateTime.UtcNow.AddHours(24),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
