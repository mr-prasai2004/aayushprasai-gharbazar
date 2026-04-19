using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GharBazar.API.Models;

[Table("properties")]
public class Property
{
    [Key]
    [Column("property_id")]
    public string PropertyId { get; set; } = Guid.NewGuid().ToString();

    [Column("owner_id")]
    [Required]
    public string OwnerId { get; set; } = string.Empty;

    [Column("title")]
    [Required]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("property_type")]
    [Required]
    public string PropertyType { get; set; } = "House"; // House, Apartment, Condo, Villa, Land, Commercial

    [Column("price")]
    [Required]
    public decimal Price { get; set; }

    [Column("location")]
    [Required]
    public string Location { get; set; } = string.Empty;

    [Column("city")]
    public string? City { get; set; }

    [Column("state")]
    public string? State { get; set; }

    [Column("latitude")]
    public double? Latitude { get; set; }

    [Column("longitude")]
    public double? Longitude { get; set; }

    [Column("bedrooms")]
    public int Bedrooms { get; set; } = 0;

    [Column("bathrooms")]
    public int Bathrooms { get; set; } = 0;

    [Column("area_sqft")]
    public decimal? AreaSqft { get; set; }

    [Column("listing_type")]
    public string ListingType { get; set; } = "For Sale"; // For Sale, For Rent, Lease

    [Column("status")]
    public string Status { get; set; } = "Pending"; // For Sale, For Rent, Sold, Leased, Pending

    [Column("listed_date")]
    public DateTime ListedDate { get; set; } = DateTime.UtcNow;

    [Column("verification_status")]
    public string VerificationStatus { get; set; } = "pending"; // pending, verified, rejected

    [Column("verification_notes")]
    public string? VerificationNotes { get; set; }

    [Column("amenities")]
    public string? Amenities { get; set; } // JSON stored as string

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("OwnerId")]
    [JsonIgnore]
    public virtual User? Owner { get; set; }

    public virtual ICollection<PropertyImage>? Images { get; set; }
    public virtual ICollection<PropertyDocument>? Documents { get; set; }
    public virtual ICollection<Review>? Reviews { get; set; }
    public virtual ICollection<Notification>? Notifications { get; set; }
    public virtual ICollection<WishlistItem>? WishlistItems { get; set; }
    public virtual ICollection<Message>? Messages { get; set; }
}
