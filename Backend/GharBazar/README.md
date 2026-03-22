# Ghar Bazar - .NET Backend Setup Guide

## Project Overview

The .NET backend for Ghar Bazar is a RESTful API built with ASP.NET Core 8.0, Entity Framework Core, and MySQL. It handles authentication, property management, document uploads, notifications, and admin verification.

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: MySQL 8.0+
- **ORM**: Entity Framework Core 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

1. **.NET 8.0 SDK** - [Download](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
2. **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
3. **Visual Studio 2022** or **VS Code** with C# extension
4. **Node.js** (for running React frontend) - [Download](https://nodejs.org/)

## Setup Instructions

### Step 1: Create MySQL Database

Run the SQL script to create the database schema:

```bash
# Open MySQL Command Line
mysql -u root -p

# Run the schema script
source /path/to/database/schema.sql
```

Or use MySQL Workbench to execute [database/schema.sql](../database/schema.sql)

### Step 2: Clone/Setup .NET Project

```bash
cd GharBazar.API

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build
```

### Step 3: Configure Database Connection

Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ghar_bazar;User=root;Password=YOUR_PASSWORD;"
  },
  "Jwt": {
    "SecretKey": "your-very-long-secret-key-that-should-be-at-least-32-characters",
    "Issuer": "GharBazar",
    "Audience": "GharBazarUsers"
  }
}
```

### Step 4: Run Migrations

```bash
# Update database with migrations
dotnet ef database update

# Or using Package Manager Console in Visual Studio
Update-Database
```

### Step 5: Run the API

```bash
# Development
dotnet run

# With hot reload
dotnet watch run

# The API will be available at https://localhost:7000 or http://localhost:5000
```

### Step 6: Access Swagger Documentation

Open your browser and navigate to: `https://localhost:7000/swagger`

## Project Structure

```
GharBazar.API/
├── Controllers/              # API endpoints
│   ├── AuthController.cs
│   ├── PropertiesController.cs
│   ├── DocumentsController.cs
│   └── NotificationsController.cs
├── Models/                   # Database entities
│   ├── User.cs
│   ├── Property.cs
│   ├── PropertyMedia.cs      # PropertyImage, PropertyDocument
│   └── Other.cs              # Notification, Review, Message, etc.
├── Data/
│   └── GharBazarDbContext.cs # EF Core DbContext
├── DTOs/
│   └── Dtos.cs               # Request/Response DTOs
├── Services/
│   ├── AuthService.cs        # Authentication logic
│   ├── IRepositories.cs      # Repository interfaces
│   └── Repositories.cs       # Repository implementations
├── appsettings.json          # Configuration
├── appsettings.Development.json
├── Program.cs                # Startup configuration
└── GharBazar.API.csproj      # Project file
```

## API Endpoints

### Authentication

```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login user
GET    /api/auth/profile          - Get current user profile (Authorized)
```

### Properties

```
GET    /api/properties                    - Get all verified properties
GET    /api/properties/{id}               - Get property details
GET    /api/properties?search=...&city=...&minPrice=...&maxPrice=...  - Search properties
GET    /api/properties/owner/listings     - Get my listings (Authorized)
GET    /api/properties/pending            - Get pending properties (Admin Only)
POST   /api/properties                    - Create property (Authorized)
PUT    /api/properties/{id}               - Update property (Authorized)
DELETE /api/properties/{id}               - Delete property (Authorized)
PUT    /api/properties/{id}/verify        - Verify/Approve property (Admin Only)
```

### Documents

```
GET    /api/documents/property/{propertyId}    - Get documents for property
POST   /api/documents/{propertyId}/upload      - Upload document (Authorized)
PUT    /api/documents/{documentId}/verify      - Verify document (Admin Only)
DELETE /api/documents/{documentId}             - Delete document (Authorized)
```

### Notifications

```
GET    /api/notifications                - Get all notifications (Authorized)
GET    /api/notifications/unread         - Get unread notifications (Authorized)
POST   /api/notifications                - Create notification (Admin Only)
PUT    /api/notifications/{id}/read      - Mark as read (Authorized)
DELETE /api/notifications/{id}           - Delete notification (Authorized)
```

## Sample API Requests

### Register User

```bash
curl -X POST https://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "seller1",
    "email": "seller@example.com",
    "password": "SecurePass123!",
    "fullName": "John Seller",
    "role": "SELLER"
  }'
```

### Login

```bash
curl -X POST https://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "SecurePass123!"
  }'

# Response:
{
  "userId": "user-id-here",
  "email": "seller@example.com",
  "role": "SELLER",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Create Property

```bash
curl -X POST https://localhost:7000/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Beautiful Family Home",
    "description": "3 bed, 2 bath house",
    "propertyType": "House",
    "price": 500000,
    "location": "123 Main St, New York",
    "city": "New York",
    "state": "NY",
    "bedrooms": 3,
    "bathrooms": 2,
    "areaSqft": 2000,
    "amenities": ["Pool", "Garden", "Garage"]
  }'
```

### Upload Document

```bash
curl -X POST https://localhost:7000/api/documents/property-id/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "property_photo",
    "documentName": "Front View",
    "documentUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'
```

### Get Pending Properties (Admin)

```bash
curl -X GET https://localhost:7000/api/properties/pending \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Verify Property (Admin)

```bash
curl -X PUT https://localhost:7000/api/properties/property-id/verify \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationStatus": "verified",
    "verificationNotes": "All documents verified"
  }'
```

### Create Notification (Admin)

```bash
curl -X POST https://localhost:7000/api/notifications \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ownerId": "seller-user-id",
    "propertyId": "property-id",
    "type": "approved",
    "title": "Property Approved",
    "message": "Your property has been approved and is now listed",
    "propertyTitle": "Beautiful Family Home"
  }'
```

## Database Schema Highlights

### Key Tables

- **users**: Stores user information (buyer, seller, admin)
- **properties**: Main property listings
- **property_images**: Images for properties
- **property_documents**: Documents for verification (photos, deeds, etc.)
- **notifications**: Alerts for sellers on approval/rejection
- **reviews**: Ratings and comments for properties
- **wishlist**: Saved properties by buyers
- **messages**: Conversations between buyers and sellers

### Relationships

- Users → Properties (One-to-Many)
- Properties → Images (One-to-Many)
- Properties → Documents (One-to-Many)
- Properties → Reviews (One-to-Many)
- Users → Notifications (One-to-Many)

## Running Tests

```bash
# Build and run tests (if test project exists)
dotnet test
```

## Troubleshooting

### Database Connection Error

```
"Unable to connect to any of the specified MySQL hosts."
```

**Solution**: 
- Ensure MySQL is running
- Check connection string in appsettings.json
- Verify username/password

### JWT Token Errors

```
"The token is invalid or expired"
```

**Solution**:
- Ensure the secret key in appsettings.json matches the one used to generate tokens
- Check that the token hasn't expired (default: 24 hours)

### CORS Errors

**Solution**:
- The CORS policy allows requests from `http://localhost:5173` and `http://localhost:3000`
- Update the React frontend API URL accordingly
- If using different port, add it to CORS policy in Program.cs

## Frontend Integration

### API Base URL

In your React frontend (index.tsx or API config file), set:

```typescript
const API_BASE_URL = 'https://localhost:7000/api';

// Or for development
const API_BASE_URL = 'http://localhost:5000/api';
```

### API Calls Example

```typescript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
localStorage.setItem('authToken', data.token);

// Subsequent requests with JWT
const response = await fetch('http://localhost:5000/api/properties', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Environment Variables

Create a `.env` file (development only):

```env
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Server=localhost;Database=ghar_bazar;User=root;Password=YOUR_PASSWORD;
Jwt__SecretKey=your-secret-key-here
```

## Performance Considerations

1. **Database Indexing**: Indexes on frequently queried columns (email, property_id, owner_id)
2. **Eager Loading**: Use `.Include()` to prevent N+1 queries
3. **Pagination**: Implement for large result sets
4. **Caching**: Consider Redis for frequently accessed data
5. **File Storage**: Use cloud storage (AWS S3, Azure Blob) instead of data URLs for documents

## Security Best Practices

1. ✅ JWT tokens with expiration
2. ✅ BCrypt password hashing
3. ✅ Role-based authorization
4. ✅ SQL injection prevention (EF Core parameterized queries)
5. ✅ HTTPS enforcement
6. ✅ CORS policy restriction
7. ⏳ **TODO**: Input validation/sanitization
8. ⏳ **TODO**: Rate limiting
9. ⏳ **TODO**: API key authentication for external access

## Next Steps

1. **Connect React Frontend** to the .NET API
2. **Replace localStorage** with API calls
3. **Implement File Upload** to cloud storage
4. **Add Logging** (Serilog)
5. **Add Caching** (Redis)
6. **Deploy** to Azure or AWS

## Support

For issues or questions:
1. Check Swagger documentation at `/swagger`
2. Review error logs
3. Check database migrations status
4. Verify JWT configuration

---

**Last Updated**: December 2024
