import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // add loading state
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // Prefer Vite's boolean: true in production builds
  const isProd = import.meta.env.PROD;
  // Normalize base: remove trailing slashes and any trailing /api if mistakenly provided
  const RAW_BASE = (API_URL || 'https://meditrack-3.onrender.com');
  const API_BASE = RAW_BASE.replace(/\/+$/, '').replace(/\/api$/, '');
  const api = (path) => (isProd ? `${API_BASE}/api${path}` : `/api${path}`);

  // Simple email validator
  const isValidEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Normalize inputs
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirm = form.confirm;

    if (!name || !email || !password || !confirm) {
      setError('All fields are required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    // Abort after 12s to avoid hanging in production
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      setLoading(true);
      const url = api('/auth/register');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data?.message || 'Email already registered');
        }
        throw new Error(data?.message || 'Registration failed');
      }

      setSuccess('Registration successful!');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      // AbortError has name 'AbortError'
      const msg =
        err?.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : err?.message === 'Failed to fetch'
            ? 'Could not connect to server. Check your network or CORS settings.'
            : err?.message || 'Something went wrong.';
      setError(msg);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] text-[#e5e5e5] transition-colors duration-300">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-[#1e1e1e]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-[#e5e5e5] border border-neutral-800"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Register for MediTrack</h2>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus;border-indigo-500 transition"
          />
        </div>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        {error && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4 text-red-500 text-center">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4 text-indigo-400 text-center">
            {success}
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="submit"
          className="w-full py-2 mt-2 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
        <div className="mt-4 text-center">
          <span className="text-[#a1a1aa]">Already have an account? </span>
          <button type="button" className="text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline" onClick={() => navigate('/login')}>Login</button>
        </div>
      </motion.form>
    </div>
  );
};

export default Register;
