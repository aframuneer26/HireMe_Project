import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Mic, MicOff, Video, VideoOff, Play, CheckCircle, Award, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const InterviewPage = () => {
  // ── States ────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState('setup'); // setup, active, loading, finished
  const [topic, setTopic] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewId, setInterviewId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isListening, setIsListening] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Setup Speech Recognition ─────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer(transcript);
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };
    }
  }, []);

  // ── Utilities ─────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setIsVideoOn(false);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setUserAnswer('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const startInterview = async () => {
    setStatus('loading');
    try {
      const res = await axios.post('http://localhost:5000/api/interview/start', 
        { topic, resumeText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setStatus('active');
      startCamera();
      speak(res.data.question);
    } catch (err) {
      console.error(err);
      setStatus('setup');
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    if (isListening) toggleListening();
    setStatus('loading');
    
    try {
      const res = await axios.post('http://localhost:5000/api/interview/answer', 
        { interviewId, answer: userAnswer },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      if (res.data.isFinished) {
        setFeedback(res.data);
        setStatus('finished');
        window.speechSynthesis.cancel();
      } else {
        setCurrentQuestion(res.data.question);
        setUserAnswer('');
        setStatus('active');
        speak(res.data.question);
      }
    } catch (err) {
      console.error(err);
      setStatus('active');
    }
  };

  // ── Render Parts ──────────────────────────────────────────────────────────
  
  if (status === 'setup') {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="auth-icon" style={{ background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf' }}>
            <Video size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>Mock Interview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Practice your skills with our AI interviewer.</p>
        </div>

        <div className="field-group">
          <div>
            <label className="field-label">Interview Topic / Job Role</label>
            <input 
              className="field-input" 
              placeholder="e.g. Senior Frontend Developer, Data Scientist..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Relevant Experience / Resume Intro</label>
            <textarea 
              className="field-textarea" 
              placeholder="Briefly describe your background or paste key points from your resume..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              style={{ minHeight: 120 }}
            />
          </div>
        </div>

        <button className="btn btn-primary btn-full mt-4" onClick={startInterview}>
          <Play size={18} style={{ marginRight: 8 }} /> Start Mock Interview
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} />
        <p>AI is thinking...</p>
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Main Interview Area */}
        <div style={{ spaceY: 24 }}>
          {/* Question Box */}
          <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: 12, borderRadius: 12, height: 'fit-content' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="section-label">Interviewer</p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 }}>{currentQuestion}</h2>
              </div>
            </div>
          </div>

          {/* User Answer Area */}
          <div className="card">
            <p className="section-label">Your Answer</p>
            <textarea 
              className="field-textarea"
              placeholder="Click 'Record' to speak your answer or type it here..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              style={{ minHeight: 200, fontSize: '1.1rem', background: 'transparent', border: 'none', padding: 0 }}
            />
            
            <div className="divider" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className={`btn ${isListening ? 'btn-danger' : 'btn-teal'}`}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  {isListening ? 'Stop Recording' : 'Start Voice Input'}
                </button>
              </div>

              <button className="btn btn-primary" onClick={submitAnswer} disabled={!userAnswer.trim()}>
                Submit Answer <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Video Preview */}
        <div style={{ spaceY: 20 }}>
          <div className="card" style={{ padding: 12, background: '#000', overflow: 'hidden', height: 260, position: 'relative' }}>
            {!isVideoOn && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Camera Off</div>}
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, opacity: isVideoOn ? 1 : 0 }}
            />
            
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <p className="section-label">Interview Progress</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
              This is a simulate mock interview. Speaks naturally as you would in a real interview.
            </p>
            <div style={{ marginTop: 20, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
              <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 10, width: '40%', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="card" style={{ maxWidth: 800, margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="auth-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', width: 64, height: 64 }}>
            <Award size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Interview Complete</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 100, marginTop: 12 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-2)' }}>{feedback.score}%</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Overall Score</span>
          </div>
        </div>

        <div className="roadmap-output" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="roadmap-output-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={18} color="var(--success)" /> Performance Feedback
            </h3>
          </div>
          <div className="roadmap-content">
            <ReactMarkdown>{feedback.feedback}</ReactMarkdown>
          </div>
        </div>

        <button 
          className="btn btn-ghost btn-full mt-6" 
          onClick={() => { setStatus('setup'); setFeedback(null); window.location.reload(); }}
        >
          <RefreshCcw size={18} style={{ marginRight: 8 }} /> Start Another Session
        </button>
      </div>
    );
  }

  return null;
};

// Simple Refresh Icon if missing
const RefreshCcw = ({ size, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);

export default InterviewPage;
