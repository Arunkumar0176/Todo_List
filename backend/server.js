const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://arungupta0984_db_user:65jO16xSayCl6ke6@cluster0.wv2najo.mongodb.net/loginpage?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => console.log(' MongoDB connected successfully'))
.catch(err => console.error(' MongoDB error:', err.message));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/auth/test`);
});