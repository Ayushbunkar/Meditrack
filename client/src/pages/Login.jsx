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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // Use relative URL in dev to leverage Vite proxy; normalize base in prod
      const isDev =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const base = (API_URL || "https://meditrack-3.onrender.com").replace(/\/+$/, "");
      const url = isDev ? "/api/auth/login" : `${base}/api/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials: "include", // enable only if your API uses cookies and CORS is configured
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      // Store token and optional user info
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // redirect to home/dashboard
    } catch (err) {
      setError(
        err?.message === "Failed to fetch"
          ? "Could not connect to server. Check your network or CORS settings."
          : err?.message || "Login failed"
      );
    } finally {
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
