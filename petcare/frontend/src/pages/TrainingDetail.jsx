import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function TrainingDetail() {
  const { trainingId } = useParams();
  const [training, setTraining] = useState(null);
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    petId: "",
    bookingDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const petsData = localStorage.getItem("pets");
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (petsData) {
      setPets(JSON.parse(petsData));
    }
    
    fetchTrainingDetail();
  }, [trainingId]);

  const fetchTrainingDetail = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/trainings/${trainingId}`
      );
      setTraining(res.data);
    } catch (err) {
      console.error("Error fetching training details:", err);
      alert("Training not found");
      navigate("/services");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to book a training session");
      navigate("/login");
      return;
    }

    if (pets.length === 0) {
      alert("Please add a pet to your profile before booking");
      navigate("/dashboard");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bookings`,
        {
          userId: user.id,
          petId: bookingData.petId,
          trainingId: training._id,
          bookingDate: bookingData.bookingDate
        }
      );
      
      alert("Training booked successfully!");
      setShowBookingForm(false);
      setBookingData({ petId: "", bookingDate: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book training");
    }
  };

  if (!training) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          padding: "30px",
          textAlign: "center"
        }}>
          <p style={{ color: "#1f2937", fontSize: "1.2rem" }}>Loading training details...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner": return "#4CAF50";
      case "Intermediate": return "#ff9800";
      case "Advanced": return "#f44336";
      default: return "#666";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/services")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#6c757d",
            color: "white",
            cursor: "pointer",
            marginBottom: "20px",
            transition: "0.3s"
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
        >
          ← Back to Services
        </button>

        {/* Training Header */}
        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{ color: "#1f2937", marginBottom: "15px" }}>
            {training.title}
          </h1>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "15px"
          }}>
            <span style={{
              background: getDifficultyColor(training.difficulty),
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              {training.difficulty}
            </span>
            <span style={{
              background: "#A8D5BA",
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              {training.duration}
            </span>
            <span style={{
              background: "#1e40af",
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "bold"
            }}>
              ₹{training.price}
            </span>
          </div>
          <p style={{ color: "#666", fontSize: "1.1rem", lineHeight: "1.6" }}>
            {training.description}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "30px"
        }}>
          {/* Video Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ color: "#1f2937", marginBottom: "20px" }}>
              🎥 Training Video
            </h3>
            <div style={{
              maxWidth: 720,
              margin: "0 auto",
              position: "relative",
              paddingBottom: "56.25%", // 16:9 aspect ratio
              height: 0,
              overflow: "hidden",
              borderRadius: "10px"
            }}>
              <iframe
                src={training.videoUrl}
                title={training.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "10px"
                }}
                allowFullScreen
              />
            </div>
          </div>

          {/* Booking Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            height: "fit-content"
          }}>
            <h3 style={{ color: "#1f2937", marginBottom: "20px" }}>
              📅 Book This Training
            </h3>
            
            {!user ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  Please login to book this training
                </p>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#A8D5BA",
                    color: "white",
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  Login to Book
                </button>
              </div>
            ) : pets.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  Please add a pet to your profile first
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#A8D5BA",
                    color: "white",
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  Add Pet
                </button>
              </div>
            ) : !showBookingForm ? (
              <div>
                <div style={{
                  background: "rgba(168, 213, 186, 0.1)",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border: "1px solid #A8D5BA"
                }}>
                  <h4 style={{ color: "#1f2937", marginBottom: "10px" }}>Training Details:</h4>
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    <strong>Duration:</strong> {training.duration}
                  </p>
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    <strong>Difficulty:</strong> {training.difficulty}
                  </p>
                  <p style={{ margin: "5px 0", color: "#A8D5BA", fontSize: "1.3rem", fontWeight: "bold" }}>
                    Price: ₹{training.price}
                  </p>
                </div>
                <button
                  onClick={() => setShowBookingForm(true)}
                  style={{
                    padding: "15px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#A8D5BA",
                    color: "white",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    transition: "0.3s"
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                >
                  Book Training
                </button>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#1f2937", fontWeight: "bold" }}>
                    Select Pet:
                  </label>
                  <select
                    value={bookingData.petId}
                    onChange={(e) => setBookingData({...bookingData, petId: e.target.value})}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      outline: "none",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="">Choose your pet</option>
                    {pets.map((pet, index) => (
                      <option key={index} value={pet._id}>
                        {pet.petName} ({pet.petType} - {pet.breed})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#1f2937", fontWeight: "bold" }}>
                    Preferred Date:
                  </label>
                  <input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({...bookingData, bookingDate: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      outline: "none",
                      fontSize: "1rem"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: "#A8D5BA",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                      backgroundColor: "white",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div style={{
          background: "rgba(255, 255, 255, 0.85)",
          borderRadius: "15px",
          padding: "25px",
          marginTop: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{ color: "#1f2937", marginBottom: "15px" }}>
            📋 What You'll Learn
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            <div style={{
              background: "rgba(168, 213, 186, 0.1)",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #A8D5BA"
            }}>
              <h4 style={{ color: "#1f2937", marginBottom: "10px" }}>🎯 Training Goals</h4>
              <p style={{ color: "#666", margin: 0 }}>
                Master essential skills and build a stronger bond with your pet through structured learning.
              </p>
            </div>
            <div style={{
              background: "rgba(168, 213, 186, 0.1)",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #A8D5BA"
            }}>
              <h4 style={{ color: "#1f2937", marginBottom: "10px" }}>⏱️ Duration</h4>
              <p style={{ color: "#666", margin: 0 }}>
                Complete training program over {training.duration} with expert guidance and support.
              </p>
            </div>
            <div style={{
              background: "rgba(168, 213, 186, 0.1)",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #A8D5BA"
            }}>
              <h4 style={{ color: "#1f2937", marginBottom: "10px" }}>🏆 Results</h4>
              <p style={{ color: "#666", margin: 0 }}>
                See measurable improvements in your pet's behavior and obedience skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingDetail;
