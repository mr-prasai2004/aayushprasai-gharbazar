using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GharBazar.API.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public string UserId { get; set; } = Guid.NewGuid().ToString();

    [Column("user_name")]
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Column("email")]
    [Required]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash")]
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    [Required]
    public string Role { get; set; } = "BUYER"; // BUYER, SELLER, ADMIN

    [Column("full_name")]
    public string? FullName { get; set; }

    [Column("phone_number")]
    public string? PhoneNumber { get; set; }

    [Column("profile_picture_url")]
    public string? ProfilePictureUrl { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("password_reset_token")]
    public string? PasswordResetToken { get; set; }

    [Column("password_reset_token_expiry")]
    public DateTime? PasswordResetTokenExpiry { get; set; }

    [Column("email_otp")]
    public string? EmailOtp { get; set; }

    [Column("email_otp_expiry")]
    public DateTime? EmailOtpExpiry { get; set; }

    [Column("is_email_verified")]
    public bool IsEmailVerified { get; set; } = false;

    // Navigation properties
    public virtual ICollection<Property>? Properties { get; set; }
    public virtual ICollection<Review>? Reviews { get; set; }
    public virtual ICollection<Notification>? Notifications { get; set; }
    public virtual ICollection<WishlistItem>? WishlistItems { get; set; }
    public virtual ICollection<Message>? SentMessages { get; set; }
    public virtual ICollection<Message>? ReceivedMessages { get; set; }
}
