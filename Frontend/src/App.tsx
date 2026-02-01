import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ForgotPassword, Login, Signup } from "./pages/auth";
import { AdminDashboard } from "./pages/dashboard/admin/AdminDashboard";
import { BuyerDashboard } from "./pages/dashboard/buyer/BuyerDashboard";
import { SellerDashboard } from "./pages/dashboard/seller/SellerDashboard";
import { ReviewsFeedback } from "./pages/dashboard/admin/ReviewFeedback";
import { ManageUsers } from "./pages/dashboard/admin/ManageUsers";
import { ProtectedRoute } from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />
        <Route path="/dashboard/reviews" element={<ReviewsFeedback />} />
        <Route path="/dashboard/users" element={<ManageUsers />} />
        <Route element={<ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']} />}></Route>

      </Routes>
    </Router>
  );
}

export default App;
