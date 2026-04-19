const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const roleRoutes = require('./routes/roleRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

console.log('🔍 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/mcq', require('./routes/mcqRoutes'));
app.use('/api/code', require('./routes/codeRoutes'));
console.log('✅ Routes registered: Auth, Roadmap, Roles, Internships, Interview, Resources, MCQ, Code');

// Database Connection
console.log('🔗 Connecting to MongoDB:', process.env.MONGO_URI);
mongoose.set('bufferCommands', false); // Disable buffering so it fails fast if not connected

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Failed!');
  console.error('   Error:', err.message);
  console.log('   Ensure MongoDB is running locally at 127.0.0.1:27017');
});

// Test Route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
