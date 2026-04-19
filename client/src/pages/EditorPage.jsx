import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Code2, Terminal, Loader2, ChevronDown, Save, Share2, Layers } from 'lucide-react';

const EditorPage = () => {
  const [language, setLanguage] = useState('javascript');
  const [value, setValue] = useState('// Write your code here...\nconsole.log("Hello, HireMe!");');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  const LANGUAGES = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' }
  ];

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setLoading(true);
    setOutput('Compiling and executing...');
    try {
      const res = await axios.post('http://localhost:5000/api/code/run', {
        language,
        sourceCode: value
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      
      setOutput(res.data.output || res.data.stdout || 'Program executed with no output.');
    } catch (err) {
      setOutput(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Header / Toolbar */}
      <div className="card" style={{ padding: '10px 20px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="auth-icon" style={{ width: 32, height: 32, margin: 0, fontSize: '0.8rem' }}><Code2 size={16} /></div>
            <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>CODE LAB</span>
          </div>
          
          <div style={{ height: 20, width: 1, background: 'var(--surface-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value)}
               style={{ background: 'transparent', color: '#fff', border: '1px solid var(--surface-border)', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: 2, outline: 'none' }}
             >
               {LANGUAGES.map(lang => <option key={lang.value} value={lang.value} style={{ background: '#000' }}>{lang.label}</option>)}
             </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost btn-sm"> <Save size={14} /> SAVE</button>
            <button className="btn btn-primary btn-sm" onClick={runCode} disabled={loading}>
              {loading ? <Loader2 className="spinner" size={14} /> : <Play size={14} />}
              {loading ? 'EXECUTING...' : 'RUN CODE'}
            </button>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12, minHeight: 0 }}>
        
        {/* Monaco Editor Container */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--surface-border)', borderRadius: 4 }}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={value}
            onChange={(val) => setValue(val)}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              backgroundColor: '#0a0a0a'
            }}
          />
        </div>

        {/* Console / Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ flex: 1, background: '#000', padding: 0, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
             <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                <Terminal size={14} />
                <span style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '1px' }}>TERMINAL OUTPUT</span>
             </div>
             <div style={{ flex: 1, padding: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: '#a1a1aa', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                {output || '> Waiting for execution...'}
             </div>
          </div>
          
          <div className="card" style={{ height: 180, borderRadius: 4 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Layers size={14} />
                <span style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '1px' }}>PRACTICE STATS</span>
             </div>
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Language Readiness</span>
                    <span style={{ color: '#fff' }}>68%</span>
                </div>
                <div style={{ height: 4, background: '#111', borderRadius: 2 }}>
                    <div style={{ width: '68%', height: '100%', background: '#fff' }} />
                </div>
                <p style={{ marginTop: 8, opacity: 0.8 }}>Practice daily to improve your algorithmic complexity mastery.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
