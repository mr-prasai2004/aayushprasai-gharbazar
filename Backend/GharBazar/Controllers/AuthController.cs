using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly INotificationRepository _notificationRepository;

    public AuthController(
        IAuthService authService,
        IUserRepository userRepository,
        IConfiguration configuration,
        IEmailService emailService,
        INotificationRepository notificationRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
        _configuration = configuration;
        _emailService = emailService;
        _notificationRepository = notificationRepository;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        var (success, userId, error) = await _authService.LoginAsync(request.Email, request.Password);
        if (!success)
        {
            return Unauthorized(new { message = error });
        }

        var user = await _userRepository.GetByIdAsync(userId!);
        if (user == null)
        {
            return Unauthorized(new { message = "User not found" });
        }

        var token = _authService.GenerateJwtToken(
            user,
            _configuration["Jwt:SecretKey"] ?? "your-secret-key-here",
            _configuration["Jwt:Issuer"] ?? "GharBazar",
            _configuration["Jwt:Audience"] ?? "GharBazarUsers"
        );

        return Ok(new LoginResponse
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            Token = token
        });
    }



    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.UserName))
            {
                return BadRequest(new { message = "Email, password, and username are required" });
            }

            var (success, userId, otp, error) = await _authService.RegisterAsync(
                request.UserName,
                request.Email,
                request.Password,
                request.FullName,
                request.Role
            );

            if (!success)
            {
                return BadRequest(new { message = error });
            }

            // Send OTP email
            _ = _emailService.SendEmailAsync(
                request.Email,
                "Verify Your Email Address - GharBazar",
                EmailTemplates.EmailVerificationOtp(otp!)
            );

            return Ok(new { message = "Registration successful. Please check your email for the verification code." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during registration: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                Console.WriteLine($"Inner Stack trace: {ex.InnerException.StackTrace}");
            }
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<LoginResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { message = "Email and OTP are required" });
        }

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid email or OTP" });
        }

        if (user.IsEmailVerified)
        {
            return BadRequest(new { message = "Email is already verified" });
        }

        if (user.EmailOtp != request.Otp || user.EmailOtpExpiry == null || user.EmailOtpExpiry < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Invalid or expired OTP" });
        }

        // Verify successful
        user.IsEmailVerified = true;
        user.EmailOtp = null;
        user.EmailOtpExpiry = null;
        
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        // Send welcome email now that they are verified
        _ = _emailService.SendEmailAsync(
            user.Email,
            "Welcome to GharBazar!",
            EmailTemplates.WelcomeEmail(user.UserName)
        );

        var token = _authService.GenerateJwtToken(
            user,
            _configuration["Jwt:SecretKey"] ?? "your-secret-key-here",
            _configuration["Jwt:Issuer"] ?? "GharBazar",
            _configuration["Jwt:Audience"] ?? "GharBazarUsers"
        );

        return Ok(new LoginResponse
        {
            UserId = user.UserId,
            Email = user.Email,
            Role = user.Role,
            Token = token
        });
    }

    [HttpPost("resend-otp")]
    public async Task<ActionResult<object>> ResendOtp([FromBody] ResendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // For security, don't reveal if email exists
            return Ok(new { message = "If the email is registered, a new OTP has been sent." });
        }

        if (user.IsEmailVerified)
        {
            return BadRequest(new { message = "Email is already verified" });
        }

        var otp = new Random().Next(100000, 999999).ToString();
        user.EmailOtp = otp;
        user.EmailOtpExpiry = DateTime.UtcNow.AddMinutes(15);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        _ = _emailService.SendEmailAsync(
            user.Email,
            "Verify Your Email Address - GharBazar",
            EmailTemplates.EmailVerificationOtp(otp)
        );

        return Ok(new { message = "A new OTP has been sent to your email." });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        return Ok(MapToUserDto(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        user.FullName = request.FullName ?? user.FullName;
        user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
        user.Address = request.Address ?? user.Address;
        user.Bio = request.Bio ?? user.Bio;
        user.ProfilePictureUrl = request.ProfilePictureUrl ?? user.ProfilePictureUrl;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(MapToUserDto(user));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<object>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // For security, don't reveal if email exists
            return Ok(new { message = "If the email exists, a reset link has been sent" });
        }

        // Generate a reset token (in production, use a secure random token and store in DB)
        var resetToken = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var resetLink = $"http://localhost:5173/#/reset-password?token={resetToken}";

        // Send password reset email
        _ = _emailService.SendEmailAsync(
            user.Email,
            "Reset Your Password - GharBazar",
            EmailTemplates.PasswordResetLink(resetLink)
        );

        return Ok(new { message = "If the email exists, a reset link has been sent" });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<object>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Token and new password are required" });
        }

        try
        {
            var user = await _userRepository.GetByAsync(u => u.PasswordResetToken == request.Token);
            if (user == null || user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired reset token" });
            }

            // Hash the new password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordHash = hashedPassword;
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();

            // Verify the password was actually saved
            var verifyUser = await _userRepository.GetByEmailAsync(user.Email);
            if (verifyUser != null)
            {
                var verifyResult = BCrypt.Net.BCrypt.Verify(request.NewPassword, verifyUser.PasswordHash);
                
                if (!verifyResult)
                {
                    return StatusCode(500, new { message = "Password reset failed - verification failed" });
                }
            }

            // Send password changed confirmation email
            _ = _emailService.SendEmailAsync(
                user.Email,
                "Your Password Has Been Reset - GharBazar",
                EmailTemplates.PasswordChangedConfirmation()
            );

            // Create dashboard notification
            var notification = new Notification
            {
                NotificationId = Guid.NewGuid().ToString(),
                OwnerId = user.UserId,
                Type = "password_changed",
                Title = "Password Reset",
                Message = "Your password was reset successfully. If you didn't do this, please contact support immediately.",
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Password has been reset successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<object>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.ConfirmPassword))
        {
            return BadRequest(new { message = "All password fields are required" });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "New password and confirmation do not match" });
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new { message = "New password must be at least 8 characters long" });
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return BadRequest(new { message = "New password must be different from current password" });
        }

        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not found in token" });
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            {
                return Unauthorized(new { message = "Current password is incorrect" });
            }

            // Hash the new password
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordHash = hashedPassword;
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();

            // Verify the password was actually saved
            var verifyUser = await _userRepository.GetByIdAsync(userId);
            if (verifyUser != null)
            {
                var verifyResult = BCrypt.Net.BCrypt.Verify(request.NewPassword, verifyUser.PasswordHash);
                
                if (!verifyResult)
                {
                    return StatusCode(500, new { message = "Password change failed - verification failed" });
                }
            }

            // Send password changed confirmation email
            _ = _emailService.SendEmailAsync(
                user.Email,
                "Your Password Has Been Changed - GharBazar",
                EmailTemplates.PasswordChangedConfirmation()
            );

            // Create dashboard notification
            var notification = new Notification
            {
                NotificationId = Guid.NewGuid().ToString(),
                OwnerId = user.UserId,
                Type = "password_changed",
                Title = "Password Changed",
                Message = "Your password was changed successfully. If you didn't make this change, please reset your password immediately.",
                CreatedAt = DateTime.UtcNow
            };
            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
        }
    }

    private static UserDto MapToUserDto(Models.User user)
    {
        return new UserDto
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
        };
    }
}
