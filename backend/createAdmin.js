const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todolist')
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' Error:', err));

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@todolist.com' });
    
    if (existingAdmin) {
      console.log(' Admin user already exists');
      process.exit(0);
    }

    // Create new admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@todolist.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log(' Admin user created successfully!');
    // console.log(' Email: admin@todolist.com');
    // console.log(' Password: admin123');
    // console.log(' Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
