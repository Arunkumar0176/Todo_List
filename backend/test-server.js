const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test middleware
const testMiddleware = (req, res, next) => {
  console.log('Middleware called, next type:', typeof next);
  if (typeof next !== 'function') {
    console.error('ERROR: next is not a function!');
    return res.status(500).json({ error: 'Middleware error' });
  }
  next();
};

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todolist')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Test route
app.post('/test', testMiddleware, (req, res) => {
  res.json({ message: 'Test successful' });
});

app.listen(3001, () => {
  console.log('🚀 Test server running on port 3001');
});
