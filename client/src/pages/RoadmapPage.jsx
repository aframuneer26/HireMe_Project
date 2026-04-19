import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Paperclip, 
  Search, 
  Map as MapIcon, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  RefreshCcw, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const RoadmapPage = () => {
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else if (f) {
      setError('Only PDF files are supported.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setError('Only PDF files are supported.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please upload your resume PDF.'); return; }
    if (!jd.trim()) { setError('Please paste the Job Description.'); return; }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jd);

      const res = await axios.post(
        'http://localhost:5000/api/roadmap/generate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <p className="section-label">AI Skill Gap Analyzer</p>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Resume vs Job Description
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload your resume and paste the job description. Our AI will identify your gaps and build a personalized learning roadmap.
        </p>
      </div>

      {/* ── Input Form ──────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 24, marginBottom: 24 }}>

          {/* Resume Upload */}
          <div>
            <label className="field-label">Your Resume</label>
            <div
              className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ padding: '40px 24px' }}
            >
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="file-upload-icon" style={{ marginBottom: '16px' }}>
                <Paperclip size={32} color={dragOver ? 'var(--accent)' : 'var(--text-subtle)'} />
              </div>
              <p className="file-upload-text">
                <strong style={{ color: 'var(--accent-2)' }}>Click to upload</strong> or drag & drop your resume
              </p>
              <p className="file-upload-text" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                PDF only · Max 5MB
              </p>
            </div>
            {file && (
              <div style={{ marginTop: 12 }}>
                <span className="file-name-badge">
                  <CheckCircle size={14} style={{ marginRight: '6px' }} /> {file.name}
                </span>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="field-label" htmlFor="jd-input">Job Description</label>
            <div style={{ position: 'relative' }}>
              <textarea
                id="jd-input"
                className="field-textarea"
                placeholder="Paste the full job description here — requirements, responsibilities, tech stack…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                style={{ minHeight: 180, paddingLeft: '44px' }}
                required
              />
              <ClipboardList size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            </div>
          </div>

        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <button
          id="analyze-btn"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Analyzing your profile…
            </>
          ) : (
            <>
              <Zap size={18} style={{ marginRight: '8px' }} /> Analyze & Generate Roadmap
            </>
          )}
        </button>
      </form>

      {/* ── Loading State ────────────────────────────────────────────────────── */}
      {loading && (
        <div className="loading-state mt-5">
          <div className="spinner" />
          <p>Parsing resume · Running NLP · Consulting AI…</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>This usually takes 10 – 20 seconds</p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {result && !loading && (
        <div className="mt-6">

          {/* Detected Skills */}
          {result.detectedSkills?.length > 0 && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              marginBottom: 24,
            }}>
              <p className="section-label">Detected from Your Resume</p>
              <div className="skills-strip">
                {result.detectedSkills.map((s) => (
                  <span className="skill-badge" key={s}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap Output */}
          <div className="roadmap-output">
            <div className="roadmap-output-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapIcon size={20} color="var(--accent-2)" /> Your Personalized Roadmap
              </h3>
              <span className="tag">AI Generated</span>
            </div>
            <div className="roadmap-content">
              <ReactMarkdown>{result.roadmap}</ReactMarkdown>
            </div>
          </div>

          {/* Re-analyze button */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              className="btn btn-ghost"
              onClick={() => { setResult(null); setFile(null); setJd(''); }}
            >
              <RefreshCcw size={16} style={{ marginRight: '8px' }} /> Analyze Another Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
