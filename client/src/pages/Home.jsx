import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Map, Zap, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <FileText size={20} />,
    title: 'Resume Parsing',
    desc: 'Upload your PDF resume. We extract and analyze your skills automatically.',
    bg: 'rgba(99,102,241,0.1)',
    color: '#818cf8'
  },
  {
    icon: <Search size={20} />,
    title: 'JD Gap Analysis',
    desc: 'We compare your profile to the job description to find exact missing skills.',
    bg: 'rgba(45,212,191,0.1)',
    color: '#2dd4bf'
  },
  {
    icon: <Map size={20} />,
    title: 'AI Roadmap',
    desc: 'Gemini AI crafts a personalized, step-by-step learning roadmap to close every gap.',
    bg: 'rgba(251,191,36,0.1)',
    color: '#fbbf24'
  },
  {
    icon: <Zap size={20} />,
    title: 'Quick Wins',
    desc: 'Actionable things you can start this week to immediately boost your candidacy.',
    bg: 'rgba(248,113,113,0.1)',
    color: '#f87171'
  },
];

const Home = () => (
  <div className="home-hero">
    <div className="home-badge">
      <Sparkles size={14} style={{ marginRight: '8px' }} /> AI-Powered Career Intelligence
    </div>

    <h1 className="home-title">
      Land your dream job<br />
      <span className="gradient-text">faster than ever before</span>
    </h1>

    <p className="home-subtitle">
      Upload your resume and a job description. Our AI analyzes the gap, then builds you a precise roadmap to become the perfect candidate.
    </p>

    <div className="home-actions">
      <Link to="/register">
        <button className="btn btn-primary btn-lg">
          Get Started Free <ArrowRight size={18} style={{ marginLeft: '8px' }} />
        </button>
      </Link>
      <Link to="/login">
        <button className="btn btn-ghost btn-lg">
          Sign In
        </button>
      </Link>
    </div>

    <div className="home-features">
      {features.map((f) => (
        <div className="feature-card" key={f.title}>
          <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
            {f.icon}
          </div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Home;
