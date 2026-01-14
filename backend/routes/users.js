const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// Inline DB check
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected' });
  }
  next();
});

// Get all users (for testing/verification - remove in production or add admin auth)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords
    console.log(` Found ${users.length} users in database`);
    res.json({ 
      count: users.length,
      users: users 
    });
  } catch (error) {
    console.error(' Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user count
router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments({});
    console.log(` Total users in database: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error(' Error counting users:', error.message);
    res.status(500).json({ message: 'Error counting users' });
  }
});

// Get user by email (for testing)
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (user) {
      console.log(` User found: ${user.email}`);
      res.json({ found: true, user });
    } else {
      console.log(` User not found: ${req.params.email}`);
      res.json({ found: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(' Error finding user:', error.message);
    res.status(500).json({ message: 'Error finding user' });
  }
});

module.exports = router;
