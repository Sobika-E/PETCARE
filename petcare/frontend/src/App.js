import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";    // ✅ Added
import Signup from "./pages/Signup";  // ✅ Added
import SearchCenters from "./pages/SearchCenters";
import Booking from "./pages/Booking";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import TrainingDetail from "./pages/TrainingDetail";
import Adoption from "./pages/Adoption";
import Community from "./pages/Community";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (user?.role === 'admin') {
      const path = location.pathname || '';
      if (!path.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, location.pathname]);
  const showLandingNav = !user && location.pathname === "/";
  return (
    <div className="app">
      {showLandingNav ? <LandingNavbar /> : <Navbar />}
      <main>
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/services/:serviceId" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking/:serviceId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />       {/* ✅ Login Route */}
          <Route path="/signup" element={<Signup />} />     {/* ✅ Signup Route */}
          <Route path="/SearchCenters" element={<ProtectedRoute><SearchCenters /></ProtectedRoute>} />
          {/* Protected Home after login */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
          <Route path="/trainings/:trainingId" element={<ProtectedRoute><TrainingDetail /></ProtectedRoute>} />
          <Route path="/adoption" element={<ProtectedRoute><Adoption /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
