import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({
    petName: "",
    petType: "",
    breed: "",
    age: "",
    gender: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const petsData = localStorage.getItem("pets");
    
    if (!userData) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (petsData) {
      setPets(JSON.parse(petsData));
    }
    
    // Fetch user's bookings
    fetchBookings(parsedUser.id);
  }, [navigate]);

  const fetchBookings = async (userId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bookings/${userId}`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/pets/add`,
        { ...newPet, userId: user.id }
      );
      
      const updatedPets = [...pets, res.data.pet];
      setPets(updatedPets);
      localStorage.setItem("pets", JSON.stringify(updatedPets));
      
      setNewPet({ petName: "", petType: "", breed: "", age: "", gender: "" });
      setShowAddPet(false);
      alert("Pet added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add pet");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("pets");
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ color: "#1f2937", marginBottom: "10px" }}>
              Welcome back, {user.fullName}! 👋
            </h1>
            <p style={{ color: "#666", margin: 0 }}>
              📧 {user.email} | 📱 {user.mobile}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#ff6b6b",
              color: "white",
              cursor: "pointer",
              transition: "0.3s"
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#ff5252")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ff6b6b")}
          >
            Logout
          </button>
        </div>

        {/* Dashboard Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "30px"
        }}>
          {/* My Pets Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ color: "#1f2937", margin: 0 }}>🐾 My Pets</h2>
              <button
                onClick={() => setShowAddPet(!showAddPet)}
                style={{
                  padding: "8px 15px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#A8D5BA",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                + Add Pet
              </button>
            </div>

            {showAddPet && (
              <form onSubmit={handleAddPet} style={{
                background: "rgba(168, 213, 186, 0.1)",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid #A8D5BA"
              }}>
                <h4 style={{ marginBottom: "15px", color: "#1f2937" }}>Add New Pet</h4>
                <input
                  type="text"
                  placeholder="Pet Name"
                  value={newPet.petName}
                  onChange={(e) => setNewPet({...newPet, petName: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none"
                  }}
                />
                <select
                  value={newPet.petType}
                  onChange={(e) => setNewPet({...newPet, petType: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none"
                  }}
                >
                  <option value="">Select Pet Type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Breed"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    outline: "none"
                  }}
                />
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  <input
                    type="number"
                    placeholder="Age"
                    value={newPet.age}
                    onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                    required
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      outline: "none"
                    }}
                  />
                  <select
                    value={newPet.gender}
                    onChange={(e) => setNewPet({...newPet, gender: e.target.value})}
                    required
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      outline: "none"
                    }}
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#A8D5BA",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    Add Pet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPet(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
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

            {pets.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                No pets added yet. Add your first pet! 🐕🐱
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {pets.map((pet, index) => (
                  <div key={index} style={{
                    background: "rgba(168, 213, 186, 0.1)",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #A8D5BA"
                  }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
                      {pet.petName} 🐾
                    </h4>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Type:</strong> {pet.petType} | <strong>Breed:</strong> {pet.breed}
                    </p>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Age:</strong> {pet.age} years | <strong>Gender:</strong> {pet.gender}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Bookings Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: "#1f2937", marginBottom: "20px" }}>📅 My Training Bookings</h2>
            
            {bookings.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                No bookings yet. Book a training session! 🎓
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {bookings.map((booking, index) => (
                  <div key={index} style={{
                    background: "rgba(168, 213, 186, 0.1)",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "1px solid #A8D5BA"
                  }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
                      {booking.trainingId?.title}
                    </h4>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Pet:</strong> {booking.petId?.petName}
                    </p>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                      <strong>Status:</strong> <span style={{ 
                        color: booking.status === "Confirmed" ? "#4CAF50" : "#ff9800",
                        fontWeight: "bold"
                      }}>{booking.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: "#1f2937", marginBottom: "20px" }}>🚀 Quick Actions</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button
                onClick={() => navigate("/services")}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#A8D5BA",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "0.3s"
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
              >
                🎓 Browse Training Services
              </button>
              
              <button
                onClick={() => navigate("/adoption")}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ff9800",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "0.3s"
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#f57c00")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#ff9800")}
              >
                🏠 Pet Adoption Center
              </button>
              
              <button
                onClick={() => navigate("/SearchCenters")}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#9c27b0",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "0.3s"
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#7b1fa2")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#9c27b0")}
              >
                📍 Find Pet Centers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
