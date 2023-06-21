import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './Login';
import RegisterForm from './Register';
import UserPanel from './UserPanel';
import Canvas from './Canvas';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/user-panel" element={<UserPanel />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;