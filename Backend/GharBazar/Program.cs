using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using GharBazar.API.Data;
using GharBazar.API.Services;
using GharBazar.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// Railway Port Binding
// ===============================
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ===============================
// Request Size Limits
// ===============================
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 52428800; // 50 MB
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 52428800; // 50 MB
});

// ===============================
// Controllers
// ===============================
builder.Services.AddControllers();

// ===============================
// Database
// ===============================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? throw new Exception("❌ DefaultConnection missing in Railway variables");

builder.Services.AddDbContext<GharBazarDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
);

// ===============================
// JWT Authentication
// ===============================
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? Environment.GetEnvironmentVariable("Jwt__SecretKey")
    ?? throw new Exception("❌ Jwt:SecretKey missing in Railway variables");

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

// ===============================
// CORS
// ===============================
var originString = builder.Configuration["AllowedOrigins"] 
    ?? Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") 
    ?? "";

var allowedOriginsList = originString
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .ToList();

// Always allow standard frontends to prevent CORS issues
allowedOriginsList.Add("http://localhost:5173");
allowedOriginsList.Add("http://localhost:5000");
allowedOriginsList.Add("https://gharbaazaar.netlify.app");

var allowedOrigins = allowedOriginsList
    .Select(o => o.TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

// Log at startup so Railway logs show the exact value loaded
Console.WriteLine($"✅ CORS allowed origins ({allowedOrigins.Length}): {string.Join(" | ", allowedOrigins)}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
                allowedOrigins.Any(allowed =>
                    string.Equals(origin.TrimEnd('/'), allowed, StringComparison.OrdinalIgnoreCase)))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ===============================
// Services
// ===============================
// EmailSettings — reads from appsettings.json first, then Railway env vars
// Railway injects env vars like: EmailSettings__SmtpHost, EmailSettings__SmtpPort,
// EmailSettings__SenderName, EmailSettings__SenderEmail, EmailSettings__Password
// .NET configuration automatically maps __ to nested keys, so GetSection works.
// Explicit env-var fallback below is a safety net for any edge cases.
var emailSettings = builder.Configuration
    .GetSection("EmailSettings")
    .Get<EmailSettings>() ?? new EmailSettings();

// Explicit per-field env-var fallback (for Railway)
if (string.IsNullOrWhiteSpace(emailSettings.SmtpHost))
    emailSettings.SmtpHost = Environment.GetEnvironmentVariable("EmailSettings__SmtpHost") ?? "";
if (emailSettings.SmtpPort == 0 && int.TryParse(Environment.GetEnvironmentVariable("EmailSettings__SmtpPort"), out var smtpPort))
    emailSettings.SmtpPort = smtpPort;
if (string.IsNullOrWhiteSpace(emailSettings.SenderName))
    emailSettings.SenderName = Environment.GetEnvironmentVariable("EmailSettings__SenderName") ?? "";
if (string.IsNullOrWhiteSpace(emailSettings.SenderEmail))
    emailSettings.SenderEmail = Environment.GetEnvironmentVariable("EmailSettings__SenderEmail") ?? "";
if (string.IsNullOrWhiteSpace(emailSettings.Password))
    emailSettings.Password = Environment.GetEnvironmentVariable("EmailSettings__Password") ?? "";

if (string.IsNullOrWhiteSpace(emailSettings.ResendApiKey))
    emailSettings.ResendApiKey = Environment.GetEnvironmentVariable("EmailSettings__ResendApiKey") ?? "";
Console.WriteLine($"✅ EmailSettings loaded — Host: {emailSettings.SmtpHost}, Port: {emailSettings.SmtpPort}, From: {emailSettings.SenderEmail}, HasPassword: {!string.IsNullOrWhiteSpace(emailSettings.Password)}");

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

// ===============================
// Swagger
// ===============================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ===============================
// Auto Migration
// ===============================
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<GharBazarDbContext>();
    db.Database.Migrate();
    app.Logger.LogInformation("✅ Database migrations applied successfully.");
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "❌ Database migration failed.");
}

// ===============================
// WebSockets
// ===============================
app.UseWebSockets();

// ===============================
// Static Files
// ===============================
app.UseStaticFiles();

// ===============================
// Routing → CORS → Auth (correct order)
// ===============================
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ===============================
// WebSocket Middleware
// ===============================
app.UseMiddleware<WebSocketMiddleware>();

// ===============================
// Health Check
// ===============================
app.MapGet("/health", () =>
    Results.Ok(new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow
    })
).RequireCors("AllowFrontend");

// ===============================
// Swagger UI
// ===============================
app.UseSwagger();
app.UseSwaggerUI();

// ===============================
// Controllers
// ===============================
app.MapControllers();

app.Run();