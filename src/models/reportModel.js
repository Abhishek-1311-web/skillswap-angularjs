const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    reporterId: { type: String, required: true },
    reportedUserId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: 'Pending' },
    adminAction: { type: String, default: '' },
    createdAt: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
