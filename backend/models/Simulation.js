const mongoose = require('mongoose');

const SimSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  input: { type: Array },
  result: { type: Array }
});

module.exports = mongoose.model('Simulation', SimSchema);
