import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login, Signup } from "./pages/auth";
import { AdminDashboard } from "./pages/dashboard/admin/AdminDashboard";
import { BuyerDashboard } from "./pages/dashboard/buyer/BuyerDashboard";
import { SellerDashboard } from "./pages/dashboard/seller/SellerDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
        <Route path="/dashboard/seller" element={<SellerDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
