const mongoose = require('mongoose');

const checkDBConnection = (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection not available. Please try again later.' 
      });
    }
    next();
  } catch (error) {
    console.error(' Error in checkDBConnection:', error);
    return res.status(500).json({ message: 'Middleware error: ' + error.message });
  }
};

module.exports = { checkDBConnection };


//./mongod --dbpath /Users/arun/Downloads/db