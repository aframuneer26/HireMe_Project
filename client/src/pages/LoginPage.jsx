import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setMessage(res.data.message);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/roadmap';
    } catch (err) {
      setMessage('Login failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" className="form-control my-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-control my-2" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default LoginPage;
