const mongoose = require('mongoose');

const CoolDownSchema = new mongoose.Schema({
  key: { type: String, unique: true },   // e.g. "EMP001||ServerRoom"
  lastTime: Number                       // in minutes (since midnight)
});

module.exports = mongoose.model('CoolDown', CoolDownSchema);
