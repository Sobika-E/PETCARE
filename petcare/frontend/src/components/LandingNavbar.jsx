import React from "react";
import { Link } from "react-router-dom";
import logo from "../logo.svg";

// Minimal landing-only navbar: Home, Login, Signup
// Uses the same classes and styling as your existing navbar
export default function LandingNavbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="PetCare" />
        <h2>PetCare</h2>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login" className="btn-small">Login</Link></li>
        <li><Link to="/signup" className="btn-small">Signup</Link></li>
      </ul>
    </nav>
  );
}
