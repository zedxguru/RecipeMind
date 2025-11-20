const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  favorites: [{ type: Number }] // store Spoonacular recipe IDs (or mock ids)
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
