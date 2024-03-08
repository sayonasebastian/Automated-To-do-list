import React from 'react';
import './App.css';
import AuthUser from './Auth';
import Homepage from './homepage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<AuthUser />} />
      <Route path="/login" element={<AuthUser />} />
      <Route path="/home" element={<Homepage/>} />
    </Routes>
  </Router>
  );
};

export default App;
// <LoginPage />
