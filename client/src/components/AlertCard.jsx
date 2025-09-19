import React from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../api';

const AlertCard = ({ medicine, alertId, onTaken, onMissed }) => {
  const handleTaken = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/alerts/taken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ alertId }),
    });
    if (onTaken) onTaken();
  };

  const handleMissed = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/alerts/missed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ alertId }),
    });
    if (onMissed) onMissed();
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#1e1e1e] p-8 rounded-2xl shadow-2xl border border-neutral-800 text-[#e5e5e5] hover:scale-[1.03] transform-gpu duration-200"
      whileHover={{ scale: 1.03 }}
    >
      <h2 className="text-2xl font-bold mb-2 text-white">Did you take your medicine?</h2>
      <div className="mb-4 text-lg">
        <div><span className="font-semibold text-[#a1a1aa]">Name:</span> {medicine.name}</div>
        <div><span className="font-semibold text-[#a1a1aa]">Dosage:</span> {medicine.dosage}</div>
        <div><span className="font-semibold text-[#a1a1aa]">Time:</span> {medicine.time}</div>
      </div>
      <div className="flex gap-4 mt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="px-6 py-2 rounded-xl font-semibold shadow bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white transition"
          onClick={handleTaken}
        >
          ✅ Taken
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="px-6 py-2 rounded-xl font-semibold shadow bg-[#23272f] hover:bg-[#18181b] text-[#e5e5e5] border border-neutral-800 transition"
          onClick={handleMissed}
        >
          ❌ Missed
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AlertCard;
