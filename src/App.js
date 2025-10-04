import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Our Pages and Components ---
// FIX: Changed path to all lowercase based on your feedback.
// Please double-check that your folder structure is: src/Pages/focosmode/focosmode.js
import Focosmode from './Pages/focosmode'; 

// Removed the unused import for ProtectedRoute to clear the warning.
// import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* --- Public Route --- */}
            {/* This is the only route needed for now. It displays our homepage. */}
            <Route path="/" element={<Focosmode />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

