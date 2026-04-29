import React from "react";
import heroBanner from "../assets/hero-banner.jpg"; // small hero banner
import trainingImg from "../assets/services/walking.jpg"; // new image

function About() {
  return (
    <section 
      className="about" 
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: "1.6",
        color: "#333",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
      }}
    >
      {/* Hero Image */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img 
          src={heroBanner} 
          alt="PetCare Hero" 
          style={{ width: "80%", maxHeight: "200px", objectFit: "cover", borderRadius: "12px" }} 
        />
      </div>

      {/* Main About Text */}
      <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "2rem", color: "#1f2937" }}>About Us</h2>
      <p style={{ textAlign: "center", marginBottom: "25px", fontSize: "1.1rem" }}>
        At PetCare, we provide exceptional care for your pets with love, expertise, and dedication. 
        Our mission is to keep tails wagging and purrs going strong!
      </p>

      {/* Expanded Sections */}
      <div className="about-sections" style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#2563eb", marginBottom: "10px" }}>Our Mission</h3>
        <p>
          To create a safe, happy, and healthy environment for pets and their owners, 
          providing top-quality services and advice with compassion and professionalism.
        </p>

        <h3 style={{ color: "#2563eb", marginBottom: "10px", marginTop: "20px" }}>Our Vision</h3>
        <p>
          To become the most trusted pet care platform nationwide, promoting wellness, love, 
          and responsible pet ownership.
        </p>

        <h3 style={{ color: "#2563eb", marginBottom: "10px", marginTop: "20px" }}>Our Team</h3>
        <p>
          Our dedicated team of veterinarians, trainers, and pet lovers work tirelessly to ensure 
          every pet receives the care, attention, and love they deserve.
        </p>
      </div>

      {/* Training Image */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <img 
          src={trainingImg} 
          alt="Pet Training" 
          style={{ width: "60%", maxHeight: "180px", objectFit: "cover", borderRadius: "12px" }} 
        />
      </div>
    </section>
  );
}

export default About;
