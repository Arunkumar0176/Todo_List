const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});


userSchema.pre('save', async function () {
  const user = this;

  // Only hash if password is new or modified
  if (!user.isModified('password')) return;

  // Prevent double hashing
  if (user.password.startsWith('$2')) return;

  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
