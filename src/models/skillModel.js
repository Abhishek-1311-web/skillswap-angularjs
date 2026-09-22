const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categoryId: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
