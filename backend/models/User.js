const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);

//arungupta0984_db_user
//bFRF6oCMcG1DzcHP
//mongodb+srv://arungupta0984_db_user:bFRF6oCMcG1DzcHP@cluster0.atnuzhv.mongodb.net/

