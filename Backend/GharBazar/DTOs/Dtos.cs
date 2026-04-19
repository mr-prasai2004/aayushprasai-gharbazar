namespace GharBazar.API.DTOs;

// Auth DTOs
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "BUYER";
    public string? PhoneNumber { get; set; }
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}


public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class ResendOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

// User DTOs
public class UserDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Bio { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Property DTOs
public class PropertyCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PropertyType { get; set; } = "House";
    public string ListingType { get; set; } = "For Sale"; // For Sale, For Rent, Lease
    public decimal Price { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public decimal? AreaSqft { get; set; }
    public List<string> Amenities { get; set; } = new();
    public List<CreatePropertyImageDto> Images { get; set; } = new();
    public List<CreatePropertyDocumentDto> Documents { get; set; } = new();
}

public class CreatePropertyImageDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class CreatePropertyDocumentDto
{
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
}

public class PropertyUpdateRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public decimal? AreaSqft { get; set; }
    public List<string>? Amenities { get; set; }
    public string? Status { get; set; } // For Sale, For Rent, Sold, Rented, Leased, Withdrawn
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class PropertyDto
{
    public string PropertyId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PropertyType { get; set; } = string.Empty;
    public string ListingType { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public decimal? AreaSqft { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime ListedDate { get; set; }
    public string VerificationStatus { get; set; } = string.Empty;
    public string? VerificationNotes { get; set; }
    public List<string> Amenities { get; set; } = new();
    public List<PropertyImageDto> Images { get; set; } = new();
    public List<PropertyDocumentDto> Documents { get; set; } = new();
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerProfilePicture { get; set; }
}

public class PropertyImageDto
{
    public string ImageId { get; set; } = string.Empty;
    public string PropertyId { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class PropertyDocumentDto
{
    public string DocumentId { get; set; } = string.Empty;
    public string PropertyId { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public DateTime UploadedDate { get; set; }
    public bool Verified { get; set; }
    public string? VerificationNotes { get; set; }
}

// Notification DTOs
public class NotificationDto
{
    public string NotificationId { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string? PropertyId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? PropertyTitle { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool Read { get; set; }
    public string? ActionNotes { get; set; }
}

public class NotificationCreateRequest
{
    public string OwnerId { get; set; } = string.Empty;
    public string? PropertyId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? PropertyTitle { get; set; }
    public string? ActionNotes { get; set; }
}

// Review DTOs
public class ReviewDto
{
    public string ReviewId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string PropertyId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UserName { get; set; }
}

public class ReviewCreateRequest
{
    public string PropertyId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

// Document Upload DTO
public class DocumentUploadRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentName { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
}

// Verification DTO
public class PropertyVerificationRequest
{
    public string? VerificationStatus { get; set; }
    public string? VerificationNotes { get; set; }
}

public class MessageDto
{
    public string MessageId { get; set; } = string.Empty;
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string? SenderProfilePicture { get; set; }
    public string ReceiverId { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string? ReceiverProfilePicture { get; set; }
    public string? PropertyId { get; set; }
    public string? PropertyTitle { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MessageCreateRequest
{
    public string ReceiverId { get; set; } = string.Empty;
    public string? PropertyId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class ConversationDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserProfilePicture { get; set; }
    public MessageDto LastMessage { get; set; } = new();
    public int UnreadCount { get; set; }
}

// Tour Booking DTOs
public class CreateTourBookingRequest
{
    public string PropertyId { get; set; } = string.Empty;
    public string TourDate { get; set; } = string.Empty; // YYYY-MM-DD
    public string TourTime { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class TourBookingDto
{
    public string BookingId { get; set; } = string.Empty;
    public string PropertyId { get; set; } = string.Empty;
    public string PropertyTitle { get; set; } = string.Empty;
    public string PropertyLocation { get; set; } = string.Empty;
    public string? PropertyImage { get; set; }
    public string BuyerId { get; set; } = string.Empty;
    public string BuyerName { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public string TourDate { get; set; } = string.Empty;
    public string TourTime { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

