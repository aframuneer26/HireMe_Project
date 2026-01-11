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
app.use('/api/interview', interviewRoutes);



app.use('/api/internships', internshipRoutes);
app.use('/api/roles', roleRoutes);
console.log('🔍 Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
console.log('✅ Routes registered: /api/auth, /api/roadmap, /api/roles, and /api/internships');

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
