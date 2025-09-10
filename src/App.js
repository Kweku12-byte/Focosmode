import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Our Pages and Components ---
import Focosmode from './Pages/focosmode';
import Dashboard from './Pages/Dashboard/Dashboard'; // 1. Import the Dashboard
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'; // 2. Import the Guard

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* --- Public Route --- */}
            <Route path="/" element={<Focosmode />} />

            {/* --- Protected Route --- */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

