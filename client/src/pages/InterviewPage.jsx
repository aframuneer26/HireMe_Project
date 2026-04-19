import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Mic, MicOff, Video, VideoOff, Play, CheckCircle, Award, MessageSquare, ArrowRight, Loader2, Paperclip, FileText, X, Volume2, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const InterviewPage = () => {
  // ── States ────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState('setup'); 
  const [mode, setMode] = useState(null); 
  const [topic, setTopic] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [interviewId, setInterviewId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  const [warnings, setWarnings] = useState(0);
  const [isTabFocus, setIsTabFocus] = useState(true);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // ── Set up Proctoring ────────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'active') {
        setIsTabFocus(false);
        setWarnings(prev => prev + 1);
      } else {
        setIsTabFocus(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  // ── Setup Speech Recognition ─────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => (prev + ' ' + finalTranscript).trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognitionRef.current.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'network') setSpeechError('Connection lost. Try again.');
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setSpeechError('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {}
    }
  };

  const startInterview = async () => {
    if ((mode === 'topic' && !topic.trim()) || (mode === 'resume' && !resumeFile)) return;
    setStatus('loading');
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      formData.append('topic', topic);
      const res = await axios.post('http://localhost:5000/api/interview/start', formData, { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      setInterviewId(res.data.interviewId);
      setCurrentQuestion(res.data.question);
      setQuestionCount(1);
      setStatus('active');
      startCamera();
      setTimeout(() => speak(res.data.question), 500);
    } catch (err) {
      setStatus('setup');
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setStatus('loading');
    try {
      const res = await axios.post('http://localhost:5000/api/interview/answer', { interviewId, answer: userAnswer }, { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.isFinished) {
        setFeedback(res.data);
        setStatus('finished');
      } else {
        setCurrentQuestion(res.data.question);
        setUserAnswer('');
        setInterimTranscript('');
        setQuestionCount(prev => prev + 1);
        setStatus('active');
        setTimeout(() => speak(res.data.question), 500);
      }
    } catch (err) {
      setStatus('active');
    }
  };

  if (status === 'setup') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="auth-icon"><Video size={24} /></div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Assessment Entry</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Environment: Proctored & Monitored</p>
          </div>

          {!mode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--surface-border)', padding: '32px 16px' }} onClick={() => setMode('topic')}>
                <FileText size={24} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Topic Session</h3>
              </div>
              <div className="feature-card" style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--surface-border)', padding: '32px 16px' }} onClick={() => setMode('resume')}>
                <Paperclip size={24} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Resume Session</h3>
              </div>
            </div>
          ) : (
            <div style={{ animation: 'slideIn 0.3s ease' }}>
              <button className="btn btn-ghost btn-sm mb-4" onClick={() => setMode(null)}>← BACK</button>
              {mode === 'topic' ? (
                <input className="field-input" placeholder="ROLE / SKILL NAME" value={topic} onChange={e => setTopic(e.target.value)} autoFocus />
              ) : (
                <div className="file-upload-zone" style={{ padding: '32px' }} onClick={() => document.getElementById('rp').click()}>
                  <input id="rp" type="file" accept=".pdf" hidden onChange={e => setResumeFile(e.target.files[0])} />
                  <Paperclip size={24} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{resumeFile ? resumeFile.name : 'ATTACH RESUME PDF'}</p>
                </div>
              )}
              <button className="btn btn-primary btn-full mt-6 btn-lg" onClick={startInterview}>INITIATE SESSION</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'loading') return <div className="loading-state" style={{ flex: 1 }}><Loader2 className="spinner" size={48} /><p style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700 }}>Processing Metrics...</p></div>;

  if (status === 'active') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Compact Proctor Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 20px', border: '1px solid var(--surface-border)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1.5px' }}>
                <ShieldAlert size={14} /> LIVE PROCTORING SYSTEM ACTIVE
            </div>
            {warnings > 0 && <span style={{ color: '#ff4d4d', fontSize: '0.7rem', fontWeight: 900 }}>ANOMALIES DETECTED: {warnings}</span>}
            {!isTabFocus && <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                <ShieldAlert size={64} style={{ marginBottom: 24 }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>SECURITY LOCK</h1>
                <p style={{ color: '#a1a1aa' }}>Focus lost. Incident logged.</p>
                <button className="btn btn-primary mt-8 btn-lg" onClick={() => setIsTabFocus(true)}>RESUME SESSION</button>
            </div>}
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0 }}>
            {/* Question Card - Constrained */}
            <div key={questionCount} className="card" style={{ borderLeft: '2px solid #fff', borderRadius: 4, flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <MessageSquare size={20} />
                    <div style={{ flex: 1 }}>
                        <p className="section-label" style={{ fontSize: '0.65rem' }}>Question {questionCount} of 5</p>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4 }}>{currentQuestion}</h2>
                        <button onClick={() => speak(currentQuestion)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', marginTop: 12, fontWeight: 800 }}>
                            <Volume2 size={12} /> PLAY AGAIN
                        </button>
                    </div>
                </div>
            </div>

            {/* Transcription Box - Filling remaining space */}
            <div className={`card ${isListening ? 'listening-glow' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 4, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p className="section-label">Session Transcription</p>
                    {isListening && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 900 }}><span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'pulse 1s infinite' }} /> REC</span>}
                </div>
                <div style={{ flex: 1, fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5, color: userAnswer || interimTranscript ? '#fff' : '#444', overflowY: 'auto', paddingRight: 10 }}>
                    {userAnswer}
                    <span style={{ color: '#52525b' }}> {interimTranscript}</span>
                    {!userAnswer && !interimTranscript && !isListening && "Awaiting voice..."}
                </div>
                <div className="divider" style={{ margin: '16px 0', opacity: 0.1 }} />
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className={`btn btn-lg ${isListening ? 'btn-danger' : 'btn-ghost'}`} onClick={toggleListening} style={{ flex: 1 }}>{isListening ? 'STOP' : 'START SPEAKING'}</button>
                    <button className="btn btn-primary btn-lg" onClick={submitAnswer} disabled={!userAnswer.trim() || isListening} style={{ flex: 1 }}>SUBMIT</button>
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 4, background: '#000', height: 240, flexShrink: 0, borderRadius: 4 }}>
               <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6rem', color: '#fff', zis: 10, fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)' }}><div style={{ width: 4, height: 4, background: '#ff0000', borderRadius: '50%' }} /> CAM FEED</div>
               <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }} />
            </div>
            <div className="card" style={{ flex: 1, borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><ShieldCheck size={18} /><span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>PROCTOR STATUS</span></div>
                <ul style={{ fontSize: '0.75rem', color: '#71717a', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <li style={{ display: 'flex', gap: 10 }}><Info size={14} /> Biometric check pass.</li>
                    <li style={{ display: 'flex', gap: 10 }}><Info size={14} /> Eye gaze monitoring.</li>
                    <li style={{ display: 'flex', gap: 10 }}><Info size={14} /> No tab switches.</li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: 700, textAlign: 'center' }}>
            <Award size={48} style={{ margin: '0 auto 16px' }} />
            <h1 style={{ fontWeight: 900, fontSize: '1.5rem' }}>EVALUATION COMPLETE</h1>
            <div style={{ margin: '24px 0', fontSize: '2.5rem', fontWeight: 900 }}>{feedback.score}%</div>
            <div className="roadmap-output" style={{ textAlign: 'left', maxHeight: 300, overflowY: 'auto' }}><ReactMarkdown>{feedback.feedback}</ReactMarkdown></div>
            <button className="btn btn-primary btn-lg mt-8" onClick={() => window.location.reload()}>FINISH SESSION</button>
        </div>
      </div>
    );
  }
  return null;
};

export default InterviewPage;
