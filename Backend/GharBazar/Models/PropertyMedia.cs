using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GharBazar.API.Models;

[Table("property_images")]
public class PropertyImage
{
    [Key]
    [Column("image_id")]
    public string ImageId { get; set; } = Guid.NewGuid().ToString();

    [Column("property_id")]
    [Required]
    public string PropertyId { get; set; } = string.Empty;

    [Column("image_url")]
    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("display_order")]
    public int DisplayOrder { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}

[Table("property_documents")]
public class PropertyDocument
{
    [Key]
    [Column("document_id")]
    public string DocumentId { get; set; } = Guid.NewGuid().ToString();

    [Column("property_id")]
    [Required]
    public string PropertyId { get; set; } = string.Empty;

    [Column("document_type")]
    [Required]
    public string DocumentType { get; set; } = string.Empty;

    [Column("document_url")]
    [Required]
    public string DocumentUrl { get; set; } = string.Empty;

    [Column("document_name")]
    [Required]
    public string DocumentName { get; set; } = string.Empty;

    [Column("uploaded_date")]
    public DateTime UploadedDate { get; set; } = DateTime.UtcNow;

    [Column("verified")]
    public bool Verified { get; set; } = false;

    [Column("verification_notes")]
    public string? VerificationNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("PropertyId")]
    [JsonIgnore]
    public virtual Property? Property { get; set; }
}
