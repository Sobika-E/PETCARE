import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminBookings() {
  const api = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/api/admin/bookings`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const rx = new RegExp(q, "i");
    return items.filter((b) => rx.test(b?.serviceType || "") || rx.test(b?.userId?.fullName || "") || rx.test(b?.petId?.petName || ""));
  }, [items, q]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${api}/api/admin/bookings/${id}/status`, { status });
      await load();
    } catch (e) { console.error(e); }
  };

  const updatePayment = async (id, paymentStatus) => {
    try {
      await axios.patch(`${api}/api/admin/bookings/${id}/payment`, { paymentStatus });
      await load();
    } catch (e) { console.error(e); }
  };

  const markSeen = async (id) => {
    try {
      await axios.patch(`${api}/api/admin/bookings/${id}/seen`);
      await load();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <h1>Admin • Bookings</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0' }}>
        <input placeholder="Search by service, user or pet" value={q} onChange={(e)=>setQ(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
        <button className="btn-primary" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 10 }}>User</th>
                <th style={{ padding: 10 }}>Pet</th>
                <th style={{ padding: 10 }}>Service/Training</th>
                <th style={{ padding: 10 }}>Date</th>
                <th style={{ padding: 10 }}>Status</th>
                <th style={{ padding: 10 }}>Payment</th>
                <th style={{ padding: 10 }}>Seen</th>
                <th style={{ padding: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 10 }}>{b?.userId?.fullName || '—'}</td>
                  <td style={{ padding: 10 }}>{b?.petId?.petName || '—'}</td>
                  <td style={{ padding: 10 }}>{b?.trainingId?.title || b?.serviceType || '—'}</td>
                  <td style={{ padding: 10 }}>{b?.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: 10 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: '#eef2ff' }}>{b?.status}</span>
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: b?.paymentStatus === 'paid' ? '#dcfce7' : b?.paymentStatus === 'failed' ? '#fee2e2' : '#f3f4f6' }}>{b?.paymentStatus}</span>
                  </td>
                  <td style={{ padding: 10 }}>{b?.adminSeen ? 'Yes' : 'No'}</td>
                  <td style={{ padding: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn-primary" onClick={() => markSeen(b._id)}>Mark Seen</button>
                    <select value={b.status} onChange={(e)=>updateStatus(b._id, e.target.value)}>
                      <option>Confirmed</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <select value={b.paymentStatus} onChange={(e)=>updatePayment(b._id, e.target.value)}>
                      <option>pending</option>
                      <option>paid</option>
                      <option>failed</option>
                      <option>skipped</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
