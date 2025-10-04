import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Our Pages and Components ---
import Focosmode from './Pages/focosmode'; 
// UPDATE: Re-importing the ProtectedRoute component
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
// UPDATE: Importing our new Dashboard component
import FocosmodeDashboard from './Pages/Dashboard/FocosmodeDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* --- Public Route --- */}
            <Route path="/" element={<Focosmode />} />

            {/* --- NEW: Protected Dashboard Route --- */}
            {/* This route is wrapped by our ProtectedRoute component. */}
            {/* Only logged-in users will be able to access it. */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <FocosmodeDashboard />
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
