import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api"; // <-- Make sure this exports your backend base URL

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Production-safe API builder
  const isProd = import.meta.env.PROD;
  const RAW_BASE = API_URL || "https://meditrack-3.onrender.com";
  const API_BASE = RAW_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  const api = (path) => (isProd ? `${API_BASE}/api${path}` : `/api${path}`);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailNorm = (email || "").trim().toLowerCase();
    const passwordNorm = (password || "").trim();

    if (!emailNorm || !passwordNorm) {
      setError("All fields are required");
      return;
    }
    if (!isValidEmail(emailNorm)) {
      setError("Please enter a valid email address");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      setLoading(true);

      const url = api("/auth/login");
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: emailNorm, password: passwordNorm }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(data?.message || "Invalid email or password.");
        }
        throw new Error(data?.message || "Login failed");
      }

      // Store token and optional user info
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // redirect to home/dashboard
    } catch (err) {
      const msg =
        err?.name === "AbortError"
          ? "Request timed out. Please try again."
          : err?.message === "Failed to fetch"
            ? "Could not connect to server. Check your network or CORS settings."
            : err?.message || "Login failed";
      setError(msg);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] text-[#e5e5e5]">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-[#1e1e1e]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-neutral-800"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Login to MediTrack
        </h2>

        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: "#6366f1" }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: "#6366f1" }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {error && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-4 text-red-500 text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-2 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <div className="mt-4 text-center">
          <span className="text-[#a1a1aa]">Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline"
          >
            Register
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;
