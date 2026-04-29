import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const serviceDetails = {
  veterinary: {
    title: "Veterinary",
    description: "Our expert vets provide full medical care, routine checkups, and advanced treatment.",
    extra: "Available Mon–Sat: 9 AM – 6 PM | Emergency: 24/7",
  },
  training: {
    title: "Pet Training",
    description: "We help your pets with obedience, socialization, and behavior correction.",
    extra: "Training Batches: Morning 7–9 AM, Evening 5–7 PM",
  },
  grooming: {
    title: "Pet Grooming",
    description: "Professional grooming including bathing, trimming, nail clipping & styling.",
    extra: "Available Daily: 10 AM – 5 PM",
  },
  boarding: {
    title: "Pet Boarding",
    description: "Safe and fun environment with regular feeding, playtime, and monitoring.",
    extra: "Boarding Slots: 24/7 | Minimum stay: 1 Day",
  },
  adoption: {
    title: "Pet Adoption",
    description: "Find adorable pets waiting for a forever home.",
    extra: "Adoption Drive: Every Sunday, 11 AM – 4 PM",
  },
  walking: {
    title: "Dog Walking",
    description: "Regular walks to keep your pets healthy, active, and socialized.",
    extra: "Morning Walk: 6–8 AM | Evening Walk: 6–8 PM",
  },
  sitting: {
    title: "Pet Sitting",
    description: "Trustworthy sitters to take care of your pets when you're away.",
    extra: "Available on hourly & daily basis",
  },
  food: {
    title: "Pet Food & Supplies",
    description: "High-quality pet food, toys, accessories, and health supplies.",
    extra: "Store Hours: 9 AM – 9 PM",
  },
  emergency: {
    title: "Emergency Care",
    description: "24/7 medical services for urgent cases and critical care.",
    extra: "Always Available 🚨",
  },
  vaccination: {
    title: "Vaccination",
    description: "Routine vaccinations to protect your pets from diseases.",
    extra: "Vaccination Camp: Every Saturday, 10 AM – 3 PM",
  },
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = serviceDetails[serviceId];
  const navigate = useNavigate();

  // Training booking state (only used when serviceId === 'training')
  const [trainings, setTrainings] = useState([]);
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [bookingData, setBookingData] = useState({ trainingId: "", petId: "", bookingDate: "" });

  useEffect(() => {
    if (serviceId !== "training") return;
    const userData = localStorage.getItem("user");
    const petsData = localStorage.getItem("pets");
    if (userData) setUser(JSON.parse(userData));
    if (petsData) setPets(JSON.parse(petsData));

    const fetchTrainings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/trainings`);
        setTrainings(res.data);
      } catch (e) {
        console.error("Failed to load trainings", e);
      }
    };
    fetchTrainings();
  }, [serviceId]);

  // Create booking for training (used by form onSubmit)
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to book this training");
      navigate("/login");
      return;
    }
    if (!bookingData.petId || !bookingData.bookingDate) {
      alert("Please select pet and date");
      return;
    }
    try {
      const trainingId = bookingData.trainingId || (trainings[0]?._id || "");
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bookings`, {
        userId: user.id,
        petId: bookingData.petId,
        trainingId,
        bookingDate: bookingData.bookingDate,
      });
      alert("Training booked successfully!");
      setBookingData({ trainingId: "", petId: "", bookingDate: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book training");
    }
  };

  if (!service) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Service Not Found</h2>
          <Link to="/services" style={styles.backBtn}>⬅ Back to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{service.title}</h2>
        <p style={styles.desc}>{service.description}</p>
        <div style={styles.extra}>{service.extra}</div>
        {serviceId === 'training' && (
          <>
            {/* Demo Video */}
            <div style={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "15px",
              padding: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              marginBottom: 16
            }}>
              <h3 style={{ color: '#1f2937', marginBottom: 12 }}>🎥 Demo Video</h3>
              <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 10 }}>
                <iframe
                  src="https://www.youtube.com/embed/4dbzPoB7AKE"
                  title="Pet Training Demo"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }}
                  allowFullScreen
                />
              </div>
            </div>

            {/* Quick Booking */}
            <div style={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              height: "fit-content"
            }}>
              <h3 style={{ color: "#1f2937", marginBottom: "20px" }}>
                Book This Training
              </h3>
              {!user ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#666', marginBottom: 12 }}>Please login to book a training</p>
                  <button
                    onClick={() => navigate('/login')}
                    style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#A8D5BA', color: '#fff', cursor: 'pointer' }}
                  >Login</button>
                </div>
              ) : pets.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#666', marginBottom: 12 }}>Please add a pet to your profile first</p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#A8D5BA', color: '#fff', cursor: 'pointer' }}
                  >Go to Dashboard</button>
                </div>
              ) : (
                <form onSubmit={handleBooking}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#1f2937", fontWeight: "bold" }}>
                      Select Pet:
                    </label>
                    <select
                      value={bookingData.petId}
                      onChange={(e) => setBookingData({ ...bookingData, petId: e.target.value })}
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
                  <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#1f2937", fontWeight: "bold" }}>
                      Preferred Date:
                    </label>
                    <input
                      type="date"
                      value={bookingData.bookingDate}
                      onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
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
                  <button
                    type="submit"
                    style={{ padding: '12px 16px', borderRadius: 10, border: 'none', background: '#A8D5BA', color: '#fff', cursor: 'pointer' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e40af')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#A8D5BA')}
                  >
                    Book Training
                  </button>
                </form>
              )}
            </div>

            {/* Explore Trainings CTA */}
            <div style={{ marginBottom: 15 }}>
              <Link to="/trainings" style={{
                display: 'inline-block', padding: '10px 20px', background: '#A8D5BA', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', marginRight: '10px'
              }}>
                🎓 View Training Programs
              </Link>
            </div>
          </>
        )}
        <Link to="/services" style={styles.backBtn}>⬅ Back to Services</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)",
    padding: "20px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    padding: "40px",
    maxWidth: "600px",
    textAlign: "center",
    transform: "translateY(0)",
    transition: "transform 0.3s ease-in-out",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "15px",
    color: "#333",
  },
  desc: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "20px",
  },
  extra: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#222",
    marginBottom: "25px",
  },
  backBtn: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#ff6f61",
    color: "white",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};

export default ServiceDetail;
