const Category = require('../models/categoryModel');
const Skill = require('../models/skillModel');
const Student = require('../models/studentModel');
const Request = require('../models/requestModel');
const Connection = require('../models/connectionModel');
const Session = require('../models/sessionModel');
const Report = require('../models/reportModel');
const Notification = require('../models/notificationModel');

const CATEGORY_SEED = ["Programming", "Web Development", "Design", "Photography", "Video Editing", "Communication", "Languages", "Music", "Sports", "Academics", "Other"];

const SKILL_SEED = [
  ["Java", "Programming"], ["Python", "Programming"], ["JavaScript", "Programming"],
  ["React", "Web Development"], ["Photoshop", "Design"], ["UI/UX Design", "Design"],
  ["Illustrator", "Design"], ["Figma", "Design"], ["Video Editing", "Video Editing"],
  ["Photography", "Photography"], ["Public Speaking", "Communication"], ["Spanish", "Languages"],
  ["Guitar", "Music"], ["Football", "Sports"], ["Calculus", "Academics"], ["Excel", "Other"],
];

const seedData = async () => {
  const categoryCount = await Category.countDocuments();
  if (categoryCount > 0) return;

  const categories = CATEGORY_SEED.map((name, i) => ({ id: 'c' + i, name }));
  const catId = (name) => categories.find((c) => c.name === name).id;

  const skills = SKILL_SEED.map(([name, cat], i) => ({ id: 's' + i, name, categoryId: catId(cat) }));
  const sid = (name) => skills.find((s) => s.name === name).id;

  const students = [
    { id: 'u1', code: '104582', name: 'Arun Kumar', email: 'arun@example.com', password: 'pass123', department: 'Computer Science', year: '2nd Year', bio: 'I love building things and figuring out design software.', avatarSeed: 'Arun', teach: [sid('Java'), sid('Photoshop'), sid('Video Editing')], learn: [sid('Python'), sid('UI/UX Design')], availability: 'Weekday evenings', exchanges: 3, status: 'Active', verified: true, createdAt: '2026-07-02' },
    { id: 'u2', code: '227916', name: 'Divya Suresh', email: 'divya@example.com', password: 'pass123', department: 'Information Technology', year: '3rd Year', bio: 'Backend dev by day, occasional UI dabbler.', avatarSeed: 'Divya', teach: [sid('Python'), sid('UI/UX Design')], learn: [sid('Java'), sid('Guitar')], availability: 'Weekends', exchanges: 5, status: 'Active', verified: true, createdAt: '2026-06-18' },
    { id: 'u3', code: '358204', name: 'Karthik Raman', email: 'karthik@example.com', password: 'pass123', department: 'Electronics & Comm.', year: '1st Year', bio: 'Play guitar in a band, curious about editing photos.', avatarSeed: 'Karthik', teach: [sid('Guitar'), sid('Football')], learn: [sid('Photoshop'), sid('Public Speaking')], availability: 'Weekday mornings', exchanges: 1, status: 'Active', verified: true, createdAt: '2026-07-20' },
    { id: 'u4', code: '461739', name: 'Meera Nair', email: 'meera@example.com', password: 'pass123', department: 'Computer Science', year: '3rd Year', bio: 'Frontend enthusiast, want to pick up a new language.', avatarSeed: 'Meera', teach: [sid('React'), sid('JavaScript')], learn: [sid('Spanish'), sid('Illustrator')], availability: 'Evenings', exchanges: 2, status: 'Active', verified: true, createdAt: '2026-06-30' },
    { id: 'u5', code: '590127', name: 'Rahul Verma', email: 'rahul@example.com', password: 'pass123', department: 'Mechanical Engineering', year: '2nd Year', bio: 'Decent with spreadsheets, want to get into web dev.', avatarSeed: 'Rahul', teach: [sid('Public Speaking'), sid('Excel')], learn: [sid('React'), sid('Figma')], availability: 'Flexible', exchanges: 0, status: 'Active', verified: false, createdAt: '2026-08-10' },
    { id: 'u6', code: '643850', name: 'Sara Fernandes', email: 'sara@example.com', password: 'pass123', department: 'Design', year: '2nd Year', bio: 'Illustrator + Figma person, learning to code a little.', avatarSeed: 'Sara', teach: [sid('Illustrator'), sid('Figma')], learn: [sid('Java'), sid('Excel')], availability: 'Weekends', exchanges: 1, status: 'Active', verified: true, createdAt: '2026-07-11' },
  ];

  const requests = [
    { id: 'r1', senderId: 'u3', receiverId: 'u1', teachSkill: sid('Guitar'), learnSkill: sid('Photoshop'), message: 'Hi Arun, I can teach you Guitar and would love to learn Photoshop from you.', status: 'Pending', createdAt: '2026-08-11' },
  ];

  const connections = [
    { id: 'cn1', student1Id: 'u1', student2Id: 'u2', status: 'Accepted' },
  ];

  const sessions = [
    { id: 'sess1', connectionId: 'cn1', skill: sid('Java'), date: '2026-08-20', time: '14:00', location: 'Main Library', notes: 'Bring a laptop with JDK installed.', status: 'Scheduled' },
  ];

  const reports = [
    { id: 'rep1', reporterId: 'u4', reportedUserId: 'u6', reason: 'Misleading skill information', description: 'Listed skills seem inflated compared to actual portfolio shared.', status: 'Pending', adminAction: '', createdAt: '2026-08-09' },
  ];

  const notifications = [
    { id: 'n1', userId: 'u1', text: 'Karthik Raman sent you a skill exchange request.', read: false, createdAt: '2026-08-11' },
    { id: 'n2', userId: 'u1', text: 'Session with Divya Suresh scheduled for 20 Aug.', read: false, createdAt: '2026-08-10' },
    { id: 'n3', userId: 'u2', text: 'Your connection with Arun Kumar is now active.', read: true, createdAt: '2026-08-05' },
  ];

  await Category.insertMany(categories);
  await Skill.insertMany(skills);
  await Student.insertMany(students);
  await Request.insertMany(requests);
  await Connection.insertMany(connections);
  await Session.insertMany(sessions);
  await Report.insertMany(reports);
  await Notification.insertMany(notifications);

  console.log('Seed data loaded into MongoDB');
};

module.exports = { seedData };
