const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },
    teach: [{ type: String }],
    learn: [{ type: String }],
    status: { type: String, default: 'Active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
