import React from 'react';
import { motion } from 'framer-motion';

const MedicineBox = ({ meds }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#1e1e1e] backdrop-blur-md rounded-2xl shadow-2xl p-6 text-[#e5e5e5] border border-neutral-800 hover:scale-[1.02] hover:shadow-indigo-500/20 transform-gpu duration-200"
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-xl font-bold mb-4 text-white">Medicine Reminder Box</h3>
    {meds.length === 0 ? (
      <p className="text-[#a1a1aa]">No medicines scheduled.</p>
    ) : (
      <ul>
        {meds.map(med => (
          <li key={med._id} className="mb-2 flex justify-between items-center border-b border-neutral-800 last:border-b-0 py-2">
            <span className="font-semibold text-indigo-400">{med.name}</span>
            <span className="text-[#a1a1aa]">{med.time} | {med.dosage}</span>
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

export default MedicineBox;
