import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MedicineBox from '../components/MedicineBox';
import AddMedicineModal from '../components/AddMedicineModal';
import { format } from 'date-fns';
import { API_URL } from '../api';

// Build API URL: use Vite proxy in dev; normalize base in prod
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = (API_URL || 'https://meditrack-3.onrender.com').replace(/\/+$/, '');
const api = (path) => (isDev ? `/api${path}` : `${API_BASE}/api${path}`);
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Dashboard = () => {
  const [meds, setMeds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({ taken: 0, missed: 0 });
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const beepRef = useRef(null);

  // Fetch medicines
  const fetchMeds = async () => {
    try {
      const res = await fetch(api('/meds'), {
        headers: {
          ...authHeaders(),
        },
      });
      if (res.status === 401) {
        // optional: redirect to login
        // navigate('/login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to load meds');
      const data = await res.json();
      setMeds(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch alert stats
  const fetchStats = async () => {
    try {
      const res = await fetch(api('/alerts/history'), {
        headers: {
          ...authHeaders(),
        },
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      const taken = data.filter(a => a.status === 'taken').length;
      const missed = data.filter(a => a.status === 'missed').length;
      setStats({ taken, missed });
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch alert history
  const fetchAlerts = async () => {
    try {
      const res = await fetch(api('/alerts/history'), {
        headers: {
          ...authHeaders(),
        },
      });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error('Failed to load alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeds();
    fetchStats();
    fetchAlerts();
  }, []);

  // Called by AddMedicineModal on submit
  const handleAdd = async (newMedicine) => {
    try {
      const res = await fetch(api('/meds'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(newMedicine),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error(data?.message || 'Failed to add medicine');
      setShowModal(false);
      fetchMeds();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle checkbox toggle
  const handleStatusChange = async (alertId, checked) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/alerts/${checked ? 'taken' : 'missed'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ alertId }),
    });
    fetchStats();
    fetchAlerts();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen w-full bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] text-[#e5e5e5] flex flex-col items-center px-4 sm:px-8 md:px-16"
    >
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="w-full text-center text-4xl font-extrabold text-white drop-shadow-lg tracking-wider mb-8 mt-12"
        style={{ letterSpacing: '0.1em' }}
      >
        User Dashboard
      </motion.header>
      <div className="w-full max-w-2xl">
        <MedicineBox meds={meds} />
        {/* Medicine status list with checkboxes */}
        <div className="mt-8 bg-[#18181b] rounded-2xl shadow-lg p-6 border border-neutral-800">
          <h3 className="text-xl font-bold mb-4 text-white">Today's Medicine Status</h3>
          <p className="mb-4 text-[#a1a1aa] text-sm">You’ll see a list of today’s medicines with checkboxes. If the checkbox is checked, the medicine is marked as “Taken.” If unchecked, it’s “Missed.” Click the checkbox to toggle the status. This sends a request to the backend and updates the stats and UI.</p>
          {alerts.length === 0 ? (
            <p className="text-[#a1a1aa]">No medicine alerts for today.</p>
          ) : (
            <ul>
              {alerts.filter(a => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const alertDate = format(new Date(a.timestamp), 'yyyy-MM-dd');
                if (today !== alertDate) return false;
                if (filter === 'all') return true;
                return a.status === filter;
              }).map(a => (
                <li key={a._id} className="flex items-center justify-between border-b border-neutral-800 last:border-b-0 py-2">
                  <div>
                    <span className="font-semibold text-indigo-400">{a.medicineId?.name || 'Unknown'}</span>
                    <span className="ml-2 text-[#a1a1aa]">{a.time} | {a.medicineId?.dosage}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={a.status === 'taken'}
                      onChange={e => handleStatusChange(a._id, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-neutral-700 bg-[#23272f]"
                    />
                    <span className={a.status === 'taken' ? 'text-green-400' : 'text-red-400'}>
                      {a.status === 'taken' ? 'Taken' : 'Missed'}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex gap-2 sm:gap-4 md:gap-8 justify-center flex-wrap">
          <button
            className={`bg-[#1e1e1e] px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow border border-neutral-800 text-[#e5e5e5] font-semibold min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base transition-colors duration-150 ${filter === 'taken' ? 'ring-2 ring-green-400' : ''}`}
            onClick={() => setFilter('taken')}
          >
             Taken: {stats.taken}
          </button>
          <button
            className={`bg-[#1e1e1e] px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow border border-neutral-800 text-[#e5e5e5] font-semibold min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base transition-colors duration-150 ${filter === 'missed' ? 'ring-2 ring-red-400' : ''}`}
            onClick={() => setFilter('missed')}
          >
             Missed: {stats.missed}
          </button>
          <button
            className={`bg-[#23272f] px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow border border-neutral-800 text-[#a1a1aa] font-semibold min-w-[100px] sm:min-w-[120px] text-center text-sm sm:text-base transition-colors duration-150 ${filter === 'all' ? 'ring-2 ring-indigo-400' : ''}`}
            onClick={() => setFilter('all')}
          >
            Show All
          </button>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white"
          onClick={() => setShowModal(true)}
        >
          + Add Medicine
        </motion.button>
      </div>
      <AnimatePresence>
        {showModal && (
          <AddMedicineModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
