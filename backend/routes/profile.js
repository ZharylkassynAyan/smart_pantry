const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - get user profile
router.get('/', protect, (req, res) => {
  const { _id, name, email, household, notifications } = req.user;
  res.json({ id: _id, name, email, household, notifications });
});

// PUT /api/profile - update user profile
router.put('/', protect, async (req, res) => {
  const { name, household, notifications } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (name) user.name = name;

    if (household) {
      if (household.name !== undefined) user.household.name = household.name;
      if (household.membersCount !== undefined)
        user.household.membersCount = household.membersCount;
    }

    if (notifications) {
      if (notifications.expiryAlerts !== undefined)
        user.notifications.expiryAlerts = notifications.expiryAlerts;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      household: user.household,
      notifications: user.notifications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
