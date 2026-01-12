const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Test route without MongoDB
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test signup without MongoDB
router.post('/test-signup', (req, res) => {
  const { name, email, password } = req.body;
  res.json({ 
    message: 'Test signup successful', 
    data: { name, email, password },
    timestamp: new Date()
  });
});

router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup attempt:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = new User({ name, email, password });
    await user.save();
    console.log(' User saved to MongoDB:', user._id);

    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    console.error(' Signup error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error'});
  }
});

module.exports = router;