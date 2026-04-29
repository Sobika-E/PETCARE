import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Adoption() {
  const [activeTab, setActiveTab] = useState("buy");
  const [adoptions, setAdoptions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    breed: "",
    location: "",
    minPrice: "",
    maxPrice: ""
  });
  const [sellForm, setSellForm] = useState({
    petName: "",
    breed: "",
    age: "",
    price: "",
    location: "",
    contact: "",
    description: "",
    image: ""
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/adoptions?${queryParams}`
      );
      setAdoptions(res.data);
    } catch (err) {
      console.error("Error fetching adoptions:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    if (searchFilters.breed) filters.breed = searchFilters.breed;
    if (searchFilters.location) filters.location = searchFilters.location;
    if (searchFilters.minPrice) filters.minPrice = searchFilters.minPrice;
    if (searchFilters.maxPrice) filters.maxPrice = searchFilters.maxPrice;
    
    fetchAdoptions(filters);
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to list a pet for adoption");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/adoptions`,
        { ...sellForm, sellerId: user.id }
      );
      
      alert("Pet listed for adoption successfully!");
      setSellForm({
        petName: "",
        breed: "",
        age: "",
        price: "",
        location: "",
        contact: "",
        description: "",
        image: ""
      });
      
      // Refresh the adoptions list
      fetchAdoptions();
      setActiveTab("buy");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to list pet");
    }
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "1rem",
    width: "100%",
    marginBottom: "15px"
  };

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#A8D5BA",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "0.3s"
  };

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
          textAlign: "center"
        }}>
          <h1 style={{ color: "#1f2937", marginBottom: "10px" }}>
            🏠 Pet Adoption Center
          </h1>
          <p style={{ color: "#666", margin: 0 }}>
            Find your new best friend or help a pet find their forever home
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "5px",
            display: "flex",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            <button
              onClick={() => setActiveTab("buy")}
              style={{
                ...buttonStyle,
                backgroundColor: activeTab === "buy" ? "#A8D5BA" : "transparent",
                color: activeTab === "buy" ? "white" : "#666",
                margin: "5px"
              }}
            >
              🔍 Find Pets
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              style={{
                ...buttonStyle,
                backgroundColor: activeTab === "sell" ? "#A8D5BA" : "transparent",
                color: activeTab === "sell" ? "white" : "#666",
                margin: "5px"
              }}
            >
              📝 List Pet
            </button>
          </div>
        </div>

        {/* Buy/Search Tab */}
        {activeTab === "buy" && (
          <div>
            {/* Search Filters */}
            <div style={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "15px",
              padding: "25px",
              marginBottom: "30px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{ color: "#1f2937", marginBottom: "20px" }}>🔍 Search Filters</h3>
              <form onSubmit={handleSearch}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px"
                }}>
                  <input
                    type="text"
                    placeholder="Breed (e.g., Golden Retriever)"
                    value={searchFilters.breed}
                    onChange={(e) => setSearchFilters({...searchFilters, breed: e.target.value})}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., Mumbai)"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={searchFilters.minPrice}
                    onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={buttonStyle}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                  >
                    Search Pets
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilters({ breed: "", location: "", minPrice: "", maxPrice: "" });
                      fetchAdoptions();
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#6c757d"
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>

            {/* Adoption Listings */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "25px"
            }}>
              {adoptions.length === 0 ? (
                <div style={{
                  gridColumn: "1 / -1",
                  background: "rgba(255, 255, 255, 0.85)",
                  borderRadius: "15px",
                  padding: "40px",
                  textAlign: "center",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
                }}>
                  <p style={{ color: "#666", fontSize: "1.2rem" }}>
                    No pets available for adoption at the moment. 🐾
                  </p>
                </div>
              ) : (
                adoptions.map((adoption, index) => (
                  <div key={index} style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    borderRadius: "15px",
                    padding: "25px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    {adoption.image && (
                      <img
                        src={adoption.image}
                        alt={adoption.petName}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginBottom: "15px"
                        }}
                      />
                    )}
                    <h3 style={{ color: "#1f2937", marginBottom: "10px" }}>
                      {adoption.petName} 🐾
                    </h3>
                    <div style={{ marginBottom: "15px" }}>
                      <p style={{ margin: "5px 0", color: "#666" }}>
                        <strong>Breed:</strong> {adoption.breed}
                      </p>
                      <p style={{ margin: "5px 0", color: "#666" }}>
                        <strong>Age:</strong> {adoption.age} years
                      </p>
                      <p style={{ margin: "5px 0", color: "#666" }}>
                        <strong>Location:</strong> {adoption.location}
                      </p>
                      <p style={{ margin: "5px 0", color: "#A8D5BA", fontSize: "1.2rem", fontWeight: "bold" }}>
                        ₹{adoption.price}
                      </p>
                    </div>
                    <p style={{ color: "#666", marginBottom: "15px", fontSize: "0.9rem" }}>
                      {adoption.description}
                    </p>
                    <div style={{ marginBottom: "15px" }}>
                      <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                        <strong>Contact:</strong> {adoption.contact}
                      </p>
                      <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                        <strong>Listed by:</strong> {adoption.sellerId?.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => alert(`Contact ${adoption.contact} for ${adoption.petName}`)}
                      style={{
                        ...buttonStyle,
                        width: "100%"
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                    >
                      Contact Seller
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <div style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            <h3 style={{ color: "#1f2937", marginBottom: "20px", textAlign: "center" }}>
              📝 List Your Pet for Adoption
            </h3>
            
            {!user ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  Please login to list your pet for adoption
                </p>
                <button
                  onClick={() => navigate("/login")}
                  style={buttonStyle}
                >
                  Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSellSubmit}>
                <input
                  type="text"
                  placeholder="Pet Name"
                  value={sellForm.petName}
                  onChange={(e) => setSellForm({...sellForm, petName: e.target.value})}
                  required
                  style={inputStyle}
                />
                
                <input
                  type="text"
                  placeholder="Breed"
                  value={sellForm.breed}
                  onChange={(e) => setSellForm({...sellForm, breed: e.target.value})}
                  required
                  style={inputStyle}
                />
                
                <input
                  type="number"
                  placeholder="Age (years)"
                  value={sellForm.age}
                  onChange={(e) => setSellForm({...sellForm, age: e.target.value})}
                  required
                  min="0"
                  max="30"
                  style={inputStyle}
                />
                
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={sellForm.price}
                  onChange={(e) => setSellForm({...sellForm, price: e.target.value})}
                  required
                  min="0"
                  style={inputStyle}
                />
                
                <input
                  type="text"
                  placeholder="Location (City)"
                  value={sellForm.location}
                  onChange={(e) => setSellForm({...sellForm, location: e.target.value})}
                  required
                  style={inputStyle}
                />
                
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={sellForm.contact}
                  onChange={(e) => setSellForm({...sellForm, contact: e.target.value})}
                  required
                  style={inputStyle}
                />
                
                <input
                  type="url"
                  placeholder="Pet Image URL (optional)"
                  value={sellForm.image}
                  onChange={(e) => setSellForm({...sellForm, image: e.target.value})}
                  style={inputStyle}
                />
                
                <textarea
                  placeholder="Description (health, temperament, special needs, etc.)"
                  value={sellForm.description}
                  onChange={(e) => setSellForm({...sellForm, description: e.target.value})}
                  required
                  rows="4"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                  }}
                />
                
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    width: "100%",
                    padding: "15px",
                    fontSize: "1.1rem",
                    fontWeight: "bold"
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                >
                  List Pet for Adoption
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Adoption;
