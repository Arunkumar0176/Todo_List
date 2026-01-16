const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');

const router = express.Router();

// Admin Employee ID (hardcoded for now)
const ADMIN_EMPLOYEE_ID = 'ARUN12345';

// Verify admin employee ID (public route)
router.post('/verify', async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (employeeId === ADMIN_EMPLOYEE_ID) {
      res.json({ success: true, message: 'Admin access granted' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid employee ID' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected admin routes - require authentication AND admin role
router.use(authenticateToken);
router.use(checkRole('admin'));

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all todos (admin only)
router.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find({}).populate('user', 'name email');
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTodos = await Todo.countDocuments({});
    const completedTodos = await Todo.countDocuments({ completed: true });
    const pendingTodos = await Todo.countDocuments({ completed: false });
    
    res.json({
      totalUsers,
      totalTodos,
      completedTodos,
      pendingTodos
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
