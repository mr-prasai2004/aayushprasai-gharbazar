using Microsoft.EntityFrameworkCore;
using GharBazar.API.Models;

namespace GharBazar.API.Data;

public class GharBazarDbContext : DbContext
{
    public GharBazarDbContext(DbContextOptions<GharBazarDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Property> Properties { get; set; }
    public DbSet<PropertyImage> PropertyImages { get; set; }
    public DbSet<PropertyDocument> PropertyDocuments { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<WishlistItem> WishlistItems { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<TourBooking> TourBookings { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        
        // Configure warnings for query splitting behavior
        optionsBuilder.ConfigureWarnings(w =>
            w.Log(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.MultipleCollectionIncludeWarning)
        );
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure all string properties to use utf8mb4_unicode_ci collation
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
            {
                if (property.ClrType == typeof(string))
                {
                    property.SetColumnType("varchar(255)");
                    property.SetCollation("utf8mb4_unicode_ci");
                }
            }
        }

        // User configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        // Property relationships
        modelBuilder.Entity<Property>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Properties)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.Images)
            .WithOne(pi => pi.Property)
            .HasForeignKey(pi => pi.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.Documents)
            .WithOne(pd => pd.Property)
            .HasForeignKey(pd => pd.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.Reviews)
            .WithOne(r => r.Property)
            .HasForeignKey(r => r.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.Notifications)
            .WithOne(n => n.Property)
            .HasForeignKey(n => n.PropertyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.WishlistItems)
            .WithOne(w => w.Property)
            .HasForeignKey(w => w.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .HasMany(p => p.Messages)
            .WithOne(m => m.Property)
            .HasForeignKey(m => m.PropertyId)
            .OnDelete(DeleteBehavior.SetNull);

        // Notification configuration
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Owner)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Review configuration
        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Wishlist configuration
        modelBuilder.Entity<WishlistItem>()
            .HasOne(w => w.User)
            .WithMany(u => u.WishlistItems)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WishlistItem>()
            .HasIndex(w => new { w.UserId, w.PropertyId })
            .IsUnique();

        // Message configuration
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Cascade);

        // TourBooking configuration
        modelBuilder.Entity<TourBooking>()
            .HasOne(t => t.Buyer)
            .WithMany()
            .HasForeignKey(t => t.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TourBooking>()
            .HasOne(t => t.Property)
            .WithMany()
            .HasForeignKey(t => t.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TourBooking>()
            .HasOne(t => t.Seller)
            .WithMany()
            .HasForeignKey(t => t.SellerId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
