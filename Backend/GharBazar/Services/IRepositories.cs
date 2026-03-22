using GharBazar.API.Models;

namespace GharBazar.API.Services;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string userId);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUserNameAsync(string userName);
    Task<User?> GetByAsync(System.Linq.Expressions.Expression<Func<User, bool>> predicate);
    Task<List<User>> GetAllAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(string userId);
    Task SaveChangesAsync();
}

public interface IPropertyRepository
{
    Task<Property?> GetByIdAsync(string propertyId);
    Task<List<Property>> GetAllAsync();
    Task<List<Property>> GetByOwnerAsync(string ownerId);
    Task<List<Property>> GetPendingAsync();
    Task<List<Property>> GetVerifiedAsync();
    Task<List<Property>> GetByStatusAsync(string status);
    Task<List<Property>> SearchAsync(string query, string? city = null, decimal? minPrice = null, decimal? maxPrice = null);
    Task AddAsync(Property property);
    Task UpdateAsync(Property property);
    Task DeleteAsync(string propertyId);
    Task SaveChangesAsync();
}

public interface IPropertyImageRepository
{
    Task<PropertyImage?> GetByIdAsync(string imageId);
    Task<List<PropertyImage>> GetByPropertyAsync(string propertyId);
    Task AddAsync(PropertyImage image);
    Task DeleteAsync(string imageId);
    Task SaveChangesAsync();
}

public interface IPropertyDocumentRepository
{
    Task<PropertyDocument?> GetByIdAsync(string documentId);
    Task<List<PropertyDocument>> GetByPropertyAsync(string propertyId);
    Task AddAsync(PropertyDocument document);
    Task UpdateAsync(PropertyDocument document);
    Task DeleteAsync(string documentId);
    Task SaveChangesAsync();
}

public interface INotificationRepository
{
    Task<Notification?> GetByIdAsync(string notificationId);
    Task<List<Notification>> GetByUserAsync(string userId);
    Task<List<Notification>> GetUnreadByUserAsync(string userId);
    Task AddAsync(Notification notification);
    Task UpdateAsync(Notification notification);
    Task DeleteAsync(string notificationId);
    Task SaveChangesAsync();
}

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(string reviewId);
    Task<List<Review>> GetAllAsync();
    Task<List<Review>> GetByPropertyAsync(string propertyId);
    Task<List<Review>> GetByUserAsync(string userId);
    Task AddAsync(Review review);
    Task UpdateAsync(Review review);
    Task DeleteAsync(string reviewId);
    Task SaveChangesAsync();
}

public interface IWishlistRepository
{
    Task<WishlistItem?> GetByIdAsync(string wishlistId);
    Task<List<WishlistItem>> GetByUserAsync(string userId);
    Task<bool> IsInWishlistAsync(string userId, string propertyId);
    Task AddAsync(WishlistItem item);
    Task DeleteAsync(string wishlistId);
    Task RemoveAsync(string userId, string propertyId);
    Task SaveChangesAsync();
}

public interface IMessageRepository
{
    Task<Message?> GetByIdAsync(string messageId);
    Task<List<Message>> GetConversationsAsync(string userId);
    Task<List<Message>> GetMessagesAsync(string userId1, string userId2);
    Task<int> GetUnreadCountAsync(string userId);
    Task AddAsync(Message message);
    Task UpdateAsync(Message message);
    Task DeleteAsync(string messageId);
    Task SaveChangesAsync();
}

public interface ITourBookingRepository
{
    Task<TourBooking?> GetByIdAsync(string bookingId);
    Task<List<TourBooking>> GetByBuyerAsync(string buyerId);
    Task<List<TourBooking>> GetBySellerAsync(string sellerId);
    Task AddAsync(TourBooking booking);
    Task UpdateAsync(TourBooking booking);
    Task DeleteAsync(string bookingId);
    Task SaveChangesAsync();
}
