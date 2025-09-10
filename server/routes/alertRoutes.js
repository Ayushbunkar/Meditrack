const express = require('express');
const Alert = require('../models/Alert');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Trigger alert for a medicine
router.post('/trigger', auth, async (req, res) => {
  const { medicineId, time } = req.body;
  try {
    const med = await Medicine.findById(medicineId);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    const alert = new Alert({
      userId: req.user.id,
      medicineId,
      time,
      status: 'missed', // default to missed until user confirms
    });
    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as taken
router.post('/taken', auth, async (req, res) => {
  const { alertId } = req.body;
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId: req.user.id },
      { status: 'taken', timestamp: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as missed
router.post('/missed', auth, async (req, res) => {
  const { alertId } = req.body;
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId: req.user.id },
      { status: 'missed', timestamp: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alert history for user
router.get('/history', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).populate('medicineId');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
