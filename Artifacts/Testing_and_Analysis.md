# 4. Testing and Analysis

Testing is done to check if the system works correctly and meets the project requirements. Different testing methods are used to find errors and improve the system quality. In this project, testing was carried out using unit testing and system testing. These tests help confirm that the system works as expected. White box testing is used at the lower level of testing such as unit testing and integration testing. Black box testing is used at a higher level such as system testing, acceptance testing, and security testing.

---

## 4.1 Test Plan

A test plan describes how the system will be tested. It explains the testing methods, tools, test cases, and expected results. The goal is to ensure that the system works properly and all main features of **GharBazar** — a real estate web platform — function correctly.

### 4.1.1 Unit Testing Test Plan

Unit testing focuses on testing small parts of the system such as API endpoint functions, modules, or controller actions. Each component is tested individually to confirm that it performs the correct operation.

- **Objective**: To verify that each API module of the system works correctly in isolation.
- **Testing Method**: White box testing (knowledge of internal code structure)
- **Tools Used**: Postman (API testing), Browser Developer Tools, Manual testing
- **Test Environment**: Web browser (Google Chrome), local ASP.NET Core development server (`http://localhost:5028`), React frontend dev server (`http://localhost:5173`)

### 4.1.2 System Testing Test Plan

System testing checks the complete system after all modules are integrated. It ensures that the system works as a whole and meets the user requirements for all three user roles: **Buyer**, **Seller**, and **Admin**.

- **Objective**: To verify that the entire GharBazar platform functions correctly when all components are combined, covering all user roles and workflows.
- **Testing Method**: Black box testing (testing from the user's perspective)
- **Test Environment**: Web browser (Google Chrome / Microsoft Edge), local/staging server.

---

## 4.2 Unit Testing

Unit testing was performed on individual API modules and controller actions of the GharBazar backend (ASP.NET Core Web API). Each endpoint was tested separately using Postman to check whether the expected HTTP response and output is produced.

### Unit Test Case Table

| Test ID | Module Name | Test Description | Input | Expected Output | Result |
|---------|-------------|------------------|-------|-----------------|--------|
| **UT01** | User Login | Check login with valid credentials | `{ "email": "buyer@test.com", "password": "Test@1234" }` | `200 OK` with JWT token and user role | **Pass** |
| **UT02** | User Login | Check login with wrong password | `{ "email": "buyer@test.com", "password": "WrongPass" }` | `401 Unauthorized` with error message | **Pass** |
| **UT03** | User Login | Check login with missing fields | `{ "email": "", "password": "" }` | `400 Bad Request` — "Email and password are required" | **Pass** |
| **UT04** | User Registration | Check new user registration with valid data | `{ "userName": "newuser", "email": "new@test.com", "password": "Test@1234", "role": "BUYER" }` | `200 OK` — "Registration successful. Please check your email for the verification code." | **Pass** |
| **UT05** | User Registration | Check registration with duplicate email | Same email as existing user | `400 Bad Request` with error message | **Pass** |
| **UT06** | User Registration | Check registration with missing required fields | Missing `userName` or `email` | `400 Bad Request` — "Email, password, and username are required" | **Pass** |
| **UT07** | OTP Verification | Verify email with valid OTP | `{ "email": "new@test.com", "otp": "123456" }` | `200 OK` with JWT token — email verified | **Pass** |
| **UT08** | OTP Verification | Verify email with expired/invalid OTP | `{ "email": "new@test.com", "otp": "000000" }` | `400 Bad Request` — "Invalid or expired OTP" | **Pass** |
| **UT09** | Resend OTP | Resend OTP to registered unverified email | `{ "email": "new@test.com" }` | `200 OK` — "A new OTP has been sent to your email." | **Pass** |
| **UT10** | Forgot Password | Request password reset with valid email | `{ "email": "buyer@test.com" }` | `200 OK` — "If the email exists, a reset link has been sent" | **Pass** |
| **UT11** | Reset Password | Reset password with valid token | `{ "token": "<valid_token>", "newPassword": "NewPass@123" }` | `200 OK` — "Password has been reset successfully" | **Pass** |
| **UT12** | Reset Password | Reset password with expired/invalid token | `{ "token": "invalidtoken", "newPassword": "NewPass@123" }` | `400 Bad Request` — "Invalid or expired reset token" | **Pass** |
| **UT13** | Change Password | Change password with correct current password | `{ "currentPassword": "Test@1234", "newPassword": "New@1234", "confirmPassword": "New@1234" }` | `200 OK` — "Password changed successfully" | **Pass** |
| **UT14** | Change Password | Change password with wrong current password | `{ "currentPassword": "WrongPass", "newPassword": "New@1234", "confirmPassword": "New@1234" }` | `401 Unauthorized` — "Current password is incorrect" | **Pass** |
| **UT15** | Change Password | Change password with mismatched new passwords | `{ "currentPassword": "Test@1234", "newPassword": "New@1234", "confirmPassword": "Different@1234" }` | `400 Bad Request` — "New password and confirmation do not match" | **Pass** |
| **UT16** | Get Profile | Retrieve authenticated user profile | Valid JWT token in Authorization header | `200 OK` with user profile data (userId, email, role, etc.) | **Pass** |
| **UT17** | Update Profile | Update user profile fields | `{ "fullName": "Updated Name", "phoneNumber": "9800000000", "bio": "Bio text" }` | `200 OK` with updated user profile | **Pass** |
| **UT18** | Get All Properties | Retrieve all listed properties | No parameters | `200 OK` with list of property objects | **Pass** |
| **UT19** | Search Properties | Search properties by city | `?city=Kathmandu` | `200 OK` with filtered properties in Kathmandu | **Pass** |
| **UT20** | Search Properties | Search properties by price range | `?minPrice=5000000&maxPrice=10000000` | `200 OK` with properties within price range | **Pass** |
| **UT21** | Search Properties | Search properties by keyword | `?search=apartment` | `200 OK` with properties matching keyword | **Pass** |
| **UT22** | Get Property by ID | Retrieve single property details | Valid property ID in URL | `200 OK` with full property details including images and documents | **Pass** |
| **UT23** | Get Property by ID | Retrieve non-existent property | Invalid property ID | `404 Not Found` — "Property not found" | **Pass** |
| **UT24** | Create Property | Create new property listing as seller | Valid property data with title, price, location, images | `201 Created` with new property object, status "Pending" | **Pass** |
| **UT25** | Create Property | Create property without authentication | No JWT token | `401 Unauthorized` | **Pass** |
| **UT26** | Update Property | Update own property details | Valid property ID + updated fields | `200 OK` with updated property | **Pass** |
| **UT27** | Update Property | Update another user's property | Different user's property ID | `403 Forbidden` | **Pass** |
| **UT28** | Delete Property | Delete own property | Valid property ID (owner) | `204 No Content` | **Pass** |
| **UT29** | Delete Property | Delete another user's property | Different user's property ID | `403 Forbidden` | **Pass** |
| **UT30** | Verify Property (Admin) | Approve a pending property | `{ "verificationStatus": "verified" }` | `200 OK` — property status changes to "For Sale" | **Pass** |
| **UT31** | Verify Property (Admin) | Reject a pending property | `{ "verificationStatus": "rejected", "verificationNotes": "Docs incomplete" }` | `200 OK` — property remains pending with notes | **Pass** |
| **UT32** | Get Pending Properties | Admin retrieves all pending properties | Admin JWT token | `200 OK` with list of unverified properties | **Pass** |
| **UT33** | Tour Booking | Buyer schedules a property tour | `{ "propertyId": "<id>", "tourDate": "2025-05-20", "tourTime": "10:00 AM", "notes": "Morning preferred" }` | `200 OK` with booking confirmation and notifications sent | **Pass** |
| **UT34** | Tour Booking | Schedule tour with invalid date format | `{ "propertyId": "<id>", "tourDate": "20-05-2025" }` | `400 Bad Request` — "Invalid date format. Use YYYY-MM-DD" | **Pass** |
| **UT35** | Tour Booking | Schedule tour on non-existent property | Invalid property ID | `404 Not Found` — "Property not found" | **Pass** |
| **UT36** | Cancel Booking | Buyer cancels own booking | Valid booking ID (buyer) | `200 OK` — booking status set to "Cancelled" | **Pass** |
| **UT37** | Cancel Booking | Buyer cancels another user's booking | Different buyer's booking ID | `403 Forbidden` | **Pass** |
| **UT38** | Confirm Booking | Seller confirms a tour booking | Valid booking ID (seller) | `200 OK` — booking status set to "Confirmed" | **Pass** |
| **UT39** | Get Messages | Retrieve conversation list | Valid JWT token | `200 OK` with list of conversations and last messages | **Pass** |
| **UT40** | Send Message | Send message to property seller | `{ "receiverId": "<userId>", "propertyId": "<propId>", "content": "Is this property still available?" }` | `201 Created` with message object | **Pass** |
| **UT41** | Send Message | Send message to self | `{ "receiverId": "<own userId>", "content": "Test" }` | `400 Bad Request` — "Cannot send message to yourself" | **Pass** |
| **UT42** | Send Message | Send message to non-existent user | Invalid receiver ID | `404 Not Found` — "Receiver not found" | **Pass** |
| **UT43** | Get Chat History | Retrieve messages between two users | Valid other user ID | `200 OK` with ordered message list; received messages marked as read | **Pass** |
| **UT44** | Unread Message Count | Get count of unread messages | Valid JWT token | `200 OK` with integer count | **Pass** |
| **UT45** | Add to Wishlist | Add property to user's wishlist | Valid property ID | `200 OK` | **Pass** |
| **UT46** | Add to Wishlist | Add already wishlisted property | Same property ID again | `400 Bad Request` — "Property already in wishlist" | **Pass** |
| **UT47** | Get Wishlist | Retrieve user's wishlist properties | Valid JWT token | `200 OK` with list of saved properties | **Pass** |
| **UT48** | Remove from Wishlist | Remove property from wishlist | Valid property ID | `204 No Content` | **Pass** |
| **UT49** | Create Review | Submit a property review | `{ "propertyId": "<id>", "rating": 4, "comment": "Great property!" }` | `201 Created` with review object | **Pass** |
| **UT50** | Create Review | Submit review without authentication | No JWT token | `401 Unauthorized` | **Pass** |
| **UT51** | Get Reviews | Get all reviews for a property | Valid property ID | `200 OK` with list of reviews and ratings | **Pass** |
| **UT52** | Delete Review (Admin) | Admin deletes a review | Valid review ID + admin token | `204 No Content` | **Pass** |
| **UT53** | Get Notifications | Retrieve all user notifications | Valid JWT token | `200 OK` with notification list | **Pass** |
| **UT54** | Get Unread Notifications | Retrieve only unread notifications | Valid JWT token | `200 OK` with count and unread notifications | **Pass** |
| **UT55** | Mark Notification Read | Mark a notification as read | Valid notification ID | `200 OK` — notification updated with `readAt` timestamp | **Pass** |
| **UT56** | Delete Notification | Delete own notification | Valid notification ID | `204 No Content` | **Pass** |
| **UT57** | Delete Notification | Delete another user's notification | Different user's notification ID | `403 Forbidden` | **Pass** |
| **UT58** | Get Seller Bookings | Seller retrieves bookings on their properties | Seller JWT token | `200 OK` with list of tour bookings for seller's properties | **Pass** |
| **UT59** | Get Owner Listings | Seller retrieves their own property listings | Seller JWT token | `200 OK` with list of seller's properties | **Pass** |

---

## 4.3 System Testing

System testing was conducted after integrating all modules. This test checks whether the full GharBazar platform works properly in real use conditions across all user-facing features and role-based workflows.

### System Test Case Table

| Test ID | Feature | Test Scenario | Expected Result | Result |
|---------|---------|---------------|-----------------|--------|
| **ST01** | User Registration | New visitor registers as a Buyer by filling the signup form with valid details | Registration succeeds; OTP verification email is sent; user is redirected to OTP verification screen | **Pass** |
| **ST02** | Email OTP Verification | User receives OTP email and enters the correct 6-digit code | Email verified; user is logged in and redirected to Buyer Dashboard | **Pass** |
| **ST03** | User Login — Buyer | Registered and verified buyer logs in with correct credentials | Login succeeds; JWT token saved in localStorage; user lands on Buyer Dashboard | **Pass** |
| **ST04** | User Login — Seller | Registered seller logs in | Login succeeds; user lands on Seller Dashboard | **Pass** |
| **ST05** | User Login — Admin | Admin user logs in with admin credentials | Login succeeds; user lands on Admin Dashboard | **Pass** |
| **ST06** | Invalid Login | User enters incorrect password on login page | Error message shown: "Invalid credentials"; user remains on login page | **Pass** |
| **ST07** | Forgot Password Flow | User clicks "Forgot Password", enters email, receives reset link, clicks link and sets new password | Password reset successfully; user can log in with the new password | **Pass** |
| **ST08** | Home Page — Property Browse | Guest user opens the home page | Featured/latest approved properties are displayed with images, price, and location | **Pass** |
| **ST09** | Property Search | Buyer searches for properties using the search bar with keyword "apartment" | Search results update to show relevant properties matching "apartment" | **Pass** |
| **ST10** | Property Filter by City | Buyer filters properties by city "Kathmandu" | Only properties located in Kathmandu are displayed | **Pass** |
| **ST11** | Property Filter by Price | Buyer applies a min-max price filter | Only properties within the selected price range are shown | **Pass** |
| **ST12** | Property Details Page | Buyer clicks on a property card | Full property detail page opens with images, description, amenities, location, reviews, and contact seller button | **Pass** |
| **ST13** | Property Listing — Map View | Buyer views property on detail page map | Google Maps or embedded map shows the property's pin at correct latitude/longitude | **Pass** |
| **ST14** | Add to Wishlist | Logged-in buyer clicks the heart/wishlist icon on a property | Property is added to the wishlist; icon changes to indicate saved state | **Pass** |
| **ST15** | View Wishlist | Buyer navigates to the Wishlist page from the dashboard | All previously saved properties are displayed in the wishlist | **Pass** |
| **ST16** | Remove from Wishlist | Buyer removes a property from the wishlist | Property is removed; wishlist updates instantly without page reload | **Pass** |
| **ST17** | Schedule Property Tour | Buyer opens a property detail page and clicks "Schedule Tour" | Tour booking form appears; buyer selects date, time, and notes; submits booking | **Pass** |
| **ST18** | Tour Booking Notifications | After booking a tour, both buyer and seller receive in-app notifications | Notification appears in bell icon for both buyer and seller | **Pass** |
| **ST19** | Buyer — View Bookings | Buyer navigates to Bookings tab in their dashboard | All tour bookings (pending, confirmed, cancelled) are listed | **Pass** |
| **ST20** | Cancel Tour Booking | Buyer clicks "Cancel" on a pending tour booking | Booking status changes to "Cancelled"; page updates | **Pass** |
| **ST21** | Seller — View Tour Requests | Seller navigates to Tour Bookings tab in Seller Dashboard | All tour requests from buyers for seller's properties are listed | **Pass** |
| **ST22** | Seller — Confirm Tour | Seller clicks "Confirm" on a pending tour request | Booking status changes to "Confirmed"; buyer sees updated status | **Pass** |
| **ST23** | Buyer — Message Seller | Buyer clicks "Contact Seller" on a property page | Chat/message window opens; buyer can type and send a message to the seller | **Pass** |
| **ST24** | Seller — View Messages | Seller opens Messages tab in Seller Dashboard | Conversation list shows all buyers who have messaged; seller can view and reply | **Pass** |
| **ST25** | Real-Time Messaging | Buyer sends a message; seller checks messages | Message appears in the seller's conversation list; chat history is ordered correctly | **Pass** |
| **ST26** | Unread Message Indicator | User has unread messages | Notification badge/counter on the Messages icon shows correct unread count | **Pass** |
| **ST27** | Property Review — Submit | Buyer submits a review with a rating (1–5 stars) and comment on a property | Review is saved and displayed on the property detail page with username and rating | **Pass** |
| **ST28** | Property Review — Display | User views a property with existing reviews | Average rating and individual review comments are visible on the property detail page | **Pass** |
| **ST29** | Seller — Add Property | Seller navigates to "Add Property" from Seller Dashboard and fills the form | Property is created with status "Pending" and "Verification: Pending"; visible in Admin panel | **Pass** |
| **ST30** | Seller — Property Image Upload | Seller uploads property images during listing creation | Images are uploaded to the server; URLs are saved; images appear in property preview | **Pass** |
| **ST31** | Seller — Document Upload | Seller uploads legal documents (e.g., land ownership certificate) during listing | Documents uploaded and associated with property; visible in Admin review panel | **Pass** |
| **ST32** | Seller — View Own Listings | Seller navigates to "My Listings" in Seller Dashboard | All properties listed by the seller are shown with status (Pending, For Sale, Sold) | **Pass** |
| **ST33** | Seller — Edit Property | Seller clicks "Edit" on one of their listings and modifies the price | Updated property is saved; new price is reflected on the listing | **Pass** |
| **ST34** | Seller — Delete Property | Seller clicks "Delete" on one of their listings | Property is permanently removed; no longer appears in listings | **Pass** |
| **ST35** | Admin — View Pending Properties | Admin logs in and navigates to the Properties section | All properties with "Pending" verification status are listed for review | **Pass** |
| **ST36** | Admin — Approve Property | Admin reviews a property and clicks "Approve/Verify" | Property `verificationStatus` changes to "verified"; property status changes to "For Sale"; visible on homepage | **Pass** |
| **ST37** | Admin — Reject Property | Admin reviews a property and clicks "Reject" with notes | Property `verificationStatus` changes to "rejected"; seller receives notification | **Pass** |
| **ST38** | Admin — Manage Users | Admin navigates to "Manage Users" section | List of all registered users (buyers, sellers, other admins) is displayed with roles | **Pass** |
| **ST39** | Admin — Create New Admin | Admin creates a new admin account via Manage Users | New account is created with role "ADMIN"; new admin can log in and access Admin Dashboard | **Pass** |
| **ST40** | Admin — Reviews & Feedback | Admin navigates to the Reviews & Feedback section | All user reviews across all properties are visible; admin can delete inappropriate reviews | **Pass** |
| **ST41** | Admin — Delete Review | Admin deletes an inappropriate review | Review is removed from the property | **Pass** |
| **ST42** | Notifications — View All | User clicks the notification bell icon | Dropdown shows all recent notifications (tour scheduled, property approved, password changed, etc.) | **Pass** |
| **ST43** | Notifications — Mark as Read | User clicks on a notification | Notification is marked as read; read indicator updates | **Pass** |
| **ST44** | Notifications — Delete | User deletes a notification | Notification is removed from the list | **Pass** |
| **ST45** | Update Profile | User navigates to Profile page and updates name, phone number, bio, and profile picture URL | Profile is saved; updated information is displayed correctly | **Pass** |
| **ST46** | Change Password (Settings) | Logged-in user goes to Settings, enters current and new passwords | Password is changed; confirmation email is sent; user is notified | **Pass** |
| **ST47** | Role-Based Access Control — Buyer | Buyer attempts to access the Seller Dashboard URL directly | Buyer is redirected to the Home page or shown an "Unauthorized" page | **Pass** |
| **ST48** | Role-Based Access Control — Seller | Seller attempts to access the Admin Dashboard URL directly | Seller is redirected and denied access | **Pass** |
| **ST49** | Role-Based Access Control — Guest | Unauthenticated user tries to access a protected route (e.g., /dashboard/buyer) | Guest is redirected to the Login page | **Pass** |
| **ST50** | Session Persistence | User logs in, closes the tab, and reopens the browser | User remains logged in (token stored in localStorage); dashboard accessible | **Pass** |
| **ST51** | Responsive Design — Mobile | User accesses GharBazar from a mobile device or browser with a narrow viewport | Layout adapts correctly; navigation collapses to a mobile menu; all content is readable | **Pass** |

---

## 4.4 Critical Analysis

After testing the system, several observations were made about the GharBazar platform:

**Strengths Identified:**
- The authentication module (login, registration, OTP email verification, forgot/reset password, change password) functioned correctly in all scenarios, including edge cases such as invalid credentials, expired tokens, and duplicate registrations.
- Role-based access control (RBAC) works effectively across all three user roles (Buyer, Seller, Admin), preventing unauthorized access to protected routes both at the API level (via JWT claims) and the frontend level (via `ProtectedRoute` components).
- The property management workflow — from a seller creating a listing (status: Pending), to an admin approving or rejecting it, to the property appearing publicly as "For Sale" — works seamlessly end to end.
- The messaging system correctly handles conversation lists, chat history retrieval, and marking messages as read, enabling effective communication between buyers and sellers.
- The notification system reliably triggers notifications for key events (tour scheduled, property verified/rejected, password changed), keeping all users informed.
- The wishlist and tour booking features integrate cleanly with the property detail page, providing a smooth buyer experience.

**Areas for Improvement:**
- The messaging feature does not currently support real-time (WebSocket/SignalR) communication; users need to refresh or re-fetch to see new messages from the other party. Adding SignalR would significantly improve the experience.
- The tour booking system does not yet prevent double-booking the same time slot on the same property. Implementing a server-side validation check for time conflicts would improve reliability.
- Property image upload relies on client-provided URLs (the images are pre-uploaded separately). A more robust direct-to-server or cloud upload integration (e.g., Cloudinary as already used) would improve the user experience.
- Performance optimizations such as server-side pagination for property listings and message histories should be implemented before deploying to production to support larger datasets.

**Overall Conclusion:**
The GharBazar system successfully passed all unit and system tests. Core features including user management, property listings, tour scheduling, messaging, wishlisting, and administrative controls all function according to the defined requirements. The system is stable and meets the intended objectives for all three user roles. Minor enhancements in real-time communication and scalability are recommended for future iterations.

---

*Testing performed on: 2026-03-28*  
*Project: GharBazar — Real Estate Platform*  
*Testing Method: Unit Testing (Postman API) + System Testing (Black Box, Browser)*  
*Backend: ASP.NET Core Web API | Frontend: React + TypeScript (Vite)*
