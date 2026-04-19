import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, ChevronRight, Loader2, Award, CheckCircle2, XCircle, Brain, Target, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MCQPage = () => {
  const [status, setStatus] = useState('setup'); // setup, active, loading, finished
  const [topic, setTopic] = useState('');
  const [currentLevel, setCurrentLevel] = useState('medium');
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [review, setReview] = useState('');

  const MAX_QUESTIONS = 10;

  const fetchNextQuestion = async (newLevel, updatedHistory) => {
    setStatus('loading');
    try {
      const res = await axios.post('http://localhost:5000/api/mcq/next', {
        topic,
        currentLevel: newLevel || currentLevel,
        history: updatedHistory || history
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      
      setCurrentQuestion(res.data);
      setSelectedOption(null);
      setIsAnswered(false);
      setStatus('active');
    } catch (err) {
      console.error(err);
      setStatus('setup');
    }
  };

  const handleStart = () => {
    if (!topic.trim()) return;
    fetchNextQuestion('medium', []);
  };

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption || isAnswered) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);

    const newHistoryItem = {
      ...currentQuestion,
      userAnswer: selectedOption,
      isCorrect
    };
    const updatedHistory = [...history, newHistoryItem];
    setHistory(updatedHistory);

    // Adaptation Logic
    let nextLevel = currentLevel;
    if (isCorrect) {
      if (currentLevel === 'easy') nextLevel = 'medium';
      else if (currentLevel === 'medium') nextLevel = 'hard';
    } else {
      if (currentLevel === 'hard') nextLevel = 'medium';
      else if (currentLevel === 'medium') nextLevel = 'easy';
    }
    setCurrentLevel(nextLevel);

    if (updatedHistory.length >= MAX_QUESTIONS) {
       setTimeout(() => finalizeTest(updatedHistory), 1500);
    } else {
       // Wait a bit so user sees if they were right/wrong
       setTimeout(() => fetchNextQuestion(nextLevel, updatedHistory), 2000);
    }
  };

  const finalizeTest = async (finalHistory) => {
    setStatus('loading');
    try {
      const res = await axios.post('http://localhost:5000/api/mcq/review', {
        topic,
        history: finalHistory
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      setReview(res.data.review);
      setStatus('finished');
    } catch (err) {
      console.error(err);
    }
  };

  if (status === 'setup') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <div className="auth-icon" style={{ margin: '0 auto 24px' }}><Brain size={24} /></div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>Adaptive MCQ Test</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>Difficulty adjusts based on your performance.</p>
          
          <input 
            className="field-input"
            placeholder="ENTER TEST TOPIC (E.G. JAVA, SQL, SYSTEM DESIGN)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            style={{ textAlign: 'center', fontWeight: 600 }}
          />
          
          <button className="btn btn-primary btn-full mt-6 btn-lg" onClick={handleStart} disabled={!topic.trim()}>
            BEGIN ASSESSMENT
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return <div className="loading-state" style={{ flex: 1 }}><Loader2 className="spinner" size={48} /><p style={{ fontWeight: 800 }}>ADAPTING DIFFICULTY...</p></div>;
  }

  if (status === 'active') {
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, height: '100%', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Progress Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span className="tag" style={{ background: '#fff', color: '#000' }}>LEVEL: {currentLevel.toUpperCase()}</span>
              <span className="tag">QUESTION {history.length + 1} / {MAX_QUESTIONS}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {history.map((h, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: h.isCorrect ? '#fff' : '#333' }} />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--surface-border)', borderRadius: 4 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 40 }}>{currentQuestion.question}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = isAnswered && opt === currentQuestion.correctAnswer;
                const isWrong = isAnswered && isSelected && opt !== currentQuestion.correctAnswer;
                
                let borderColor = 'var(--surface-border)';
                let bg = 'rgba(255,255,255,0.03)';
                if (isSelected && !isAnswered) borderColor = '#fff';
                if (isCorrect) { borderColor = '#fff'; bg = 'rgba(255,255,255,0.1)'; }
                if (isWrong) borderColor = '#333';

                return (
                  <div 
                    key={i} 
                    onClick={() => handleOptionSelect(opt)}
                    style={{ 
                      padding: '20px 24px', 
                      borderRadius: 4, 
                      border: `1px solid ${borderColor}`,
                      background: bg,
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'all 0.2s ease',
                      fontWeight: isSelected || isCorrect ? 700 : 400
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                       {String.fromCharCode(65 + i)}
                    </div>
                    <span>{opt}</span>
                    {isCorrect && <CheckCircle2 size={18} style={{ marginLeft: 'auto' }} />}
                    {isWrong && <XCircle size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                 {isAnswered ? currentQuestion.explanation : "Select an option and click submit."}
               </p>
               <button 
                 className="btn btn-primary btn-lg" 
                 onClick={handleSubmit} 
                 disabled={!selectedOption || isAnswered}
               >
                 SUBMIT ANSWER
               </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ borderRadius: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Target size={18} />
              <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>ACCURACY</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>
              {Math.round((history.filter(h => h.isCorrect).length / (history.length || 1)) * 100)}%
            </div>
          </div>
          
          <div className="card" style={{ flex: 1, borderRadius: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <BarChart3 size={18} />
              <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>SESSION LOG</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {history.slice(-5).reverse().map((h, i) => (
                 <div key={i} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 8, padding: '8px', borderBottom: '1px solid var(--surface-border)' }}>
                    {h.isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} style={{ opacity: 0.5 }}/>}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.question}</span>
                 </div>
               ))}
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
          <Award size={48} style={{ margin: '0 auto 24px' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>SESSION REPORT</h1>
          <div className="roadmap-output" style={{ textAlign: 'left', border: 'none', background: 'transparent' }}>
             <ReactMarkdown>{review}</ReactMarkdown>
          </div>
          <button className="btn btn-primary btn-lg mt-8" onClick={() => window.location.reload()}>RESTART TEST</button>
        </div>
      </div>
    );
  }

  return null;
};

export default MCQPage;
