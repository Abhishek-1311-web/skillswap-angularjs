const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Category = require('../models/categoryModel');
const Skill = require('../models/skillModel');
const Student = require('../models/studentModel');
const Request = require('../models/requestModel');
const Connection = require('../models/connectionModel');
const Session = require('../models/sessionModel');
const Report = require('../models/reportModel');
const Notification = require('../models/notificationModel');
const { seedData } = require('../services/seedService');

const buildIdQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ id: id }, { _id: id }] };
  }
  return { id: id };
};

// Health & Seeder
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap CRUD API running' });
});

router.post('/seed', async (req, res) => {
  try {
    await seedData();
    res.json({ message: 'Seed data generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all data combined
router.get('/data', async (req, res) => {
  try {
    const [categories, skills, students, requests, connections, sessions, reports, notifications] = await Promise.all([
      Category.find().lean(),
      Skill.find().lean(),
      Student.find().lean(),
      Request.find().lean(),
      Connection.find().lean(),
      Session.find().lean(),
      Report.find().lean(),
      Notification.find().lean()
    ]);

    res.json({ categories, skills, students, requests, connections, sessions, reports, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STUDENTS CRUD ====================
// CREATE Student
router.post('/students', async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.id) {
      studentData.id = 'u_' + Date.now();
    }
    if (!studentData.code) {
      studentData.code = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const student = new Student(studentData);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ All Students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ Single Student
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findOne(buildIdQuery(req.params.id)).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE Student
router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE Student
router.delete('/students/:id', async (req, res) => {
  try {
    const result = await Student.findOneAndDelete(buildIdQuery(req.params.id));
    if (!result) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AUTH Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email: email.toLowerCase(), password });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ student, role: 'student' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SKILLS CRUD ====================
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find().lean();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const skillData = req.body;
    if (!skillData.id) skillData.id = 's_' + Date.now();
    const skill = new Skill(skillData);
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body,
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    const result = await Skill.findOneAndDelete(buildIdQuery(req.params.id));
    if (!result) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== REQUESTS CRUD ====================
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().lean();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const reqData = req.body;
    if (!reqData.id) reqData.id = 'r_' + Date.now();
    const requestItem = new Request(reqData);
    await requestItem.save();
    res.status(201).json(requestItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/requests/:id', async (req, res) => {
  try {
    const requestItem = await Request.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body,
      { new: true }
    );
    if (!requestItem) return res.status(404).json({ message: 'Request not found' });
    res.json(requestItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/requests/:id', async (req, res) => {
  try {
    const result = await Request.findOneAndDelete(buildIdQuery(req.params.id));
    if (!result) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SESSIONS CRUD ====================
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().lean();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    if (!sessionData.id) sessionData.id = 'sess_' + Date.now();
    const session = new Session(sessionData);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      buildIdQuery(req.params.id),
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const result = await Session.findOneAndDelete(buildIdQuery(req.params.id));
    if (!result) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CATEGORIES CRUD ====================
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const catData = req.body;
    if (!catData.id) catData.id = 'c_' + Date.now();
    const category = new Category(catData);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ==================== NOTIFICATIONS ====================
router.get('/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).lean();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
