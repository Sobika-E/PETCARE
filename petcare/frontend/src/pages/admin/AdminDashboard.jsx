import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const api = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [notif, setNotif] = useState(0);
  const [recent, setRecent] = useState([]);

  const load = async () => {
    try {
      const [n, b] = await Promise.all([
        axios.get(`${api}/api/admin/notifications`),
        axios.get(`${api}/api/admin/bookings`)
      ]);
      setNotif(n.data?.count || 0);
      setRecent((Array.isArray(b.data) ? b.data : []).slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <h1>Admin • Dashboard</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap: 12, margin: '16px 0' }}>
        <div style={{ background:'#0b3c5d', color:'#fff', borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, opacity:.9 }}>New Bookings</div>
          <div style={{ fontSize:32, fontWeight:700 }}>{notif}</div>
        </div>
        <Link to="/admin/bookings" style={{ textDecoration:'none' }}>
          <div style={{ background:'#d4af37', color:'#fff', borderRadius:12, padding:16 }}>
            <div style={{ fontSize:12, opacity:.95 }}>Manage</div>
            <div style={{ fontSize:24, fontWeight:700 }}>Bookings</div>
          </div>
        </Link>
      </div>

      <h3 style={{ marginTop: 18 }}>Recent Bookings</h3>
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ textAlign:'left', background:'#f9fafb' }}>
              <th style={{ padding:10 }}>User</th>
              <th style={{ padding:10 }}>Pet</th>
              <th style={{ padding:10 }}>Service/Training</th>
              <th style={{ padding:10 }}>Date</th>
              <th style={{ padding:10 }}>Payment</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b)=> (
              <tr key={b._id} style={{ borderTop:'1px solid #f3f4f6' }}>
                <td style={{ padding:10 }}>{b?.userId?.fullName || '—'}</td>
                <td style={{ padding:10 }}>{b?.petId?.petName || '—'}</td>
                <td style={{ padding:10 }}>{b?.trainingId?.title || b?.serviceType || '—'}</td>
                <td style={{ padding:10 }}>{b?.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '—'}</td>
                <td style={{ padding:10 }}>{b?.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
