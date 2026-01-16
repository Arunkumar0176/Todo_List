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

// Check database connection for signup and login routes
router.post('/signup', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected' });
  }
  try {
    const { name, email, password, employeeId } = req.body;
    
    console.log('📝 Signup request:', { name, email, employeeId: employeeId || 'NOT PROVIDED' });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const ADMIN_EMPLOYEE_ID = 'ARUN12345';
    let userRole = 'user';
    
    // Check if employeeId provided for admin account
    if (employeeId) {
      console.log('🔑 Employee ID provided:', employeeId);
      if (employeeId !== ADMIN_EMPLOYEE_ID) {
        console.log('❌ Invalid employee ID');
        return res.status(400).json({ message: 'Invalid employee ID' });
      }
      userRole = 'admin';
      console.log('✅ Valid employee ID - Creating ADMIN account');
    } else {
      console.log('👤 No employee ID - Creating USER account');
    }
    
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password,
      role: userRole
    });
    
    await user.save();
    console.log('✅ User saved - Role:', user.role);
    
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: `${userRole === 'admin' ? 'Admin' : 'User'} created successfully`, 
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected' });
  }
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ ${user.role === 'admin' ? 'Admin' : 'User'} logged in: ${user.name} (${user.email}) - Role: ${user.role}`);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;