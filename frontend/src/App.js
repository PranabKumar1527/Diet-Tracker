import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import GoalSelection from './pages/GoalSelection';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/goals" element={<GoalSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;