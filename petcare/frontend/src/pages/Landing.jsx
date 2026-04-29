import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <section
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          width: "100%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: 15,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          padding: 30,
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#1f2937",
        }}
      >
        <h1 style={{ fontSize: "2.2rem", marginBottom: 10 }}>Welcome to PetCare</h1>
        <p style={{ color: "#666", marginBottom: 20 }}>
          Caring for your pets made easy — training, adoption, bookings and more.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/login"
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              background: "#A8D5BA",
              color: "#fff",
              textDecoration: "none",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#A8D5BA")}
          >
            Login
          </Link>
          <Link
            to="/signup"
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              background: "#A8D5BA",
              color: "#fff",
              textDecoration: "none",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#A8D5BA")}
          >
            Signup
          </Link>
        </div>
      </div>
    </section>
  );
}
