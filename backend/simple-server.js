const express = require('express');
const cors = require('cors');

const app = express(); 

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple server working!' });
});

// Simple signup route
app.post('/signup', (req, res) => {
  console.log('Received:', req.body);
  res.json({ 
    message: 'Signup received!', 
    data: req.body
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
});