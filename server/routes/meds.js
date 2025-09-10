const express = require('express');
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all medicines for user
router.get('/', auth, async (req, res) => {
  try {
    const meds = await Medicine.find({ userId: req.user.id });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new medicine
router.post('/', auth, async (req, res) => {
  const { name, time, dosage } = req.body;
  try {
    const med = new Medicine({ userId: req.user.id, name, time, dosage });
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
