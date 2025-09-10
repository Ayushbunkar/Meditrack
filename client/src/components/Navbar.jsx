import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(token ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    ...(token
      ? []
      : [
          { name: 'Login', path: '/login' },
          { name: 'Register', path: '/register' },
        ]),
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="w-full bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between z-50 text-[#e5e5e5] transition-colors duration-300 ease-in-out shadow-lg shadow-black/40"
      style={{ position: 'sticky', top: 0, backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-2xl font-extrabold text-white tracking-widest select-none drop-shadow-md"
      >
        MediTrack
      </motion.div>
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl focus:outline-none border border-indigo-500/20 bg-[#1e1e1e]/60 backdrop-blur-md shadow-lg hover:bg-[#2a2a2a] transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500/60"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-indigo-400 mb-1 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-indigo-400 mb-1 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-indigo-400 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {/* Desktop menu */}
      <div className="hidden sm:flex gap-2 md:gap-4 items-center">
        {navLinks.map(link => (
          <Link
            key={link.name}
            to={link.path}
            className={`text-sm md:text-base font-medium px-3 py-2 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${location.pathname === link.path ? 'text-indigo-400' : 'text-[#a1a1aa] hover:text-indigo-400 hover:bg-white/5'}`}
          >
            {link.name}
          </Link>
        ))}
        {token && (
          <button
            onClick={handleLogout}
            className="ml-2 md:ml-4 text-sm md:text-base font-semibold px-3 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white shadow-lg shadow-indigo-900/30 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          >
            Logout
          </button>
        )}
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-neutral-800 shadow-2xl flex flex-col items-center gap-2 py-4 sm:hidden z-50">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`text-base font-medium px-4 py-2 rounded-xl transition-all duration-200 ease-in-out w-full text-center ${location.pathname === link.path ? 'text-indigo-400' : 'text-[#a1a1aa] hover:text-indigo-400 hover:bg-white/5'}`}
            >
              {link.name}
            </Link>
          ))}
          {token && (
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="mt-2 text-base font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white shadow-lg shadow-indigo-900/30 transition-colors duration-200 ease-in-out w-[90%] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
