import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import adoptionLocal from "../assets/services/pd.png"; // NEW: local adoption image
import boardingLocal from "../assets/services/bb.png"; // NEW: local boarding image
import groomingLocal from "../assets/services/grm.jpg"; // NEW: local grooming image
import walkingLocal from "../assets/services/walking.jpg"; // NEW: local dog walking image
import vaccinationLocal from "../assets/services/vaccination.jpg";
import foodLocal from "../assets/services/food.jpg";
import sittingLocal from "../assets/services/sitting.jpg";
import emergencyLocal from "../assets/services/emg.jpg";

// ✅ External images to avoid missing local assets
const vetImg = "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop";
const trainingImg = "https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1200&auto=format&fit=crop";
const groomingImg = groomingLocal; // use local grm.jpg
const boardingImg = boardingLocal; // use local bb.png
const adoptionImg = adoptionLocal; // CHANGED: use local pd.png
const walkingImg = walkingLocal; // use local walking.jpg
const sittingImg = sittingLocal;          // CHANGED: use local sitting.jpg
const foodImg = foodLocal;                // CHANGED: use local food.jpg
const emergencyImg = emergencyLocal;      // CHANGED: use local emg.jpg
const vaccinationImg = vaccinationLocal;  // CHANGED: use local vaccination.jpg

const services = [
  {
    id: 1,
    title: "Veterinary",
    description: "Expert veterinary care for all pets.",
    image: vetImg,
    link: "/services/veterinary",
  },
  {
    id: 2,
    title: "Pet Training",
    description: "Obedience and behavior training for your pets.",
    image: trainingImg,
    link: "/services/training",
  },
  {
    id: 3,
    title: "Pet Grooming",
    description: "Complete grooming services for cats and dogs.",
    image: groomingImg,
    link: "/services/grooming",
  },
  {
    id: 4,
    title: "Pet Boarding",
    description: "Safe and fun boarding services while you’re away.",
    image: boardingImg,
    link: "/services/boarding",
  },
  {
    id: 5,
    title: "Pet Adoption",
    description: "Find your new best friend and give them a forever home.",
    image: adoptionImg,
    link: "/services/adoption",
  },
  {
    id: 6,
    title: "Dog Walking",
    description: "Daily walks to keep your pets active and happy.",
    image: walkingImg,
    link: "/services/walking",
  },
  {
    id: 7,
    title: "Pet Sitting",
    description: "Professional pet sitting for your peace of mind.",
    image: sittingImg,
    link: "/services/sitting",
  },
  {
    id: 8,
    title: "Pet Food & Supplies",
    description: "Nutritious food and essential supplies for your pets.",
    image: foodImg,
    link: "/services/food",
  },
  {
    id: 9,
    title: "Emergency Care",
    description: "24/7 emergency medical services for your pets.",
    image: emergencyImg,
    link: "/services/emergency",
  },
  {
    id: 10,
    title: "Vaccination",
    description: "Keep your pets healthy with regular vaccinations.",
    image: vaccinationImg,
    link: "/services/vaccination",
  },
];

const demoVideos = {
  // From American Veterinary Medical Association & reliable pet channels
  "Veterinary": "https://www.youtube.com/embed/AvCvrwl4N5E?rel=0&modestbranding=1&playsinline=1",
  "Pet Training": "https://www.youtube.com/embed/BV36RjcaNrM?rel=0&modestbranding=1&playsinline=1", // CHANGED
  "Pet Grooming": "https://www.youtube.com/embed/AgEudAL7l30?rel=0&modestbranding=1&playsinline=1",
  "Pet Boarding": "https://www.youtube.com/embed/9YoJdy4AI6o?rel=0&modestbranding=1&playsinline=1", // CHANGED
  "Dog Walking": "https://www.youtube.com/embed/kwrW1AP5iWQ?rel=0&modestbranding=1&playsinline=1", // CHANGED
  "Pet Sitting": "https://www.youtube.com/embed/ksjXwGe2V4s?rel=0&modestbranding=1&playsinline=1", // CHANGED
  "Pet Food & Supplies": "https://www.youtube.com/embed/f6vsg183Xa0?rel=0&modestbranding=1&playsinline=1", // CHANGED
  "Emergency Care": "https://www.youtube.com/embed/t9AFy67ZMlU?rel=0&modestbranding=1&playsinline=1", // CHANGED
  // CHANGED: autoplay this video when Vaccination card opens
  "Vaccination": "https://www.youtube.com/embed/aj9O3tkILew?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1",
  "Pet Adoption": "https://www.youtube.com/embed/HWmyewSymCs?rel=0&modestbranding=1&playsinline=1"
};

const Services = () => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [booking, setBooking] = React.useState({ petId: "", date: "" });
  const [details, setDetails] = React.useState({});
  const [pets, setPets] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [vaccinations, setVaccinations] = React.useState([]);

  React.useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      const p = localStorage.getItem("pets");
      if (u) setUser(JSON.parse(u));
      if (p) setPets(JSON.parse(p));
    } catch {}
  }, []);

  const handleOpen = (service) => {
    if (service.title === "Pet Adoption") return; // handled by link
    setSelected(service);
    setOpen(true);
    // Reset service-specific details
    setDetails({});
    if (service.title === "Vaccination" && user) {
      // Fetch vaccination records for user's pets
      axios
        .get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/pets/vaccinations/${user.id}`)
        .then((res) => setVaccinations(res.data || []))
        .catch(() => setVaccinations([]));
    }
  };

  const toSlug = (title) =>
    title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to book a service");
      return;
    }
    if (!booking.petId || !booking.date) {
      alert("Please select pet and date");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/bookings`, {
        userId: user.id,
        petId: booking.petId,
        serviceType: selected?.title,
        bookingDate: booking.date,
        details,
      });
      alert("Booking created successfully");
      setBooking({ petId: "", date: "" });
      setOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create booking");
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(0, 51, 102, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={styles.heading}>
          Our Pet Services
          <div style={styles.headingAccent}></div>
        </h2>
        
        <div style={styles.grid}>
          {services.map((service) => (
            service.title === "Pet Adoption" ? (
              <Link to="/adoption" key={service.id} style={styles.cardLink}>
                <div 
                  style={styles.card}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'var(--gray-200)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                >
                  <img src={service.image} alt={service.title} style={styles.image} />
                  <div style={styles.content}>
                    <h3 style={styles.title}>{service.title}</h3>
                    <p style={styles.description}>{service.description}</p>
                    <button
                      style={styles.button}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = 'var(--shadow-md)';
                        e.target.style.background = 'linear-gradient(135deg, var(--accent-gold-dark) 0%, var(--accent-gold) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.9.37 4.13 1.02"></path>
                      </svg>
                      Find Your Pet
                    </button>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                key={service.id} 
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--gray-200)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <img src={service.image} alt={service.title} style={styles.image} />
                <div style={styles.content}>
                  <h3 style={styles.title}>{service.title}</h3>
                  <p style={styles.description}>{service.description}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      style={styles.button}
                      onClick={() => {
                        const url = demoVideos[service.title];
                        if (url) window.open(url, '_blank');
                        else window.open('https://www.youtube.com', '_blank');
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = 'var(--shadow-md)';
                        e.target.style.background = 'linear-gradient(135deg, var(--accent-gold-dark) 0%, var(--accent-gold) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%)';
                      }}
                    >
                      Learn
                    </button>
                    <Link to={`/booking/${toSlug(service.title)}`} style={{ textDecoration: 'none' }}>
                      <button
                        style={styles.button}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = 'var(--shadow-md)';
                          e.target.style.background = 'linear-gradient(135deg, var(--accent-gold-dark) 0%, var(--accent-gold) 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%)';
                        }}
                      >
                        Book
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Professional Modal */}
      {open && selected && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: 'var(--spacing-xl)', 
          overflowY: 'auto',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: 'min(800px, 100%)', 
            background: 'var(--white)', 
            borderRadius: 'var(--radius-2xl)', 
            boxShadow: 'var(--shadow-xl)', 
            padding: 'var(--spacing-3xl)',
            maxHeight: '90vh', 
            overflowY: 'auto',
            border: '1px solid var(--gray-200)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 'var(--spacing-xl)',
              paddingBottom: 'var(--spacing-lg)',
              borderBottom: '1px solid var(--gray-200)'
            }}>
              <h3 style={{ 
                fontFamily: 'var(--font-heading)',
                color: 'var(--primary-navy)', 
                fontSize: '1.75rem',
                fontWeight: '700',
                margin: 0
              }}>
                {selected.title}
              </h3>
              <button 
                onClick={() => setOpen(false)} 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: 'var(--gray-500)',
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--gray-100)';
                  e.target.style.color = 'var(--gray-700)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--gray-500)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <p style={{ 
              color: 'var(--gray-600)', 
              marginBottom: 'var(--spacing-xl)',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {selected.description}
            </p>

            {/* Video */}
            {demoVideos[selected.title] && (
              <div style={{ maxWidth: 560, margin: '0 auto 12px', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 10 }}>
                <iframe
                  key={selected.title} // force remount so autoplay triggers on open
                  src={demoVideos[selected.title]}
                  title={`${selected.title} demo`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Service Explanation */}
            <div style={{
              background: 'rgba(168, 213, 186, 0.1)',
              border: '1px solid #A8D5BA',
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              color: '#1f2937'
            }}>
              <strong>About this service:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{selected.description}</p>
            </div>

            {/* Booking Form (service-specific) */}
            <form onSubmit={handleBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {/* Common fields */}
              <select
                value={booking.petId}
                onChange={(e) => setBooking({ ...booking, petId: e.target.value })}
                required
                style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
              >
                <option value="">Select Pet</option>
                {pets.map((p, i) => (
                  <option key={i} value={p._id}>{p.petName} ({p.petType})</option>
                ))}
              </select>
              <input
                type="date"
                value={booking.date}
                onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
              />

              {/* Vaccination specific fields */}
              {selected.title === 'Vaccination' && (
                <>
                  <input
                    type="text"
                    placeholder="Vaccine name (e.g., Rabies)"
                    value={details.vaccineName || ''}
                    onChange={(e) => setDetails({ ...details, vaccineName: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                  <input
                    type="number"
                    placeholder="Pet Age (years)"
                    min="0"
                    value={details.petAge || ''}
                    onChange={(e) => setDetails({ ...details, petAge: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                </>
              )}

              {/* Grooming specific fields */}
              {selected.title === 'Pet Grooming' && (
                <>
                  <select
                    value={details.groomType || ''}
                    onChange={(e) => setDetails({ ...details, groomType: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  >
                    <option value="">Select Grooming Type</option>
                    <option value="Bath">Bath</option>
                    <option value="Haircut">Haircut</option>
                    <option value="Nail Trim">Nail Trim</option>
                    <option value="Full Grooming">Full Grooming</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Notes / Preferences"
                    value={details.notes || ''}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                </>
              )}

              {/* Boarding specific fields */}
              {selected.title === 'Pet Boarding' && (
                <>
                  <input
                    type="date"
                    placeholder="Pickup Date"
                    value={details.pickUpDate || ''}
                    onChange={(e) => setDetails({ ...details, pickUpDate: e.target.value })}
                    min={booking.date || new Date().toISOString().split('T')[0]}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    placeholder="Food Preference"
                    value={details.foodPreference || ''}
                    onChange={(e) => setDetails({ ...details, foodPreference: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                </>
              )}

              {/* Dog Walking specific fields */}
              {selected.title === 'Dog Walking' && (
                <>
                  <input
                    type="time"
                    placeholder="Time"
                    value={details.time || ''}
                    onChange={(e) => setDetails({ ...details, time: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    placeholder="Location / Park"
                    value={details.place || ''}
                    onChange={(e) => setDetails({ ...details, place: e.target.value })}
                    style={{ padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
                  />
                </>
              )}

              <button type="submit" className="btn" style={{ width: '100%' }}>Book</button>
            </form>

            {/* Vaccination records view */}
            {selected.title === 'Vaccination' && user && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ color: '#1f2937', marginBottom: 8 }}>Your Pets Vaccination Records</h4>
                {vaccinations.length === 0 ? (
                  <p style={{ color: '#666' }}>No vaccination records yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                    {vaccinations.map((v, idx) => {
                      const next = v.nextVaccinationDate ? new Date(v.nextVaccinationDate) : null;
                      const today = new Date();
                      const soon = next && (next - today) / (1000*60*60*24) <= 7;
                      const overdue = next && next < today;
                      return (
                        <div key={idx} style={{
                          background: 'rgba(168, 213, 186, 0.1)',
                          border: '1px solid #A8D5BA', borderRadius: 10, padding: 12
                        }}>
                          <strong style={{ color: '#1f2937' }}>{v.petName}</strong>
                          <p style={{ margin: '6px 0', color: '#666' }}>
                            Last: {v.lastVaccinationDate ? new Date(v.lastVaccinationDate).toLocaleDateString() : '—'}
                            {v.lastVaccineName ? ` (${v.lastVaccineName})` : ''}
                          </p>
                          <p style={{ margin: '6px 0', color: overdue ? '#f44336' : soon ? '#ff9800' : '#666' }}>
                            Next: {next ? next.toLocaleDateString() : '—'}
                            {v.nextVaccineName ? ` (${v.nextVaccineName})` : ''}
                            {overdue ? ' — Overdue!' : soon ? ' — Coming up soon' : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Professional Inline Styles
const styles = {
  container: {
    padding: "var(--spacing-3xl) var(--spacing-xl)",
    background: "linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%)",
    minHeight: "100vh",
    textAlign: "center",
    position: "relative"
  },
  heading: {
    fontFamily: "var(--font-heading)",
    fontSize: "3rem",
    marginBottom: "var(--spacing-3xl)",
    color: "var(--primary-navy)",
    fontWeight: "700",
    position: "relative",
    display: "inline-block"
  },
  headingAccent: {
    position: "absolute",
    bottom: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100px",
    height: "4px",
    background: "linear-gradient(90deg, var(--primary-navy), var(--accent-gold))",
    borderRadius: "2px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "var(--spacing-2xl)",
    justifyContent: "center",
    alignItems: "stretch",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block"
  },
  card: {
    background: "var(--white)",
    borderRadius: "var(--radius-xl)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    transition: "all var(--transition-normal)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid var(--gray-200)",
    position: "relative",
    cursor: "pointer"
  },
  cardHover: {
    transform: "translateY(-8px)",
    boxShadow: "var(--shadow-xl)",
    borderColor: "var(--accent-gold)"
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    transition: "transform var(--transition-slow)"
  },
  imageHover: {
    transform: "scale(1.05)"
  },
  content: {
    padding: "var(--spacing-xl)"
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.5rem",
    marginBottom: "var(--spacing-sm)",
    color: "var(--primary-navy)",
    fontWeight: "600"
  },
  description: {
    fontSize: "1rem",
    color: "var(--gray-600)",
    lineHeight: "1.6",
    marginBottom: "var(--spacing-lg)"
  },
  button: {
    background: "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%)",
    color: "var(--white)",
    padding: "var(--spacing-sm) var(--spacing-lg)",
    borderRadius: "var(--radius-lg)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-xs)",
    border: "none",
    cursor: "pointer",
    width: "100%"
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "var(--shadow-md)",
    background: "linear-gradient(135deg, var(--accent-gold-dark) 0%, var(--accent-gold) 100%)"
  }
};

// ✅ Export
export default Services;
