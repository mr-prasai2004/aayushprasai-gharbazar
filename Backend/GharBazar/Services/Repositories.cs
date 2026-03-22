using Microsoft.EntityFrameworkCore;
using GharBazar.API.Data;
using GharBazar.API.Models;

namespace GharBazar.API.Services;

public class UserRepository : IUserRepository
{
    private readonly GharBazarDbContext _context;

    public UserRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string userId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByUserNameAsync(string userName)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
    }

    public async Task<User?> GetByAsync(System.Linq.Expressions.Expression<Func<User, bool>> predicate)
    {
        return await _context.Users.FirstOrDefaultAsync(predicate);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users.Where(u => u.IsActive).ToListAsync();
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public Task UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string userId)
    {
        var user = await GetByIdAsync(userId);
        if (user != null)
        {
            _context.Users.Remove(user);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class PropertyRepository : IPropertyRepository
{
    private readonly GharBazarDbContext _context;

    public PropertyRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<Property?> GetByIdAsync(string propertyId)
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Reviews)
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.PropertyId == propertyId);
    }

    public async Task<List<Property>> GetAllAsync()
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Reviews)
            .Include(p => p.Owner)
            .Where(p => p.VerificationStatus == "verified")
            .OrderByDescending(p => p.ListedDate)
            .ToListAsync();
    }

    public async Task<List<Property>> GetByOwnerAsync(string ownerId)
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Owner)
            .Where(p => p.OwnerId == ownerId)
            .OrderByDescending(p => p.ListedDate)
            .ToListAsync();
    }

    public async Task<List<Property>> GetPendingAsync()
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Owner)
            .Where(p => p.VerificationStatus == "pending")
            .OrderByDescending(p => p.ListedDate)
            .ToListAsync();
    }

    public async Task<List<Property>> GetVerifiedAsync()
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Owner)
            .Where(p => p.VerificationStatus == "verified")
            .OrderByDescending(p => p.ListedDate)
            .ToListAsync();
    }

    public async Task<List<Property>> GetByStatusAsync(string status)
    {
        return await _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Owner)
            .Where(p => p.Status == status && p.VerificationStatus == "verified")
            .OrderByDescending(p => p.ListedDate)
            .ToListAsync();
    }

    public async Task<List<Property>> SearchAsync(string query, string? city = null, decimal? minPrice = null, decimal? maxPrice = null)
    {
        var dbQuery = _context.Properties
            .Include(p => p.Images)
            .Include(p => p.Documents)
            .Include(p => p.Owner)
            .Where(p => p.VerificationStatus == "verified")
            .AsQueryable();

        if (!string.IsNullOrEmpty(query))
        {
            dbQuery = dbQuery.Where(p =>
                EF.Functions.Like(p.Title, $"%{query}%") ||
                EF.Functions.Like(p.Description, $"%{query}%") ||
                EF.Functions.Like(p.Location, $"%{query}%")
            );
        }

        if (!string.IsNullOrEmpty(city))
        {
            dbQuery = dbQuery.Where(p => p.City == city);
        }

        if (minPrice.HasValue)
        {
            dbQuery = dbQuery.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            dbQuery = dbQuery.Where(p => p.Price <= maxPrice.Value);
        }

        return await dbQuery.OrderByDescending(p => p.ListedDate).ToListAsync();
    }

    public async Task AddAsync(Property property)
    {
        await _context.Properties.AddAsync(property);
    }

    public Task UpdateAsync(Property property)
    {
        property.UpdatedAt = DateTime.UtcNow;
        _context.Properties.Update(property);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string propertyId)
    {
        var property = await GetByIdAsync(propertyId);
        if (property != null)
        {
            _context.Properties.Remove(property);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class PropertyDocumentRepository : IPropertyDocumentRepository
{
    private readonly GharBazarDbContext _context;

    public PropertyDocumentRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<PropertyDocument?> GetByIdAsync(string documentId)
    {
        return await _context.PropertyDocuments.FirstOrDefaultAsync(d => d.DocumentId == documentId);
    }

    public async Task<List<PropertyDocument>> GetByPropertyAsync(string propertyId)
    {
        return await _context.PropertyDocuments
            .Where(d => d.PropertyId == propertyId)
            .OrderByDescending(d => d.UploadedDate)
            .ToListAsync();
    }

    public async Task AddAsync(PropertyDocument document)
    {
        await _context.PropertyDocuments.AddAsync(document);
    }

    public Task UpdateAsync(PropertyDocument document)
    {
        _context.PropertyDocuments.Update(document);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string documentId)
    {
        var document = await GetByIdAsync(documentId);
        if (document != null)
        {
            _context.PropertyDocuments.Remove(document);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class PropertyImageRepository : IPropertyImageRepository
{
    private readonly GharBazarDbContext _context;

    public PropertyImageRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<PropertyImage?> GetByIdAsync(string imageId)
    {
        return await _context.PropertyImages.FirstOrDefaultAsync(i => i.ImageId == imageId);
    }

    public async Task<List<PropertyImage>> GetByPropertyAsync(string propertyId)
    {
        return await _context.PropertyImages
            .Where(i => i.PropertyId == propertyId)
            .OrderBy(i => i.DisplayOrder)
            .ToListAsync();
    }

    public async Task AddAsync(PropertyImage image)
    {
        await _context.PropertyImages.AddAsync(image);
    }

    public async Task DeleteAsync(string imageId)
    {
        var image = await GetByIdAsync(imageId);
        if (image != null)
        {
            _context.PropertyImages.Remove(image);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class NotificationRepository : INotificationRepository
{
    private readonly GharBazarDbContext _context;

    public NotificationRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<Notification?> GetByIdAsync(string notificationId)
    {
        return await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId);
    }

    public async Task<List<Notification>> GetByUserAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.OwnerId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Notification>> GetUnreadByUserAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.OwnerId == userId && n.ReadAt == null)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
    }

    public Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string notificationId)
    {
        var notification = await GetByIdAsync(notificationId);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class ReviewRepository : IReviewRepository
{
    private readonly GharBazarDbContext _context;

    public ReviewRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(string reviewId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReviewId == reviewId);
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetByPropertyAsync(string propertyId)
    {
        return await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.PropertyId == propertyId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Review>> GetByUserAsync(string userId)
    {
        return await _context.Reviews
            .Include(r => r.Property)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Review review)
    {
        await _context.Reviews.AddAsync(review);
    }

    public Task UpdateAsync(Review review)
    {
        review.UpdatedAt = DateTime.UtcNow;
        _context.Reviews.Update(review);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string reviewId)
    {
        var review = await GetByIdAsync(reviewId);
        if (review != null)
        {
            _context.Reviews.Remove(review);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class WishlistRepository : IWishlistRepository
{
    private readonly GharBazarDbContext _context;

    public WishlistRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistItem?> GetByIdAsync(string wishlistId)
    {
        return await _context.WishlistItems.FirstOrDefaultAsync(w => w.WishlistId == wishlistId);
    }

    public async Task<List<WishlistItem>> GetByUserAsync(string userId)
    {
        return await _context.WishlistItems
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> IsInWishlistAsync(string userId, string propertyId)
    {
        return await _context.WishlistItems
            .AnyAsync(w => w.UserId == userId && w.PropertyId == propertyId);
    }

    public async Task AddAsync(WishlistItem item)
    {
        await _context.WishlistItems.AddAsync(item);
    }

    public async Task DeleteAsync(string wishlistId)
    {
        var item = await GetByIdAsync(wishlistId);
        if (item != null)
        {
            _context.WishlistItems.Remove(item);
        }
    }

    public async Task RemoveAsync(string userId, string propertyId)
    {
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.PropertyId == propertyId);
        if (item != null)
        {
            _context.WishlistItems.Remove(item);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class MessageRepository : IMessageRepository
{
    private readonly GharBazarDbContext _context;

    public MessageRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<Message?> GetByIdAsync(string messageId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Include(m => m.Property)
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
    }

    public async Task<List<Message>> GetConversationsAsync(string userId)
    {
        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Include(m => m.Property)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return messages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => g.First())
            .ToList();
    }

    public async Task<List<Message>> GetMessagesAsync(string userId1, string userId2)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Include(m => m.Property)
            .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                        (m.SenderId == userId2 && m.ReceiverId == userId1))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Messages
            .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
    }

    public async Task AddAsync(Message message)
    {
        await _context.Messages.AddAsync(message);
    }

    public Task UpdateAsync(Message message)
    {
        _context.Messages.Update(message);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string messageId)
    {
        var message = await GetByIdAsync(messageId);
        if (message != null)
        {
            _context.Messages.Remove(message);
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

public class TourBookingRepository : ITourBookingRepository
{
    private readonly GharBazarDbContext _context;

    public TourBookingRepository(GharBazarDbContext context)
    {
        _context = context;
    }

    public async Task<TourBooking?> GetByIdAsync(string bookingId)
    {
        return await _context.TourBookings
            .Include(t => t.Buyer)
            .Include(t => t.Seller)
            .Include(t => t.Property)
                .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(t => t.BookingId == bookingId);
    }

    public async Task<List<TourBooking>> GetByBuyerAsync(string buyerId)
    {
        return await _context.TourBookings
            .Include(t => t.Seller)
            .Include(t => t.Property)
                .ThenInclude(p => p.Images)
            .Where(t => t.BuyerId == buyerId)
            .OrderByDescending(t => t.TourDate)
            .ToListAsync();
    }

    public async Task<List<TourBooking>> GetBySellerAsync(string sellerId)
    {
        return await _context.TourBookings
            .Include(t => t.Buyer)
            .Include(t => t.Property)
                .ThenInclude(p => p.Images)
            .Where(t => t.SellerId == sellerId)
            .OrderByDescending(t => t.TourDate)
            .ToListAsync();
    }

    public async Task AddAsync(TourBooking booking)
    {
        await _context.TourBookings.AddAsync(booking);
    }

    public Task UpdateAsync(TourBooking booking)
    {
        _context.TourBookings.Update(booking);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(string bookingId)
    {
        var booking = await GetByIdAsync(bookingId);
        if (booking != null)
            _context.TourBookings.Remove(booking);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}

