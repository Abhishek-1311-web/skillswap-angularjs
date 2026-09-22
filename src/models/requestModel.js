const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    teachSkill: { type: String, required: true },
    learnSkill: { type: String, required: true },
    message: { type: String },
    status: { type: String, default: 'Pending' },
    createdAt: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
