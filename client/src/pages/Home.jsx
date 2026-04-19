import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Map, Zap, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <FileText size={20} />,
    title: 'Resume Parsing',
    desc: 'Upload your PDF resume. We extract and analyze your skills automatically.',
    bg: 'rgba(255,255,255,0.05)',
    color: '#fff'
  },
  {
    icon: <Search size={20} />,
    title: 'JD Gap Analysis',
    desc: 'We compare your profile to the job description to find exact missing skills.',
    bg: 'rgba(255,255,255,0.05)',
    color: '#fff'
  },
  {
    icon: <Map size={20} />,
    title: 'AI Roadmap',
    desc: 'Gemini AI crafts a personalized, step-by-step learning roadmap to close every gap.',
    bg: 'rgba(255,255,255,0.05)',
    color: '#fff'
  },
  {
    icon: <Zap size={20} />,
    title: 'Mock Interview',
    desc: 'Real-time proctored AI interviews tailored to your resume and target role.',
    bg: 'rgba(255,255,255,0.05)',
    color: '#fff'
  },
];

const Home = () => (
  <div className="home-hero">
    <div className="home-badge" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'transparent', color: '#fff' }}>
      <Sparkles size={14} style={{ marginRight: '8px' }} /> ENTERPRISE ASSESSMENT SYSTEM
    </div>

    <h1 className="home-title">
      Close the skill gap<br />
      <span className="gradient-text">master your career</span>
    </h1>

    <p className="home-subtitle">
      The ultimate AI-driven platform for serious professionals. Analyze gaps, generate roadmaps, and practice with our proctored mock interview engine.
    </p>

    <div className="home-actions">
      <Link to="/register">
        <button className="btn btn-primary btn-lg">
          Get Started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
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
        <div className="feature-card" key={f.title} style={{ borderRadius: 4 }}>
          <div className="feature-icon" style={{ background: f.bg, color: f.color, borderRadius: 4 }}>
            {f.icon}
          </div>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Home;
