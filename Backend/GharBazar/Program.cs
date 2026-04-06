using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GharBazar.API.Data;
using GharBazar.API.Services;
using GharBazar.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ── Port binding (Railway injects PORT env var) ────────────────────────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://+:{port}");

// ── Request size limits ────────────────────────────────────────────────────
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50 MB
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 52428800; // 50 MB
});

builder.Services.AddControllers();

// ── Database ───────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Database=ghar_bazar;User=root;Password=;";

builder.Services.AddDbContext<GharBazarDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
);

// ── Authentication & Authorization ─────────────────────────────────────────
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? "your-very-long-secret-key-for-jwt-that-should-be-at-least-32-characters-long";
var key = Encoding.ASCII.GetBytes(jwtSecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "GharBazar",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "GharBazarUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ── CORS ───────────────────────────────────────────────────────────────────
var allowedOriginsEnv = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
var productionOrigins = allowedOriginsEnv?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

    options.AddPolicy("AllowLocalhost",
        b => b
            .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000",
                         "http://127.0.0.1:5173", "http://127.0.0.1:5174")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());

    options.AddPolicy("AllowProduction",
        b =>
        {
            if (productionOrigins.Length > 0)
                b.WithOrigins(productionOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
            else
                b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        });
});

// ── Services ───────────────────────────────────────────────────────────────
var emailSettings = builder.Configuration.GetSection("EmailSettings").Get<EmailSettings>() ?? new EmailSettings();
builder.Services.AddSingleton(emailSettings);
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyDocumentRepository, PropertyDocumentRepository>();
builder.Services.AddScoped<IPropertyImageRepository, PropertyImageRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<ITourBookingRepository, TourBookingRepository>();
builder.Services.AddSingleton<IWebSocketManager, GharBazar.API.Services.WebSocketManager>();

// ── Swagger/OpenAPI ────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Auto-apply EF Core migrations on startup (non-fatal) ──────────────────
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<GharBazarDbContext>();
    db.Database.Migrate();
    app.Logger.LogInformation("Database migrations applied successfully.");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Database migration failed. The app will start anyway — check your DB connection string.");
}

// ── WebSocket support ──────────────────────────────────────────────────────
app.UseWebSockets();

// ── Health check endpoint (must be early, before auth) ────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// ── HTTP pipeline ──────────────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI();

// Apply the appropriate CORS policy based on environment
if (app.Environment.IsProduction())
    app.UseCors("AllowProduction");
else
    app.UseCors("AllowLocalhost");

app.UseAuthentication();
app.UseAuthorization();

// WebSocket middleware (after authentication and authorization)
app.UseMiddleware<WebSocketMiddleware>();

// Serve static files from wwwroot (for uploaded images)
app.UseStaticFiles();

app.MapControllers();

app.Run();
