import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Booking.css";

// Map service slugs to titles and indicative prices
const SERVICES = [
  { slug: "veterinary", title: "Veterinary", price: 800 },
  { slug: "pet-training", title: "Pet Training", price: 600 },
  { slug: "pet-grooming", title: "Pet Grooming", price: 500 },
  { slug: "pet-boarding", title: "Pet Boarding", price: 1000 },
  { slug: "pet-adoption", title: "Pet Adoption", price: 0 },
  { slug: "dog-walking", title: "Dog Walking", price: 300 },
  { slug: "pet-sitting", title: "Pet Sitting", price: 400 },
  { slug: "pet-food-and-supplies", title: "Pet Food & Supplies", price: 0 },
  { slug: "emergency-care", title: "Emergency Care", price: 1200 },
  { slug: "vaccination", title: "Vaccination", price: 700 },
];

const QUESTIONS = {
  "Veterinary": [
    { name: "petType", label: "Pet Type", type: "select", options: ["Dog", "Cat", "Other"] },
    { name: "symptoms", label: "Symptoms / Concern", type: "textarea" },
  ],
  "Pet Training": [
    { name: "level", label: "Training Level", type: "select", options: ["Basic", "Intermediate", "Advanced"] },
    { name: "goals", label: "Goals", type: "text" },
  ],
  "Pet Grooming": [
    { name: "package", label: "Package", type: "select", options: ["Bath & Brush", "Full Groom", "Nail Trim"] },
    { name: "notes", label: "Special Notes", type: "textarea" },
  ],
  "Pet Boarding": [
    { name: "nights", label: "Number of Nights", type: "number", min: 1 },
    { name: "diet", label: "Diet Instructions", type: "textarea" },
  ],
  "Dog Walking": [
    { name: "duration", label: "Walk Duration", type: "select", options: ["15 min", "30 min", "60 min"] },
    { name: "temperament", label: "Dog Temperament", type: "text" },
  ],
  "Pet Sitting": [
    { name: "visitsPerDay", label: "Visits per Day", type: "number", min: 1 },
    { name: "tasks", label: "Tasks (feeding, litter, meds)", type: "text" },
  ],
  "Pet Food & Supplies": [
    { name: "items", label: "Items Needed", type: "textarea" },
  ],
  "Emergency Care": [
    { name: "emergency", label: "Emergency Description", type: "textarea" },
  ],
  "Vaccination": [
    { name: "vaccine", label: "Vaccine Type", type: "select", options: ["Rabies", "DHPP", "Parvo", "FVRCP"] },
    { name: "lastDate", label: "Last Vaccination Date", type: "date" },
  ],
  "Pet Adoption": [
    { name: "preferences", label: "Pet Preferences", type: "textarea" },
  ],
};

function toTitle(slug) {
  const found = SERVICES.find((s) => s.slug === slug);
  return found?.title || "Booking";
}

function getPrice(slug) {
  const found = SERVICES.find((s) => s.slug === slug);
  return found?.price ?? 0;
}

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const title = useMemo(() => toTitle(serviceId), [serviceId]);
  const price = useMemo(() => getPrice(serviceId), [serviceId]);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ petId: "", date: "", time: "", name: "", email: "", phone: "" });
  const [details, setDetails] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [pets, setPets] = useState([]);
  const [payUI, setPayUI] = useState({ open: false, processing: false, booking: null, amount: 0 });

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      const p = localStorage.getItem("pets");
      if (p) setPets(JSON.parse(p));
    } catch {}
  }, []);

  // Fallback: fetch pets from API if not available in localStorage
  useEffect(() => {
    const fetchPets = async () => {
      if (!user || pets.length > 0) return;
      try {
        const api = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await axios.get(`${api}/api/pets/${user.id}`);
        if (Array.isArray(res.data)) setPets(res.data);
      } catch (e) {
        // ignore silently; user can still type details
      }
    };
    fetchPets();
  }, [user, pets.length]);

  const questions = useMemo(() => QUESTIONS[title] || [], [title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((p) => ({ ...p, [name]: value }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (submitting) return; // guard against double submit
    if (!user) {
      alert("Please login to continue");
      navigate("/login");
      return;
    }
    if (!form.date || !form.name || !form.phone) {
      alert("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      const api = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || process.env.REACT_APP_API_URL || "http://localhost:5000";
      const payload = {
        userId: user.id,
        petId: form.petId,
        serviceSlug: serviceId,
        serviceType: title,
        bookingDate: form.date,
        bookingTime: form.time,
        contact: { name: form.name, email: form.email, phone: form.phone },
        details,
        amount: price,
      };
      console.log('[Booking] API:', api);
      console.log('[Booking] Payload:', payload);
      const res = await axios.post(`${api}/api/bookings`, payload);
      console.log('[Booking] Server response:', res.status, res.data);
      const booking = res.data?.booking || res.data || {};
      if (price > 0) {
        // Open UI payment modal (no gateway)
        setPayUI({ open: true, processing: false, booking, amount: price });
        alert('Booking created. Proceed to payment.');
        return;
      }
      alert('Booked successfully');
      navigate(`/booking/confirmation/${booking._id || booking.id || "new"}?status=skipped`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPay = async () => {
    setPayUI((p) => ({ ...p, processing: true }));
    // Simulate processing delay
    setTimeout(() => {
      const id = payUI.booking?._id || payUI.booking?.id || "new";
      setPayUI({ open: false, processing: false, booking: null, amount: 0 });
      alert('Booked successfully and payment confirmed');
      navigate(`/booking/confirmation/${id}?status=success`);
    }, 800);
  };

  const cancelPay = () => {
    const id = payUI.booking?._id || payUI.booking?.id || "new";
    setPayUI({ open: false, processing: false, booking: null, amount: 0 });
    alert('Booking created. Payment skipped.');
    navigate(`/booking/confirmation/${id}?status=skipped`);
  };
  return (
    <div className="booking-page">
      <h1 className="booking-header">{title} Booking</h1>
      {price > 0 && (
        <div className="booking-price">Estimated price: ₹{price}</div>
      )}

      <form onSubmit={submitBooking} className="booking-form">
        <div className="form-group">
          <label>Pet</label>
          <select name="petId" value={form.petId} onChange={handleChange}>
            <option value="">Select Pet</option>
            {pets.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.petName || p.name} ({p.petType || p.type})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input name="time" type="time" value={form.time} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input name="name" type="text" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
        </div>

        {/* Service-specific questions */}
        {questions.length > 0 && (
          <div>
            <h3 className="section-title">Service Details</h3>
            <div className="booking-form">
              {questions.map((q) => (
                <div className="form-group" key={q.name}>
                  <label>{q.label}</label>
                  {q.type === "select" ? (
                    <select name={q.name} value={details[q.name] || ""} onChange={handleDetailChange}>
                      <option value="">Select</option>
                      {q.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : q.type === "textarea" ? (
                    <textarea name={q.name} value={details[q.name] || ""} onChange={handleDetailChange} rows={3} />
                  ) : (
                    <input name={q.name} type={q.type || "text"} min={q.min} value={details[q.name] || ""} onChange={handleDetailChange} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Booking..." : price > 0 ? "Book & Pay" : "Book"}
        </button>
      </form>

      {payUI.open && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div
            style={{
              width: 'min(92vw, 460px)', background: '#fff', borderRadius: 12,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '24px'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Payment Summary</h3>
            <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.6 }}>
              <div><strong>Service:</strong> {title}</div>
              <div><strong>Date:</strong> {form.date || '-'}</div>
              <div><strong>Time:</strong> {form.time || '-'}</div>
              <div><strong>Amount:</strong> ₹{payUI.amount}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={confirmPay}
                disabled={payUI.processing}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {payUI.processing ? 'Processing...' : 'Confirm Pay'}
              </button>
              <button
                onClick={cancelPay}
                disabled={payUI.processing}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;

