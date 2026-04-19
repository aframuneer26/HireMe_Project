import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Sparkles, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setMessage(res.data.message || 'Account created successfully!');
      setSuccess(true);
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Sparkles size={24} color="#2dd4bf" />
          </div>
          <h2>Create your account</h2>
          <p>Start your AI-powered career journey</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="field-group">
            <div>
              <label className="field-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-name"
                  type="text"
                  className="field-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            <div>
              <label className="field-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-email"
                  type="email"
                  className="field-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
            <div>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  type="password"
                  className="field-input"
                  style={{ paddingLeft: '44px' }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {message && (
            <div className={`alert mt-3 ${success ? 'alert-success' : 'alert-error'}`}>
              {success ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {message}
            </div>
          )}

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-full mt-4"
            disabled={loading}
          >
            {loading ? 'Creating account…' : (
              <>Create Account <ArrowRight size={18} style={{ marginLeft: '8px' }} /></>
            )}
          </button>
        </form>

        <div className="auth-footer mt-4">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
