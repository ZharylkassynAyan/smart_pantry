const express = require('express');
const PantryItem = require('../models/PantryItem');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/pantry - get all items for the logged-in user, sorted by expiry date
router.get('/', protect, async (req, res) => {
  try {
    const items = await PantryItem.find({ user: req.user._id }).sort({
      expiryDate: 1,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/pantry - add a new item
router.post('/', protect, async (req, res) => {
  const { name, quantity, expiryDate, category } = req.body;

  if (!name || !quantity || !expiryDate) {
    return res
      .status(400)
      .json({ message: 'Please provide name, quantity, and expiry date' });
  }

  try {
    const item = await PantryItem.create({
      user: req.user._id,
      name,
      quantity,
      expiryDate,
      category: category || 'Other',
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/pantry/:id - update an item
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { name, quantity, expiryDate, category } = req.body;
    if (name) item.name = name;
    if (quantity) item.quantity = quantity;
    if (expiryDate) item.expiryDate = expiryDate;
    if (category) item.category = category;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/pantry/:id - delete an item
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/pantry/expiring - items expiring within 7 days
router.get('/expiring', protect, async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const items = await PantryItem.find({
      user: req.user._id,
      expiryDate: { $gte: today, $lte: sevenDaysFromNow },
    }).sort({ expiryDate: 1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
