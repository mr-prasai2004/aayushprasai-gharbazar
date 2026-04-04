# GharBazar API - Complete Postman Testing Guide

**Base URL**: `{{baseUrl}}` = `http://localhost:5000/api`

**Total Test Cases**: 90+ Tests Across 12 Categories

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### 1. User Registration
- **POST** `/auth/register`
- **Auth**: None
```json
{
  "userName": "testuser",
  "email": "testuser@gmail.com",
  "password": "Password@123",
  "fullName": "Test User",
  "role": "BUYER",
  "phoneNumber": "03001234567"
}
```

### 2. Verify Email OTP
- **POST** `/auth/verify-otp`
- **Auth**: None
```json
{
  "email": "testuser@gmail.com",
  "otp": "123456"
}
```

### 3. Resend OTP
- **POST** `/auth/resend-otp`
- **Auth**: None
```json
{
  "email": "testuser@gmail.com"
}
```

### 4. User Login
- **POST** `/auth/login`
- **Auth**: None
```json
{
  "email": "testuser@gmail.com",
  "password": "Password@123"
}
```
**Response**: Copy `token` to environment variable

### 5. Forgot Password
- **POST** `/auth/forgot-password`
- **Auth**: None
```json
{
  "email": "testuser@gmail.com"
}
```

### 6. Reset Password
- **POST** `/auth/reset-password`
- **Auth**: None
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword@123"
}
```

### 7. Change Password
- **PUT** `/auth/change-password`
- **Auth**: Bearer {{token}}
```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@456",
  "confirmPassword": "NewPassword@456"
}
```

---

## 👤 **USER PROFILE ENDPOINTS**

### 8. Get Profile
- **GET** `/users/profile`
- **Auth**: Bearer {{token}}
- **Body**: None

### 9. Update Profile
- **PUT** `/users/profile`
- **Auth**: Bearer {{token}}
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "03009876543",
  "address": "123 Main Street, Lahore",
  "bio": "Real estate enthusiast",
  "profilePictureUrl": "https://example.com/pic.jpg"
}
```

### 10. Get User by ID
- **GET** `/users/{userId}`
- **Auth**: Bearer {{token}}
- **URL Params**: userId = user ID

### 11. Get All Users (Admin Only)
- **GET** `/users`
- **Auth**: Bearer {{token}} (Admin role)
- **Body**: None

---

## 🏠 **PROPERTY ENDPOINTS**

### 12. Create Property
- **POST** `/properties`
- **Auth**: Bearer {{token}} (Seller/Admin)
```json
{
  "title": "Beautiful 3-Bedroom House",
  "description": "A spacious house with modern amenities",
  "propertyType": "House",
  "price": 2500000,
  "location": "Gulberg III, Lahore",
  "city": "Lahore",
  "state": "Punjab",
  "latitude": 31.5497,
  "longitude": 74.3436,
  "bedrooms": 3,
  "bathrooms": 2,
  "areaSqft": 1500,
  "amenities": ["WiFi", "Parking", "Garden", "Security"],
  "images": [
    {
      "imageUrl": "https://example.com/img1.jpg",
      "displayOrder": 1
    }
  ],
  "documents": [
    {
      "documentType": "Title Deed",
      "documentUrl": "https://example.com/doc1.pdf",
      "documentName": "Property Title"
    }
  ]
}
```

### 13. Get All Properties
- **GET** `/properties`
- **Auth**: None
- **Query Params**: None
```
{{baseUrl}}/properties
```

### 14. Search Properties - By Keyword
- **GET** `/properties?search=keyword`
- **Auth**: None
```
{{baseUrl}}/properties?search=house
```

### 15. Search Properties - By City
- **GET** `/properties?city=Lahore`
- **Auth**: None
```
{{baseUrl}}/properties?city=Lahore
```

### 16. Search Properties - By Price Range
- **GET** `/properties?minPrice=1000000&maxPrice=5000000`
- **Auth**: None
```
{{baseUrl}}/properties?minPrice=1000000&maxPrice=5000000
```

### 17. Combined Search (City + Price Range + Keyword)
- **GET** `/properties?city=Lahore&minPrice=1000000&maxPrice=5000000&search=house`
- **Auth**: None

### 18. Get Property by ID - Valid ID
- **GET** `/properties/{propertyId}`
- **Auth**: None
- **URL Params**: Valid property ID

### 19. Get Property by ID - Invalid ID
- **GET** `/properties/invalid-id-12345`
- **Auth**: None
- **Expected**: 404 Not Found

### 20. Get My Listings (Seller)
- **GET** `/properties/owner/listings`
- **Auth**: Bearer {{token}}
- **Body**: None

### 21. Update Property - Own Property
- **PUT** `/properties/{propertyId}`
- **Auth**: Bearer {{token}} (Must be owner)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 3000000,
  "bedrooms": 4,
  "bathrooms": 3,
  "status": "For Sale",
  "amenities": ["WiFi", "Parking", "Garden", "Security", "Pool"]
}
```

### 22. Update Property - Another User's Property
- **PUT** `/properties/{anotherUserPropertyId}`
- **Auth**: Bearer {{token}} (Different user)
- **Expected**: 403 Forbidden

### 23. Delete Property - Own Property
- **DELETE** `/properties/{propertyId}`
- **Auth**: Bearer {{token}} (Must be owner)
- **Body**: None

### 24. Delete Property - Another User's Property
- **DELETE** `/properties/{anotherUserPropertyId}`
- **Auth**: Bearer {{token}} (Different user)
- **Expected**: 403 Forbidden

### 25. Verify Property (Admin) - Approve
- **PUT** `/properties/{propertyId}/verify`
- **Auth**: Bearer {{token}} (Admin)
```json
{
  "status": "APPROVED",
  "notes": "Property verified successfully"
}
```

### 26. Verify Property (Admin) - Reject
- **PUT** `/properties/{propertyId}/verify`
- **Auth**: Bearer {{token}} (Admin)
```json
{
  "status": "REJECTED",
  "notes": "Documentation incomplete"
}
```

### 27. Get Pending Properties (Admin)
- **GET** `/properties/pending`
- **Auth**: Bearer {{token}} (Admin)
- **Body**: None

---

## 📅 **TOUR BOOKING ENDPOINTS**

### 28. Tour Booking - Valid Booking
- **POST** `/tour-bookings`
- **Auth**: Bearer {{token}} (Buyer)
```json
{
  "propertyId": "valid-property-id",
  "tourDate": "2026-04-15T10:00:00Z",
  "preferredTime": "Morning"
}
```

### 29. Tour Booking - Invalid Date Format
- **POST** `/tour-bookings`
- **Auth**: Bearer {{token}}
```json
{
  "propertyId": "valid-property-id",
  "tourDate": "invalid-date",
  "preferredTime": "Morning"
}
```
**Expected**: 400 Bad Request

### 30. Tour Booking - Non-Existent Property
- **POST** `/tour-bookings`
- **Auth**: Bearer {{token}}
```json
{
  "propertyId": "non-existent-id",
  "tourDate": "2026-04-15T10:00:00Z",
  "preferredTime": "Morning"
}
```
**Expected**: 404 Not Found

### 31. Cancel Booking - Own Booking
- **DELETE** `/tour-bookings/{bookingId}`
- **Auth**: Bearer {{token}} (Buyer who created booking)
- **Body**: None

### 32. Cancel Booking - Another User's Booking
- **DELETE** `/tour-bookings/{bookingId}`
- **Auth**: Bearer {{token}} (Different user)
- **Expected**: 403 Forbidden

### 33. Confirm Booking (Seller)
- **PUT** `/tour-bookings/{bookingId}/confirm`
- **Auth**: Bearer {{token}} (Property seller)
```json
{
  "status": "CONFIRMED"
}
```

### 34. Get Seller Bookings
- **GET** `/tour-bookings/seller/bookings`
- **Auth**: Bearer {{token}} (Seller)
- **Body**: None

### 35. Get Buyer Bookings
- **GET** `/tour-bookings`
- **Auth**: Bearer {{token}} (Buyer)
- **Body**: None

---

## 💬 **MESSAGE ENDPOINTS**

### 36. Get Messages - Conversation List
- **GET** `/messages/conversations`
- **Auth**: Bearer {{token}}
- **Body**: None

### 37. Send Message - To Property Seller
- **POST** `/messages/send`
- **Auth**: Bearer {{token}}
```json
{
  "receiverId": "fe486ae5-28cb-4c35-aeff-bee2c88f77f3",
  "propertyId": "0ac70713-3023-44a4-9440-27606334c908",
  "content": "Hello, I'm interested in this property"
}
```

### 38. Send Message - To Self
- **POST** `/messages/send`
- **Auth**: Bearer {{token}}
```json
{
  "receiverId": "your-own-user-id",
  "propertyId": "property-id",
  "content": "Test message"
}
```
**Expected**: 400 Bad Request

### 39. Send Message - To Non-Existent User
- **POST** `/messages/send`
- **Auth**: Bearer {{token}}
```json
{
  "receiverId": "non-existent-user-id",
  "propertyId": "property-id",
  "content": "Hello"
}
```
**Expected**: 404 Not Found

### 40. Get Chat History
- **GET** `/messages/conversation/{userId}`
- **Auth**: Bearer {{token}}
- **URL Params**: userId = recipient user ID

### 41. Get Unread Message Count
- **GET** `/messages/unread-count`
- **Auth**: Bearer {{token}}
- **Body**: None

---

## ❤️ **WISHLIST ENDPOINTS**

### 42. Add to Wishlist
- **POST** `/wishlists`
- **Auth**: Bearer {{token}}
```json
{
  "propertyId": "property-id"
}
```

### 43. Add to Wishlist - Already Wishlisted
- **POST** `/wishlists`
- **Auth**: Bearer {{token}}
```json
{
  "propertyId": "already-wishlisted-property"
}
```
**Expected**: 400 Conflict

### 44. Get Wishlist
- **GET** `/wishlists`
- **Auth**: Bearer {{token}}
- **Body**: None

### 45. Remove from Wishlist
- **DELETE** `/wishlists/{propertyId}`
- **Auth**: Bearer {{token}}
- **Body**: None

---

## ⭐ **REVIEW ENDPOINTS**

### 46. Create Review
- **POST** `/reviews`
- **Auth**: Bearer {{token}}
```json
{
  "propertyId": "property-id",
  "rating": 5,
  "comment": "Excellent property, very satisfied!"
}
```

### 47. Create Review - No Authentication
- **POST** `/reviews`
- **Auth**: None
```json
{
  "propertyId": "property-id",
  "rating": 4,
  "comment": "Good property"
}
```
**Expected**: 401 Unauthorized

### 48. Get Reviews for Property
- **GET** `/reviews/property/{propertyId}`
- **Auth**: None
- **Body**: None

### 49. Get All Reviews (Admin)
- **GET** `/reviews`
- **Auth**: Bearer {{token}} (Admin)
- **Body**: None

### 50. Delete Review (Admin)
- **DELETE** `/reviews/{reviewId}`
- **Auth**: Bearer {{token}} (Admin)
- **Body**: None

### 51. Update Review (Owner)
- **PUT** `/reviews/{reviewId}`
- **Auth**: Bearer {{token}} (Review creator)
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

---

## 🔔 **NOTIFICATION ENDPOINTS**

### 52. Get All Notifications
- **GET** `/notifications`
- **Auth**: Bearer {{token}}
- **Body**: None

### 53. Get Unread Notifications
- **GET** `/notifications/unread`
- **Auth**: Bearer {{token}}
- **Body**: None

### 54. Mark Notification as Read
- **PUT** `/notifications/{notificationId}/read`
- **Auth**: Bearer {{token}}
- **Body**: None

### 55. Mark All as Read
- **PUT** `/notifications/read-all`
- **Auth**: Bearer {{token}}
- **Body**: None

### 56. Delete Notification - Own
- **DELETE** `/notifications/{notificationId}`
- **Auth**: Bearer {{token}} (Notification owner)
- **Body**: None

### 57. Delete Notification - Another User's
- **DELETE** `/notifications/{anotherUserNotificationId}`
- **Auth**: Bearer {{token}} (Different user)
- **Expected**: 403 Forbidden

### 58. Delete All Notifications
- **DELETE** `/notifications`
- **Auth**: Bearer {{token}}
- **Body**: None

---

## 📄 **FILE UPLOAD ENDPOINTS**

### 59. Upload Property Images
- **POST** `/upload/property-images`
- **Auth**: Bearer {{token}}
- **Content-Type**: multipart/form-data
- **Form Data**: 
  - `propertyId`: property ID
  - `files`: Select image files

### 60. Upload Property Documents
- **POST** `/upload/property-documents`
- **Auth**: Bearer {{token}}
- **Content-Type**: multipart/form-data
- **Form Data**:
  - `propertyId`: property ID
  - `documentType`: "Title Deed", "NOC", etc.
  - `files`: Select document files

### 61. Upload Profile Picture
- **POST** `/upload/profile-picture`
- **Auth**: Bearer {{token}}
- **Content-Type**: multipart/form-data
- **Form Data**:
  - `file`: Profile image

---

## 🧪 **TEST SCENARIOS CHECKLIST (70+ Tests)**

### Authentication Tests (AT01-AT10)
- [ ] **AT01** - User Registration with valid data
- [ ] **AT02** - User Registration with duplicate email
- [ ] **AT03** - Email OTP Verification
- [ ] **AT04** - Resend OTP
- [ ] **AT05** - User Login - Buyer
- [ ] **AT06** - User Login - Seller
- [ ] **AT07** - User Login - Admin
- [ ] **AT08** - Invalid Login (wrong password)
- [ ] **AT09** - Forgot Password Flow
- [ ] **AT10** - Reset Password with valid token

### Profile Tests (PT01-PT08)
- [ ] **PT01** - Get User Profile
- [ ] **PT02** - Update Profile with valid data
- [ ] **PT03** - Update Profile with partial data
- [ ] **PT04** - Get Different User Profile
- [ ] **PT05** - Change Password (Settings)
- [ ] **PT06** - Update Profile with invalid data
- [ ] **PT07** - Update Profile picture
- [ ] **PT08** - Get all users (Admin only)

### Property Tests (PPT01-PPT24)
- [ ] **PPT01** - Create property with valid data (Seller)
- [ ] **PPT02** - Create property without authentication
- [ ] **PPT03** - Get all properties
- [ ] **PPT04** - Search by keyword
- [ ] **PPT05** - Search by city
- [ ] **PPT06** - Search by price range
- [ ] **PPT07** - Property Filter — By City
- [ ] **PPT08** - Property Filter — By Price Range
- [ ] **PPT09** - Get property by valid ID
- [ ] **PPT10** - Get property by invalid ID
- [ ] **PPT11** - Property Details Page
- [ ] **PPT12** - Property Map View
- [ ] **PPT13** - Update own property
- [ ] **PPT14** - Update another user's property
- [ ] **PPT15** - Delete own property
- [ ] **PPT16** - Delete another user's property
- [ ] **PPT17** - View own listings (Seller)
- [ ] **PPT18** - Seller Add Property
- [ ] **PPT19** - Seller Edit Property
- [ ] **PPT20** - Seller Delete Property
- [ ] **PPT21** - Seller Property Image Upload
- [ ] **PPT22** - Seller Document Upload
- [ ] **PPT23** - Admin View Pending Properties
- [ ] **PPT24** - Combined search (City + Price + Keyword)

### Tour Booking Tests (TBT01-TBT12)
- [ ] **TBT01** - Valid tour booking
- [ ] **TBT02** - Invalid date format
- [ ] **TBT03** - Non-existent property
- [ ] **TBT04** - Cancel own booking
- [ ] **TBT05** - Cancel another user's booking
- [ ] **TBT06** - Seller confirm booking
- [ ] **TBT07** - Schedule Property Tour
- [ ] **TBT08** - Tour Booking Notifications
- [ ] **TBT09** - Buyer View Bookings
- [ ] **TBT10** - Cancel Tour Booking
- [ ] **TBT11** - Seller View Tour Requests
- [ ] **TBT12** - Seller Confirm Tour

### Messaging Tests (MT01-MT10)
- [ ] **MT01** - Send message to seller
- [ ] **MT02** - Get conversation list
- [ ] **MT03** - Send message to self
- [ ] **MT04** - Send to non-existent user
- [ ] **MT05** - Get chat history
- [ ] **MT06** - Unread count
- [ ] **MT07** - Buyer Message Seller
- [ ] **MT08** - Seller View Messages
- [ ] **MT09** - Real-Time Messaging
- [ ] **MT10** - Unread Message Indicator

### Wishlist Tests (WT01-WT07)
- [ ] **WT01** - Add to wishlist
- [ ] **WT02** - Add duplicate
- [ ] **WT03** - Get wishlist
- [ ] **WT04** - Remove from wishlist
- [ ] **WT05** - Add to Wishlist (During Browse)
- [ ] **WT06** - View Wishlist
- [ ] **WT07** - Remove from Wishlist (Frontend)

### Review Tests (RT01-RT10)
- [ ] **RT01** - Create review (authenticated)
- [ ] **RT02** - Create review (no auth)
- [ ] **RT03** - Get property reviews
- [ ] **RT04** - Delete review (admin)
- [ ] **RT05** - Update review
- [ ] **RT06** - Property Review Submit
- [ ] **RT07** - Property Review Display
- [ ] **RT08** - Admin Reviews & Feedback
- [ ] **RT09** - Admin Delete Review
- [ ] **RT10** - Get All Reviews (Admin)

### Notification Tests (NT01-NT12)
- [ ] **NT01** - Get all notifications
- [ ] **NT02** - Get unread notifications
- [ ] **NT03** - Mark as read
- [ ] **NT04** - Delete notification (own)
- [ ] **NT05** - Delete notification (another's)
- [ ] **NT06** - Delete all notifications
- [ ] **NT07** - Notifications View All
- [ ] **NT08** - Notifications Mark as Read
- [ ] **NT09** - Notifications Delete
- [ ] **NT10** - Mark All as Read
- [ ] **NT11** - Notification Unread Count
- [ ] **NT12** - Notification Filtering

### Admin Tests (ADT01-ADT12)
- [ ] **ADT01** - Verify property (approve)
- [ ] **ADT02** - Verify property (reject)
- [ ] **ADT03** - Get pending properties
- [ ] **ADT04** - Get all users
- [ ] **ADT05** - Create admin user
- [ ] **ADT06** - Manage user roles
- [ ] **ADT07** - Delete user
- [ ] **ADT08** - Admin Approve Property
- [ ] **ADT09** - Admin Reject Property
- [ ] **ADT10** - Admin Manage Users
- [ ] **ADT11** - Admin Create New Admin
- [ ] **ADT12** - View all properties (Admin)

### File Upload Tests (FT01-FT06)
- [ ] **FT01** - Upload Property Images
- [ ] **FT02** - Upload Property Documents
- [ ] **FT03** - Upload Profile Picture
- [ ] **FT04** - Multiple file upload
- [ ] **FT05** - Invalid file format
- [ ] **FT06** - File size limit

### Access Control Tests (ACT01-ACT06)
- [ ] **ACT01** - Role-Based Access Control — Buyer
- [ ] **ACT02** - Role-Based Access Control — Seller
- [ ] **ACT03** - Role-Based Access Control — Admin
- [ ] **ACT04** - Role-Based Access Control — Guest
- [ ] **ACT05** - Session Persistence
- [ ] **ACT06** - Token Expiration

### Home & Browse Tests (HBT01-HBT05)
- [ ] **HBT01** - Home Page Property Browse
- [ ] **HBT02** - Property Search By Keyword
- [ ] **HBT03** - Property Filter By City
- [ ] **HBT04** - Property Filter By Price Range
- [ ] **HBT05** - Property Details Page

---

## 📊 **POSTMAN ENVIRONMENT VARIABLES**

Set these in your Postman Environment:

```
baseUrl: http://localhost:5000/api
token: (empty - fill after login)
buyerId: (fill from login response)
sellerId: (fill from seller user)
propertyId: (fill from create property)
bookingId: (fill from booking response)
notificationId: (fill from notification)
```

---

## ⚡ **RECOMMENDED TESTING ORDER**

### Phase 1: Authentication (10 Tests)
1. AT01 - Register
2. AT04 - Resend OTP
3. AT03 - Verify OTP
4. AT05/AT06/AT07 - Login (Buyer/Seller/Admin)
5. AT09 - Forgot Password
6. AT10 - Reset Password
7. AT08 - Invalid Login
8. AT02 - Duplicate Register

### Phase 2: User Profile (8 Tests)
9. PT01 - Get Profile
10. PT02 - Update Profile
11. PT03 - Update Profile Partial
12. PT05 - Change Password
13. PT04 - Get Different User
14. PT07 - Update Profile Picture
15. PT08 - Get All Users (Admin)

### Phase 3: Properties (24 Tests)
16. PPT01 - Create Property
17. PPT17 - View Own Listings
18. PPT03 - Get All Properties
19. PPT04 - Search by Keyword
20. PPT05 - Search by City
21. PPT06 - Search by Price Range
22. PPT09 - Get by Valid ID
23. PPT10 - Get by Invalid ID
24. PPT13 - Update Own Property
25. PPT14 - Update Another's Property
26. PPT15 - Delete Own
27. PPT16 - Delete Another's
28. PPT19 - Seller Edit
29. PPT21 - Upload Images
30. PPT22 - Upload Documents
31. PPT23 - Admin View Pending
32. PPT02 - No Authentication
...and more

### Phase 4: Tour Bookings (12 Tests)
33. TBT01 - Valid Booking
34. TBT09 - Buyer View Bookings
35. TBT04 - Cancel Own Booking
36. TBT11 - Seller View Requests
37. TBT06 - Seller Confirm
38. TBT02 - Invalid Date
39. TBT03 - Non-existent Property

### Phase 5: Messaging (10 Tests)
40. MT01 - Send to Seller
41. MT02 - Get Conversations
42. MT05 - Chat History
43. MT06 - Unread Count
44. MT07 - Buyer Message
45. MT09 - Real-time Messaging

### Phase 6: Wishlist (7 Tests)
46. WT01 - Add to Wishlist
47. WT03 - Get Wishlist
48. WT04 - Remove from Wishlist
49. WT02 - Duplicate Add

### Phase 7: Reviews (10 Tests)
50. RT01 - Create Review
51. RT03 - Get Reviews
52. RT06 - Review Submit
53. RT07 - Review Display
54. RT04 - Delete Review (Admin)

### Phase 8: Notifications (12 Tests)
55. NT01 - Get All Notifications
56. NT02 - Get Unread
57. NT03 - Mark as Read
58. NT04 - Delete Own
59. NT07 - View All
60. NT08 - Mark Read

### Phase 9: Admin Operations (12 Tests)
61. ADT03 - Get Pending
62. ADT01 - Approve Property
63. ADT02 - Reject Property
64. ADT04 - Get All Users
65. ADT05 - Create Admin
66. ADT06 - Manage Roles

### Phase 10: File Uploads (6 Tests)
67. FT01 - Upload Images
68. FT02 - Upload Documents
69. FT03 - Upload Profile Picture
70. FT05 - Invalid Format

### Phase 11: Access Control (6 Tests)
71. ACT01 - Buyer Access
72. ACT02 - Seller Access
73. ACT03 - Admin Access
74. ACT04 - Guest Access
75. ACT05 - Session Persistence
76. ACT06 - Token Expiration

### Phase 12: Home & Browse (5 Tests)
77. HBT01 - Home Browse
78. HBT02 - Search Keyword
79. HBT03 - Filter City
80. HBT04 - Filter Price
81. HBT05 - Property Details

---

## ✅ **QUICK TESTING FLOW**

1. **Register** → Get OTP from email
2. **Verify OTP** → Get token
3. **Create Property** → Get propertyId
4. **Create Tour Booking** → Get bookingId
5. **Send Message** → Test messaging
6. **Add to Wishlist** → Test wishlist
7. **Create Review** → Test reviews
8. **Check Notifications** → Verify notifications

---

## � **COMPLETE TEST SUMMARY (90+ Tests)**

| Category | Test Code | Count | Status |
|----------|-----------|-------|--------|
| Authentication | AT01-AT10 | 10 | ⬜ |
| User Profile | PT01-PT08 | 8 | ⬜ |
| Properties | PPT01-PPT24 | 24 | ⬜ |
| Tour Bookings | TBT01-TBT12 | 12 | ⬜ |
| Messaging | MT01-MT10 | 10 | ⬜ |
| Wishlist | WT01-WT07 | 7 | ⬜ |
| Reviews | RT01-RT10 | 10 | ⬜ |
| Notifications | NT01-NT12 | 12 | ⬜ |
| Admin Functions | ADT01-ADT12 | 12 | ⬜ |
| File Uploads | FT01-FT06 | 6 | ⬜ |
| Access Control | ACT01-ACT06 | 6 | ⬜ |
| Home & Browse | HBT01-HBT05 | 5 | ⬜ |
| **TOTAL** | - | **112** | - |

---

## �🔍 **COMMON STATUS CODES**

- **200** → Success
- **201** → Created
- **400** → Bad Request (validation error)
- **401** → Unauthorized (no token)
- **403** → Forbidden (no permission)
- **404** → Not Found
- **409** → Conflict (duplicate)
- **415** → Unsupported Media Type (missing Content-Type header)
- **500** → Server Error

