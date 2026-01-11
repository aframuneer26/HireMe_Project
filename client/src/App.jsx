import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Roadmap from './pages/RoadmapPage';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home'; // Add a Home page

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
