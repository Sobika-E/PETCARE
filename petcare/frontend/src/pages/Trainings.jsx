import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Trainings() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState({ db: [], wiki: [] });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/resources`);
        setResources(res.data);
      } catch (err) {
        console.error("Error fetching resources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Debounced search
  useEffect(() => {
    const doSearch = async () => {
      const query = q.trim();
      if (query.length < 2) {
        setResults({ db: [], wiki: [] });
        setSearching(false);
        return;
      }
      try {
        setSearching(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/resources/search`, {
          params: { q: query }
        });
        setResults({ db: res.data.db || [], wiki: res.data.wiki || [] });
      } catch (e) {
        setResults({ db: [], wiki: [] });
      } finally {
        setSearching(false);
      }
    };
    const id = setTimeout(doSearch, 400);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(12px)",
          borderRadius: "15px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <h1 style={{ color: "#1f2937", marginBottom: "10px" }}>🎓 Free Training Resources</h1>
          <p style={{ color: "#666", margin: "0 0 16px" }}>Curated free guides and articles to help you train your pets.</p>
          <div style={{ maxWidth: 700, margin: "0 auto", display: 'flex', gap: 10 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search anything about pet care (e.g., potty training, leash, sit/stay)"
              style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ccc' }}
            />
            {searching && <span style={{ alignSelf: 'center', color: '#1f2937' }}>Searching...</span>}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#1f2937" }}>Loading resources...</div>
        ) : q.trim().length >= 2 ? (
          <>
            {/* DB results */}
            <h3 style={{ color: "#1f2937", margin: "10px 0" }}>From our library</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: 24
            }}>
              {results.db.map((r) => (
                <div key={`db-${r._id}`} style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  borderRadius: "15px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.3s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji || "🐾"}</div>
                    <h3 style={{ color: "#1f2937", marginBottom: 8 }}>{r.title}</h3>
                    <p style={{ color: "#555", marginBottom: 12 }}>{r.description}</p>
                  </div>
                  <button
                    onClick={() => window.open(r.link, "_blank")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: "#A8D5BA",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "0.3s"
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                  >
                    Read More
                  </button>
                </div>
              ))}
              {results.db.length === 0 && (
                <div style={{ color: '#666', gridColumn: '1 / -1' }}>No matches in our library.</div>
              )}
            </div>

            {/* Wikipedia results */}
            <h3 style={{ color: "#1f2937", margin: "10px 0" }}>From Wikipedia</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px"
            }}>
              {results.wiki.map((w, idx) => (
                <div key={`wiki-${idx}`} style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  borderRadius: "15px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.3s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📘</div>
                    <h3 style={{ color: "#1f2937", marginBottom: 8 }}>{w.title}</h3>
                    <p style={{ color: "#555", marginBottom: 12 }}>{w.snippet}</p>
                  </div>
                  <button
                    onClick={() => window.open(w.link, "_blank")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "none",
                      backgroundColor: "#A8D5BA",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "0.3s"
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                  >
                    Read More
                  </button>
                </div>
              ))}
              {results.wiki.length === 0 && (
                <div style={{ color: '#666', gridColumn: '1 / -1' }}>No Wikipedia matches.</div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}>
            {resources.map((r) => (
              <div key={r._id} style={{
                background: "rgba(255, 255, 255, 0.85)",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.3s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{r.emoji || "🐾"}</div>
                  <h3 style={{ color: "#1f2937", marginBottom: 8 }}>{r.title}</h3>
                  <p style={{ color: "#555", marginBottom: 12 }}>{r.description}</p>
                </div>
                <button
                  onClick={() => window.open(r.link, "_blank")}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#A8D5BA",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "0.3s"
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
                >
                  Read More
                </button>
              </div>
            ))}
            {resources.length === 0 && !loading && (
              <div style={{ color: "#666", gridColumn: "1 / -1", textAlign: "center" }}>No resources yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Trainings;
