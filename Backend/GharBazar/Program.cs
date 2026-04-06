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
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found. Set the ConnectionStrings__DefaultConnection environment variable.");

builder.Services.AddDbContext<GharBazarDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
);

// ── Authentication & Authorization ─────────────────────────────────────────
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey not configured. Set the Jwt__SecretKey environment variable.");
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
// Read allowed origins from env var (comma-separated) for production
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

// ── Auto-apply EF Core migrations on startup ───────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GharBazarDbContext>();
    db.Database.Migrate();
}

// ── WebSocket support ──────────────────────────────────────────────────────
app.UseWebSockets();

// ── HTTP pipeline ──────────────────────────────────────────────────────────

// Always enable Swagger (useful in production for testing)
app.UseSwagger();
app.UseSwaggerUI();

// Health check endpoint (used by railway.toml healthcheckPath)
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

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
