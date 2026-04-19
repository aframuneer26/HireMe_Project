const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  resumeText: String,
  status: { type: String, enum: ['on-going', 'completed'], default: 'on-going' },
  history: [
    {
      role: { type: String, enum: ['interviewer', 'candidate'] },
      content: String,
      feedback: String,
      score: Number
    }
  ],
  finalFeedback: String,
  overallScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);
