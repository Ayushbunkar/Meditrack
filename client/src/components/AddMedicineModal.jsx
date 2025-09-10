import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AddMedicineModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ name: '', time: '', dosage: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.time || !form.dosage) {
      setError('All fields are required');
      return;
    }
    onAdd(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60"
    >
      <motion.form
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#1e1e1e] p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-neutral-800 hover:scale-[1.02] hover:shadow-indigo-500/20 transform-gpu duration-200"
        whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #6366f144' }}
      >
        <h3 className="text-xl font-bold mb-4 text-indigo-400">Add Medicine</h3>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-[#18181b] text-[#e5e5e5]"
          />
        </div>
        <div className="mb-3">
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-[#18181b] text-[#e5e5e5]"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="dosage"
            placeholder="Dosage (e.g. 1 tablet)"
            value={form.dosage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-[#18181b] text-[#e5e5e5]"
          />
        </div>
        {error && <div className="mb-2 text-red-500 text-center">{error}</div>}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-[#23272f] text-[#e5e5e5] rounded-lg hover:bg-[#18181b] transition-colors duration-150 border border-neutral-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white rounded-lg font-semibold hover:from-[#818cf8] hover:to-[#6366f1] transition-colors duration-150 shadow"
          >
            Add
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddMedicineModal;
