import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MedicineBox from '../components/MedicineBox';
import AddMedicineModal from '../components/AddMedicineModal';
import AlertCard from '../components/AlertCard';
import { useNavigate } from 'react-router-dom';
import doctorImg from '../assets/meditrek.jpg'; // doctor image

const Home = () => {
  const [meds, setMeds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alertMed, setAlertMed] = useState(null);
  const [stats, setStats] = useState({ taken: 0, missed: 0 });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const beepRef = useRef(null);
  const navigate = useNavigate();

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

  // Medicine alerts every minute
  useEffect(() => {
    fetchMeds();
    fetchStats();

    const interval = setInterval(() => {
      const now = new Date();
      const current = now.toTimeString().slice(0, 5);
      const found = meds.find(m => m.time === current);
      if (found) {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/alerts/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ medicineId: found._id, time: current }),
        })
          .then(res => res.json())
          .then(alert => {
            setAlertMed({ ...found, alertId: alert._id });
            beepRef.current?.play();
            navigate('/alert', { state: { medicine: found, alertId: alert._id } });
          });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [meds, navigate]);

  // Add new medicine
  const handleAdd = async (med) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:5000/api/meds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(med),
    });
    setShowModal(false);
    fetchMeds();
  };

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') console.log('Meditrek installed!');
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <>
     

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="min-h-screen w-full bg-gradient-to-br from-[#0d0d0d] via-[#121212] to-[#1a1a1a] text-[#e5e5e5] flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-8 lg:px-16"
      >
        <div className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
          <img
            src={doctorImg}
            alt="Doctor"
            className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-2xl shadow-2xl bg-[#1e1e1e]/60 border border-neutral-800"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start md:ml-12">
          <motion.h1
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg text-center md:text-left"
          >
            MediTrack
          </motion.h1>
          <motion.p
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, type: 'spring' }}
            className="max-w-xl text-lg sm:text-xl md:text-2xl text-[#a1a1aa] font-medium mb-12 text-center md:text-left"
          >
            Your personal medicine reminder and health companion. Stay on track, stay healthy, and let MediTrack take care of your medicine schedule.
          </motion.p>
          <div className="w-full flex justify-center md:justify-start mb-4">
            {/* Install Button - Moved Inside Content Div */}
            {deferredPrompt && (
              <motion.button
                onClick={handleInstall}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1] text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2"
              >
                Install MediTrack
              </motion.button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            className="mt-2 px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-200 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#818cf8] hover:to-[#6366f1]"
            onClick={() => setShowModal(true)}
          >
            + Add Medicine
          </motion.button>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showModal && <AddMedicineModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
          {alertMed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
            >
              <AlertCard
                medicine={alertMed}
                alertId={alertMed.alertId}
                onTaken={() => {
                  setAlertMed(null);
                  fetchStats();
                }}
                onMissed={() => {
                  setAlertMed(null);
                  fetchStats();
                }}
              />
              <audio ref={beepRef} src="https://www.soundjay.com/buttons/beep-07.mp3" autoPlay />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Home;
