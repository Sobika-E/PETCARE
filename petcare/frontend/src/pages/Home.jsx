import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import petVideo from "../assets/home2.mp4";

function Home() {
  return (
    <main className="home">
      <section className="video-section">
        <div className="video-container">
          <video className="pet-video" autoPlay loop muted playsInline>
            <source src={petVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay">
            <h1>Welcome Pet Lovers 🐾</h1>
            <Link to="/Services" className="explore-btn">
              Explore
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;