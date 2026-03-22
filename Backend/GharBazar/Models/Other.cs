using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GharBazar.API.Models;

[Table("notifications")]
public class Notification
{
    [Key]
    [Column("notification_id")]
    public string NotificationId { get; set; } = Guid.NewGuid().ToString();

    [Column("owner_id")]
    [Required]
    public string OwnerId { get; set; } = string.Empty;

    [Column("property_id")]
    public string? PropertyId { get; set; }

    [Column("type")]
    [Required]
    public string Type { get; set; } = string.Empty; // approved, rejected, verification_required, message

    [Column("title")]
    [Required]
    public string Title { get; set; } = string.Empty;

    [Column("message")]
    [Required]
    public string Message { get; set; } = string.Empty;

    [Column("property_title")]
    public string? PropertyTitle { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("read_at")]
    public DateTime? ReadAt { get; set; }

    [Column("action_notes")]
    public string? ActionNotes { get; set; }

    // Navigation properties
    [ForeignKey("OwnerId")]
    [JsonIgnore]
    public virtual User? Owner { get; set; }

    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }

    [NotMapped]
    public bool Read => ReadAt.HasValue;
}

[Table("reviews")]
public class Review
{
    [Key]
    [Column("review_id")]
    public string ReviewId { get; set; } = Guid.NewGuid().ToString();

    [Column("user_id")]
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Column("property_id")]
    [Required]
    public string PropertyId { get; set; } = string.Empty;

    [Column("rating")]
    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    [JsonIgnore]
    public virtual User? User { get; set; }

    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}

[Table("wishlist")]
public class WishlistItem
{
    [Key]
    [Column("wishlist_id")]
    public string WishlistId { get; set; } = Guid.NewGuid().ToString();

    [Column("user_id")]
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Column("property_id")]
    [Required]
    public string PropertyId { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    [JsonIgnore]
    public virtual User? User { get; set; }

    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}

[Table("messages")]
public class Message
{
    [Key]
    [Column("message_id")]
    public string MessageId { get; set; } = Guid.NewGuid().ToString();

    [Column("sender_id")]
    [Required]
    public string SenderId { get; set; } = string.Empty;

    [Column("receiver_id")]
    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    [Column("property_id")]
    public string? PropertyId { get; set; }

    [Column("content")]
    [Required]
    public string Content { get; set; } = string.Empty;

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("SenderId")]
    [JsonIgnore]
    public virtual User? Sender { get; set; }

    [ForeignKey("ReceiverId")]
    [JsonIgnore]
    public virtual User? Receiver { get; set; }

    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}

[Table("tour_bookings")]
public class TourBooking
{
    [Key]
    [Column("booking_id")]
    public string BookingId { get; set; } = Guid.NewGuid().ToString();

    [Column("buyer_id")]
    [Required]
    public string BuyerId { get; set; } = string.Empty;

    [Column("property_id")]
    [Required]
    public string PropertyId { get; set; } = string.Empty;

    [Column("seller_id")]
    [Required]
    public string SellerId { get; set; } = string.Empty;

    [Column("tour_date")]
    [Required]
    public DateTime TourDate { get; set; }

    [Column("tour_time")]
    [Required]
    public string TourTime { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BuyerId")]
    [JsonIgnore]
    public virtual User? Buyer { get; set; }

    [ForeignKey("SellerId")]
    [JsonIgnore]
    public virtual User? Seller { get; set; }

    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}

