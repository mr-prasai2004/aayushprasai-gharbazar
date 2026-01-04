import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login, Signup } from "./pages/auth";
import { AdminDashboard } from "./pages/dashboard/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
