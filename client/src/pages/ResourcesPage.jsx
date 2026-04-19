import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Search, ExternalLink, Loader2, Sparkles, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ResourcesPage = () => {
  const [skillInput, setSkillInput] = useState('');
  const [resources, setResources] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    if (!skillInput.trim()) return;
    setLoading(true);
    try {
      const skillsArray = skillInput.split(',').map(s => s.trim());
      const res = await axios.post('http://localhost:5000/api/resources/fetch', 
        { skills: skillsArray },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setResources(res.data.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card" style={{ maxWidth: 800, margin: '20px auto 0', width: '100%', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="auth-icon" style={{ margin: 0 }}><BookOpen size={24} /></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Skill Resource Library</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Curated learning paths for technical mastery.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              className="field-input"
              style={{ paddingLeft: 44, borderRadius: 4 }}
              placeholder="ENTER SKILLS (E.G. REACT, DOCKER, SYSTEM DESIGN)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
          </div>
          <button className="btn btn-primary" onClick={fetchResources} disabled={loading || !skillInput.trim()}>
            {loading ? <Loader2 className="spinner" size={18} /> : 'GENERATE PATH'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, marginTop: 24, paddingBottom: 20 }}>
        {resources ? (
           <div className="card" style={{ height: '100%', animation: 'slideIn 0.4s ease' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: '1px solid var(--surface-border)', paddingBottom: 16 }}>
               <Sparkles size={18} />
               <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Curated Learning Resources</span>
             </div>
             <div className="roadmap-output" style={{ border: 'none', background: 'transparent' }}>
                <ReactMarkdown>{resources}</ReactMarkdown>
             </div>
           </div>
        ) : !loading && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', border: '1px dashed var(--surface-border)', borderRadius: 4 }}>
            <LayoutGrid size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>ENTER SKILLS ABOVE TO BUILD YOUR RESOURCE HUB</p>
          </div>
        )}

        {loading && (
          <div className="loading-state" style={{ height: '100%' }}>
            <Loader2 className="spinner" size={48} />
            <p style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>CURATING GLOBAL RESOURCES...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
