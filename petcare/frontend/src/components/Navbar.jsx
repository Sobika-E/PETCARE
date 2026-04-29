import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState(0);

  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        if (!user || user.role !== 'admin') return;
        const api = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${api}/api/admin/notifications`);
        setNotif(res.data?.count || 0);
      } catch {}
    };
    load();
    if (user?.role === 'admin') {
      timer = setInterval(load, 15000);
    }
    return () => timer && clearInterval(timer);
  }, [user]);

  const authedLinks = useMemo(() => ([
    { to: "/services", label: "Services" },
    { to: "/trainings", label: "Free Resources" },
    { to: "/adoption", label: "Adoption" },
    { to: "/community", label: "Community" },
    { to: "/contact", label: "Contact" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/SearchCenters", label: "Search Centers" },
  ]), []);

  const primary = user ? authedLinks.slice(0, 4) : [];
  const overflow = user ? authedLinks.slice(4) : [];

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="PetCare" />
        <h2>PetCare</h2>
      </div>
      <ul className="nav-links">
        <li><Link to={user ? "/home" : "/"}>Home</Link></li>
        {!user && (
          <>
            <li><Link to="/login" className="btn btn-secondary btn-small">Login</Link></li>
            <li><Link to="/signup" className="btn btn-primary btn-small">Sign Up</Link></li>
          </>
        )}

        {user && (
          <>
            {primary.map((item) => (
              <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
            ))}

            {/* Admin quick link */}
            {user?.role === 'admin' && (
              <li>
                <Link to="/admin/bookings" className="btn btn-secondary btn-small">
                  Admin {notif > 0 && (<span style={{marginLeft: 6, background:'#ef4444', color:'#fff', borderRadius: 10, padding:'2px 6px', fontSize: 12}}>{notif}</span>)}
                </Link>
              </li>
            )}

            {/* More dropdown for remaining items + Logout */}
            <li style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen(!open)}
                className="btn btn-accent btn-small"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                More
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ 
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out'
                  }}
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              {open && (
                <div
                  onMouseLeave={() => setOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    padding: 'var(--spacing-lg)',
                    minWidth: '220px',
                    zIndex: 1000,
                    border: '1px solid var(--gray-200)',
                    animation: 'fadeInDown 0.2s ease-out'
                  }}
                >
                  {overflow.map((item) => (
                    <div key={item.to} style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        style={{ 
                          textDecoration: 'none', 
                          color: 'var(--gray-700)',
                          fontWeight: '500',
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          borderRadius: 'var(--radius-md)',
                          display: 'block',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--gray-50)';
                          e.target.style.color = 'var(--primary-navy)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = 'var(--gray-700)';
                        }}
                      >
                        {item.label}
                      </Link>
                    </div>
                  ))}
                  <div style={{ 
                    borderTop: '1px solid var(--gray-200)', 
                    margin: 'var(--spacing-sm) 0',
                    opacity: 0.5
                  }} />
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'var(--white)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </li>
          </>
        )}
      </ul>
      
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
