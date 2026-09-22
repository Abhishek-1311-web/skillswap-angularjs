const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    connectionId: { type: String, required: true },
    skill: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    notes: { type: String },
    status: { type: String, default: 'Scheduled' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
