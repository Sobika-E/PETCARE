import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./pages/Login";    // ✅ Added
import Signup from "./pages/Signup";  // ✅ Added
import SearchCenters  from "./pages/SearchCenters";  
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import TrainingDetail from "./pages/TrainingDetail";
import Adoption from "./pages/Adoption";
import Community from "./pages/Community";

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/:serviceId" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />       {/* ✅ Login Route */}
          <Route path="/signup" element={<Signup />} />     {/* ✅ Signup Route */}
          <Route path="/SearchCenters" element={<SearchCenters />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/trainings/:trainingId" element={<TrainingDetail />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
