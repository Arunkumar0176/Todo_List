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
  // Check DB connection inline
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected' });
  }
  try {
    console.log('\n ========== SIGNUP ATTEMPT ==========');
    console.log(' Received data:', { 
      name: req.body.name, 
      email: req.body.email, 
      password: '***' 
    });
    
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      console.log(' Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(' Validation failed: Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      console.log(' Validation failed: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    console.log(' Checking if user already exists...');
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log(' User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.log(' Email is available');
    
    // Create new user
    console.log(' Creating new user document...');
    let user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: password,
      role: role || 'user' 
    });
    
    console.log(' Saving user to MongoDB...');
    console.log(' MongoDB connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    // Save user to database
    let savedUser;
    try {
      console.log(' Attempting to save user to MongoDB...');
      savedUser = await user.save();
      console.log(' user.save() completed successfully!');
      console.log(' Saved user details:', {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        passwordHash: savedUser.password ? 'Hashed (' + savedUser.password.length + ' chars)' : 'Missing'
      });
      
      // CRITICAL: Verify immediately after save
      console.log('🔍 Immediate verification after save...');
      const immediateCheck = await User.findById(savedUser._id);
      if (!immediateCheck) {
        console.error(' CRITICAL ERROR: User not found immediately after save!');
        console.error(' This means the save() call returned but data was not persisted!');
        throw new Error('User save operation failed - data not persisted to database');
      }
      console.log('Immediate verification passed');
      
      // Also verify by email
      console.log('🔍 Verifying by email query...');
      const userByEmail = await User.findOne({ email: savedUser.email });
      if (userByEmail) {
        console.log(' User found by email query:', userByEmail.email);
        console.log(' Email verification passed');
      } else {
        console.error(' CRITICAL: User not found by email query!');
        throw new Error('User not found in database after save operation');
      }
      
      // Update the user variable to use savedUser
      user = savedUser;
    } catch (saveError) {
      console.error(' ========== SAVE ERROR ==========');
      console.error(' Error saving user to MongoDB:', saveError);
      console.error(' Save error details:', {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue,
        errors: saveError.errors
      });
      console.error(' =================================');
      throw saveError; // Re-throw to be caught by outer catch
    }

    // CRITICAL: Final verification - wait a moment and check again
    console.log(' Waiting for database write to complete...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for write to complete
    
    // Final verification before sending response
    console.log(' Final verification before sending response...');
    const finalCheck = await User.findById(user._id);
    if (!finalCheck) {
      console.error(' CRITICAL: User not in database before sending response!');
      console.error(' User ID that was saved:', user._id);
      return res.status(500).json({ 
        message: 'User creation failed. Data was not saved to database. Please try again.' 
      });
    }
    console.log(' Final verification passed - User exists in database');

    // Generate JWT token only after verification
    console.log(' Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(' Token generated successfully');
    console.log('========== SIGNUP SUCCESS ==========\n');

    // Only send response after everything is verified
    res.status(201).json({ 
      message: 'User created successfully and saved to MongoDB', 
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('\n ========== SIGNUP ERROR ==========');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('=====================================\n');

    // Handle specific Mongoose errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    if (error.name === 'MongoServerError') {
      return res.status(400).json({ message: 'Database error: ' + error.message });
    }

    // Generic error
    res.status(500).json({ 
      message: error.message || 'Server error occurred. Please try again.' 
    });
  }
});

router.post('/login', async (req, res) => {
  // Check DB connection inline
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

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(` User logged in: ${user.name} (${user.email}) - User ID: ${user._id}`);

    // Generate JWT token
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
    console.error(' Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;