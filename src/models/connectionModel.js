const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    student1Id: { type: String, required: true },
    student2Id: { type: String, required: true },
    status: { type: String, default: 'Accepted' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
