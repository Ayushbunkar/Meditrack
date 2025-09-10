import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      navigate('/');
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
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Login to MediTrack</h2>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div className="mb-4">
          <motion.input
            whileFocus={{ scale: 1.03, borderColor: '#6366f1' }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-[#0f0f10] border border-neutral-700 rounded-lg text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        {error && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4 text-red-500 text-center">
            {error}
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          type="submit"
          className="w-full py-2 mt-2 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition"
        >
          Login
        </motion.button>
        <div className="mt-4 text-center">
          <span className="text-[#a1a1aa]">Don't have an account? </span>
          <button type="button" className="text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline" onClick={() => navigate('/register')}>Register</button>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;
