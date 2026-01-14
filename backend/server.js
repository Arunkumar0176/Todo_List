const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/todolist', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('❌ Full error:', err);
    process.exit(1);
  }
};

// Connect to MongoDB first
connectDB().then(() => {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/users', userRoutes);
  
  // Health check route
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({ 
      status: 'ok', 
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(' Error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  });
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/api/auth/test`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});