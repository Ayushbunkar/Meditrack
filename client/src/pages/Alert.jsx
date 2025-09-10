import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AlertCard from '../components/AlertCard';
import MedicineBox from '../components/MedicineBox';

const Alert = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const beepRef = useRef(null);
  const { medicine, alertId } = location.state || {};
  const [meds, setMeds] = useState([]);
  const [stats, setStats] = useState({ taken: 0, missed: 0 });

  // Fetch medicines
  const fetchMeds = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/meds', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMeds(data);
  };

  // Fetch alert stats
  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/alerts/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const taken = data.filter(a => a.status === 'taken').length;
    const missed = data.filter(a => a.status === 'missed').length;
    setStats({ taken, missed });
  };

  useEffect(() => {
    fetchMeds();
    fetchStats();
    beepRef.current?.play();
  }, []);

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/alerts/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ alertId }),
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] px-2 sm:px-4 md:px-8 text-[#e5e5e5]">
      <div className="w-full max-w-2xl mt-8">
        <MedicineBox meds={meds} />
        <div className="mt-6 flex gap-4 md:gap-8 justify-center flex-wrap">
          <div className="bg-[#1e1e1e] px-6 py-3 rounded-lg shadow border border-neutral-800 text-[#e5e5e5] font-semibold">
            ✅ Taken: {stats.taken}
          </div>
          <div className="bg-[#1e1e1e] px-6 py-3 rounded-lg shadow border border-neutral-800 text-[#e5e5e5] font-semibold">
            ❌ Missed: {stats.missed}
          </div>
        </div>
      </div>
      {medicine && (
        <AlertCard
          medicine={medicine}
          onTaken={() => handleAction('taken')}
          onMissed={() => handleAction('missed')}
        />
      )}
      <audio ref={beepRef} src="https://www.soundjay.com/buttons/beep-07.mp3" autoPlay />
    </div>
  );
};

export default Alert;
