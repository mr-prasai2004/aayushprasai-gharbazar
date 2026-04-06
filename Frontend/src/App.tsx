import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { Home } from './pages/Home.jsx';
import { Login, Signup, ForgotPassword, ResetPassword } from './pages/auth/index.js';
import { BuyerDashboard } from './pages/dashboard/buyer/BuyerDashboard.jsx';
import { SellerDashboard } from './pages/dashboard/seller/SellerDashboard.jsx';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard.jsx';
import { ManageUsers } from './pages/dashboard/admin/ManageUsers.jsx';
import { AdminManageProperties } from './pages/dashboard/admin/ManageProperties.jsx';
import { ReviewsFeedback } from './pages/dashboard/admin/ReviewsFeedback.jsx';
import { PropertySearch, PropertyDetails, AddProperty } from './pages/properties/index.js';
import { Profile, Wishlist, Settings, Bookings } from './pages/profile/index.js';
import { Messages } from './pages/dashboard/Messages.tsx';
import SellerTourBookings from './pages/dashboard/seller/SellerTourBookings.tsx';
import { UserRole } from '../types.ts';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/properties" element={<PropertySearch />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />

        {/* Protected Buyer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
          <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
          <Route path="/dashboard/wishlist" element={<Wishlist />} />
          <Route path="/dashboard/bookings" element={<Bookings />} />
          <Route path="/dashboard/buyer/messages" element={<Messages />} />
          <Route path="/dashboard/buyer/settings" element={<Settings role={UserRole.BUYER} />} />
        </Route>

        {/* Protected Seller Routes */}
        <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
          <Route path="/dashboard/seller" element={<SellerDashboard />} />
          <Route path="/dashboard/add-property" element={<AddProperty />} />
          <Route path="/dashboard/listings" element={<SellerDashboard />} />
          <Route path="/dashboard/seller/bookings" element={<SellerDashboard />} />
          <Route path="/dashboard/messages" element={<SellerDashboard />} />
          <Route path="/dashboard/seller/settings" element={<Settings role={UserRole.SELLER} />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/users" element={<ManageUsers />} />
          <Route path="/dashboard/properties" element={<AdminManageProperties />} />
          <Route path="/dashboard/reviews" element={<ReviewsFeedback />} />
          <Route path="/dashboard/admin/settings" element={<Settings role={UserRole.ADMIN} />} />
        </Route>

        {/* Shared Protected Profile Route */}
        <Route element={<ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']} />}>
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/messages" element={<Messages />} />
        </Route>

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
