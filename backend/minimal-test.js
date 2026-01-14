const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todolist')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(' MongoDB error:', err));

// Simple test route
app.post('/api/test', async (req, res) => {
  try {
    console.log('Test route called');
    res.json({ message: 'Success', data: req.body });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(3001, () => {
  console.log(' Minimal test server on port 3001');
});


//./mongod --dbpath /Users/arun/Downloads/db