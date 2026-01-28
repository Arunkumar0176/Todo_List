const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Test route without MongoDB (no DB check needed)
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('\n ========== SIGNUP ATTEMPT ==========');
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error(' Database not connected');
      return res.status(503).json({ message: 'Database not connected' });
    }
    //read data from req.body
    const { name, email, password, employeeId } = req.body;
    
    // Validate input in form 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    //check the length of password
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists, calls model
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Determine role based
    const userRole = (employeeId === 'ARUN12345') ? 'admin' : 'user';
    
    // Create user in model for new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password,
      role: userRole
    });
    
    // Save user
    await user.save();
    console.log('User saved:', user.email);
    
    // Generate token for specific users
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' Signup successful\n');
    res.status(201).json({ 
      message: 'User created successfully', 
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
    
  } catch (error) {
    console.error('\n SIGNUP ERROR:');
    console.error('Message:', error.message);
    console.error('Name:', error.name);
    console.error('Code:', error.code);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('\n ========== LOGIN ATTEMPT ==========');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' Login successful\n');
    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('\n LOGIN ERROR:');
    console.error('Message:', error.message);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
