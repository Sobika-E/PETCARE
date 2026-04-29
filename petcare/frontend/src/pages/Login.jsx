import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/login`,
        formData
      );
      
      // Derive role from checkbox (adminMode) overriding backend role if checked
      const adjustedUser = {
        ...res.data.user,
        role: adminMode ? 'admin' : (res.data.user?.role === 'admin' ? 'admin' : 'user')
      };
      // Store user data and notify auth context
      localStorage.setItem("user", JSON.stringify(adjustedUser));
      localStorage.setItem("pets", JSON.stringify(res.data.pets));
      login(adjustedUser);
      
      // Show success message with professional styling
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
      `;
      successMessage.textContent = res.data.message;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);

      setFormData({ email: "", password: "" });

      if (res.data.message.toLowerCase().includes("success")) {
        if (adjustedUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      // Show error message with professional styling
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
      `;
      errorMessage.textContent = err.response?.data?.message || "Login failed";
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--white) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-xl)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(0, 51, 102, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      <section
        className="login"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "var(--spacing-3xl)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, var(--primary-navy) 0%, var(--accent-gold) 100%)",
            borderRadius: "50%",
            margin: "0 auto var(--spacing-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-lg)"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: "700",
            color: "var(--primary-navy)",
            margin: "0 0 var(--spacing-sm) 0"
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: "var(--gray-600)",
            margin: "0",
            fontSize: "1rem"
          }}>
            Sign in to your PetCare account
          </p>
        </div>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}
          onSubmit={handleSubmit}
        >
          {/* Admin toggle */}
          <label style={{ display:'flex', alignItems:'center', gap:8, color:'var(--gray-700)' }}>
            <input type="checkbox" checked={adminMode} onChange={(e)=>setAdminMode(e.target.checked)} />
            Login as Admin (redirect to Admin panel if your account has admin role)
          </label>
          <div>
            <label style={{
              display: "block",
              marginBottom: "var(--spacing-sm)",
              color: "var(--gray-700)",
              fontWeight: "600",
              fontSize: "0.875rem"
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: "100%",
                padding: "var(--spacing-lg)",
                borderRadius: "var(--radius-lg)",
                border: "2px solid var(--gray-300)",
                outline: "none",
                fontSize: "1rem",
                fontFamily: "var(--font-body)",
                transition: "all var(--transition-fast)",
                background: "var(--white)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-navy)";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 51, 102, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-300)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: "block",
              marginBottom: "var(--spacing-sm)",
              color: "var(--gray-700)",
              fontWeight: "600",
              fontSize: "0.875rem"
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                padding: "var(--spacing-lg)",
                borderRadius: "var(--radius-lg)",
                border: "2px solid var(--gray-300)",
                outline: "none",
                fontSize: "1rem",
                fontFamily: "var(--font-body)",
                transition: "all var(--transition-fast)",
                background: "var(--white)"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary-navy)";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 51, 102, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--gray-300)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "var(--spacing-lg)",
              borderRadius: "var(--radius-lg)",
              border: "none",
              background: isLoading 
                ? "var(--gray-400)" 
                : "linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-navy-light) 100%)",
              color: "var(--white)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
              boxShadow: "var(--shadow-md)",
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "var(--shadow-lg)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-md)";
              }
            }}
          >
            {isLoading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                Signing In...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10,17 15,12 10,7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In
              </>
            )}
          </button>
          
          <p style={{ 
            textAlign: "center", 
            marginTop: "var(--spacing-lg)", 
            color: "var(--gray-600)",
            fontSize: "0.95rem"
          }}>
            Don't have an account?{" "}
            <span 
              style={{ 
                color: "var(--primary-navy)", 
                cursor: "pointer", 
                fontWeight: "600",
                textDecoration: "underline",
                transition: "color var(--transition-fast)"
              }}
              onClick={() => navigate("/signup")}
              onMouseEnter={(e) => e.target.style.color = "var(--accent-gold)"}
              onMouseLeave={(e) => e.target.style.color = "var(--primary-navy)"}
            >
              Create an account
            </span>
          </p>
        </form>
      </section>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
