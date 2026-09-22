require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedData } = require('./src/services/seedService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection Logic
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI && !mongoURI.includes('<db_password>')) {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully to Atlas');
      await seedData();
      return;
    } catch (err) {
      console.error('MongoDB Atlas connection failed:', err.message);
      console.log('Starting in-memory fallback database...');
    }
  } else if (mongoURI && mongoURI.includes('<db_password>')) {
    console.warn('⚠️ Warning: You have "<db_password>" placeholder in your .env file!');
    console.warn('⚠️ Please replace <db_password> with your real MongoDB Atlas password in .env');
    console.log('Starting in-memory fallback database...');
  }

  try {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('MongoDB connected to in-memory database successfully');
    await seedData();
  } catch (err) {
    console.error('In-memory MongoDB connection failed:', err.message);
  }
};

// API Routes
app.use('/api', require('./src/routes/api'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillSwap backend running with MongoDB Atlas' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SkillSwap Backend running on http://localhost:${PORT}`);
  });
});
