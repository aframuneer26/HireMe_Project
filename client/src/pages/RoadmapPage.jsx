import React, { useState } from 'react';
import axios from 'axios';

const RoadmapPage = () => {
  const [interests, setInterests] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [goals, setGoals] = useState('');
  const [file, setFile] = useState(null);

  const [roadmap, setRoadmap] = useState('');
  const [roles, setRoles] = useState('');
  const [internships, setInternships] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const generateRoadmap = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRoadmap('');
    setRoles('');
    setInternships('');
    setMessage('');

    try {
      // Create FormData and send everything to roadmap endpoint
      const formData = new FormData();
      formData.append('interests', interests);
      formData.append('qualifications', qualifications);
      formData.append('goals', goals);
      
      // Add resume file if uploaded
      if (file) {
        formData.append('resume', file);
      }

      // Generate Roadmap (single request)
      const res = await axios.post(
        'http://localhost:5000/api/roadmap/generate',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data'
            // Removed Authorization header since we removed auth for testing
          } 
        }
      );

      setRoadmap(res.data.roadmap || 'No roadmap generated.');
    } catch (err) {
      setMessage('Error generating roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleSuggestions = async () => {
    setRoles('Loading...');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/roles/suggest',
        { interests, qualifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(res.data.roles || 'No roles found.');
    } catch (err) {
      setRoles('Failed to load role suggestions.');
    }
  };

  const fetchInternshipSuggestions = async () => {
    setInternships('Loading...');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/internships/recommend',
        { interests, goals },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInternships(res.data.internships || 'No recommendations found.');
    } catch (err) {
      setInternships('Failed to fetch internship recommendations.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Career Roadmap Generator</h2>
      <form onSubmit={generateRoadmap}>
        <input
          type="text"
          className="form-control my-2"
          placeholder="Your Interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-control my-2"
          placeholder="Your Qualifications"
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-control my-2"
          placeholder="Your Career Goals"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          required
        />
        <input
          type="file"
          className="form-control my-2"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button type="submit" className="btn btn-primary my-2" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </form>
      {message && <p className="text-danger mt-2">{message}</p>}

      {roadmap && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h5>📌 Career Roadmap:</h5>
          <pre>{roadmap}</pre>
        </div>
      )}

      {roadmap && (
        <div className="mt-3">
          <button className="btn btn-outline-success me-2" onClick={fetchRoleSuggestions}>
            Show Role Suggestions
          </button>
          <button className="btn btn-outline-info" onClick={fetchInternshipSuggestions}>
            Show Internship Recommendations
          </button>
        </div>
      )}

      {roles && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h5>💼 Role Suggestions:</h5>
          <pre>{roles}</pre>
        </div>
      )}

      {internships && (
        <div className="mt-4 p-3 bg-light border rounded">
          <h5>🎓 Internship Recommendations:</h5>
          <pre>{internships}</pre>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
