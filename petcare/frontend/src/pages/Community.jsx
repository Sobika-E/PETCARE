import React, { useEffect, useState, useRef } from "react"; // CHANGED: added useRef
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Community() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const { user } = useAuth();
  const [form, setForm] = useState({
    userName: user?.fullName || "",
    imageUrl: "",
    description: "",
    contact: user?.email || "",
    mobile: "",
    petName: "",
    petType: "",
    seenLocation: "",
  });
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/community/posts`);
      setPosts(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
    // prefill on user change
    setForm((f) => ({ ...f, userName: user?.fullName || "", contact: user?.email || f.contact }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.imageUrl || !form.description || !form.contact || !form.mobile || !form.petName || !form.petType || !form.seenLocation) {
      return alert("Please fill all fields");
    }
    try {
      setLoading(true);
      await axios.post(`${API}/api/community/posts`, form);
      setForm({ userName: user?.fullName || "", imageUrl: "", description: "", contact: user?.email || "", mobile: "", petName: "", petType: "", seenLocation: "" });
      await fetchPosts();
      alert("Post created");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleInterested = async (postId) => {
    try {
      await axios.post(`${API}/api/community/message/${postId}`, {
        fromUserName: user?.fullName || "Guest",
        message: "I'm interested! Please contact me.",
      });
      alert("Owner notified (simulation). Use contact to connect directly.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send interest");
    }
  };

  // ===== Community Chat (local, WhatsApp-like) =====
  const CHAT_STORAGE_KEY = "pc_chat_messages_v1";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]); // {id,name,size,dataUrl}
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  // identify current user for bubble alignment
  const myId = user?.id || user?._id || "guest";
  const myName = user?.fullName || user?.name || user?.email || "Member";

  // load persisted chat on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  // persist chat on change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // autoscroll to latest message
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleFiles = async (files) => {
    const toAdd = [];
    for (const f of Array.from(files || [])) {
      if (!f.type.startsWith("image/")) continue;
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      toAdd.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        dataUrl,
      });
    }
    if (toAdd.length) setAttachments((prev) => [...prev, ...toAdd]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleFiles(e.dataTransfer.files);
  };

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: myId,
      author: myName,
      text: trimmed,
      images: attachments.map((a) => a.dataUrl),
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
    setAttachments([]);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (!window.confirm("Clear all chat messages on this device?")) return;
    setMessages([]);
    try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "30px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        fontFamily: "inherit" // CHANGED: inherit site font
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <h2 style={{ color: "#1f2937", marginBottom: "20px", textAlign: "center" }}>Community - Adopt & Connect</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginBottom: "30px" }}>
        <input
          type="text"
          name="userName"
          placeholder="Your Name"
          value={form.userName}
          onChange={handleChange}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
          required
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            type="text"
            name="petName"
            placeholder="Pet Name"
            value={form.petName}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
            required
          />
          <input
            type="text"
            name="petType"
            placeholder="Pet Type (Dog, Cat, etc.)"
            value={form.petType}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
            required
          />
        </div>
        <input
          type="url"
          name="imageUrl"
          placeholder="Pet Image URL"
          value={form.imageUrl}
          onChange={handleChange}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
          required
        />
        <input
          type="text"
          name="seenLocation"
          placeholder="Where did you see the pet? (Area/Street/City)"
          value={form.seenLocation}
          onChange={handleChange}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
          required
        />
        <textarea
          name="description"
          placeholder="Write a short description about the pet/street dog"
          value={form.description}
          onChange={handleChange}
          rows={4}
          style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc", resize: "vertical" }}
          required
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input
            type="text"
            name="contact"
            placeholder="Your Contact (email)"
            value={form.contact}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
            required
          />
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            style={{ padding: "12px", borderRadius: "10px", border: "1px solid #ccc" }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#A8D5BA",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
        >
          {loading ? "Submitting..." : "Submit Post"}
        </button>
      </form>

      <h3 style={{ color: "#1f2937", marginBottom: "10px" }}>Community Feed</h3>
      <div style={{ display: "grid", gap: "16px" }}>
        {posts.length === 0 && (
          <p style={{ color: "#666" }}>No posts yet. Be the first to post!</p>
        )}
        {posts.map((p) => (
          <div
            key={p._id}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 120px",
              gap: "16px",
              alignItems: "center",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: "15px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={p.imageUrl}
              alt={p.description}
              style={{ width: "150px", height: "120px", objectFit: "cover", borderRadius: "12px" }}
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150")}
            />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.userName}</div>
              <div style={{ color: "#1f2937", marginBottom: 8 }}>{p.description}</div>
              <div style={{ color: "#555", marginBottom: 4 }}>Pet: {p.petName} ({p.petType})</div>
              <div style={{ color: "#555", marginBottom: 4 }}>Seen at: {p.seenLocation}</div>
              <div style={{ color: "#555", marginBottom: 4 }}>Contact: {p.contact}</div>
              <div style={{ color: "#555" }}>Mobile: {p.mobile}</div>
            </div>
            <div>
              <button
                onClick={() => handleInterested(p._id)}
                className="btn"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#A8D5BA",
                  color: "#fff",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#A8D5BA")}
              >
                Interested
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== New: Community Chat Box ===== */}
      <div style={{ marginTop: 30 }}>
        <div style={chatStyles.header}>
          <div>
            <div style={chatStyles.title}>Community Chat</div>
            <div style={chatStyles.subtitle}>Share experiences, issues you faced, and photos while caring for pets.</div>
          </div>
          <button onClick={clearChat} style={chatStyles.headerBtn} title="Clear chat (local only)">Clear</button>
        </div>

        <div ref={listRef} style={chatStyles.list}>
          {messages.length === 0 ? (
            <div style={chatStyles.empty}>Start the conversation. Tip: drag & drop images here.</div>
          ) : (
            messages.map((m) => {
              const mine = m.userId === myId;
              return (
                <div key={m.id} style={{ ...chatStyles.row, justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      ...chatStyles.bubble,
                      background: mine ? "#DCF8C6" : "#fff",
                      borderTopRightRadius: mine ? 6 : 18,
                      borderTopLeftRadius: mine ? 18 : 6
                    }}
                  >
                    <div style={{ ...chatStyles.author, color: mine ? "#256029" : "#1f2937" }}>
                      {mine ? "You" : m.author || "Member"}
                    </div>
                    {m.text ? <div style={chatStyles.text}>{m.text}</div> : null}
                    {Array.isArray(m.images) && m.images.length > 0 && (
                      <div style={chatStyles.thumbGrid}>
                        {m.images.map((src, i) => (
                          <a key={i} href={src} target="_blank" rel="noreferrer" style={chatStyles.thumbLink}>
                            <img src={src} alt="attachment" style={chatStyles.thumb} />
                          </a>
                        ))}
                      </div>
                    )}
                    <div style={chatStyles.time}>{new Date(m.ts).toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Attachment previews before sending */}
        {attachments.length > 0 && (
          <div style={chatStyles.attachPreview}>
            {attachments.map((a) => (
              <div key={a.id} style={chatStyles.attachItem}>
                <img src={a.dataUrl} alt={a.name} style={chatStyles.attachImg} />
                <button onClick={() => removeAttachment(a.id)} style={chatStyles.removeBtn} title="Remove">×</button>
              </div>
            ))}
          </div>
        )}

        <div style={chatStyles.inputBar}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Write your message... (Enter to send, Shift+Enter for new line)"
            style={chatStyles.textarea}
            rows={1}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={chatStyles.attachBtn} title="Attach images">📎</button>
          <button onClick={sendMessage} style={chatStyles.sendBtn} disabled={!text.trim() && attachments.length === 0}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Community;

// Styles for chat box (inherit site font/colors where possible)
const chatStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontFamily: "inherit"
  },
  title: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  headerBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#374151"
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    background: "linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginTop: 10,
    maxHeight: 400
  },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 40, fontSize: 14 },
  row: { display: "flex", marginBottom: 10 },
  bubble: {
    maxWidth: "78%",
    padding: "10px 12px",
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    fontFamily: "inherit"
  },
  author: { fontSize: 12, fontWeight: 600, marginBottom: 4 },
  text: { whiteSpace: "pre-wrap", fontSize: 14, color: "#111827" },
  thumbGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginTop: 8 },
  thumbLink: { display: "block", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" },
  thumb: { width: "100%", height: 120, objectFit: "cover", display: "block" },
  time: { marginTop: 6, fontSize: 11, color: "#9ca3af", textAlign: "right" },
  attachPreview: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: 8,
    border: "1px dashed #e5e7eb",
    borderRadius: 10,
    background: "#fff",
    marginTop: 10
  },
  attachItem: { position: "relative", width: 84, height: 84, borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" },
  attachImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    cursor: "pointer",
    lineHeight: "22px"
  },
  inputBar: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
    padding: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    marginTop: 10
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "none",
    outline: "none",
    fontSize: 14,
    lineHeight: 1.5,
    padding: 10,
    borderRadius: 8,
    background: "#f9fafb",
    fontFamily: "inherit"
  },
  attachBtn: {
    padding: "10px 12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600
  },
  sendBtn: {
    padding: "10px 14px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600
  }
};
