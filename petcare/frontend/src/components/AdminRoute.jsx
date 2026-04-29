import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const stored = localStorage.getItem("user");
  const location = useLocation();
  if (!stored) return <Navigate to="/login" state={{ from: location }} replace />;
  try {
    const u = JSON.parse(stored);
    if (u.role === "admin") return children;
  } catch {}
  return <Navigate to="/home" replace />;
}
