import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registration successful!');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
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
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
        >
          Register
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
