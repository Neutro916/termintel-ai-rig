import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CLIPage from './pages/CLIPage';
import TerminalPage from './pages/TerminalPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/CLI" replace />} />
          <Route path="/Dashboard" element={<DashboardPage />} />
          <Route path="/CLI" element={<CLIPage />} />
          <Route path="/Terminal" element={<TerminalPage />} />
          <Route path="*" element={<Navigate to="/CLI" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
