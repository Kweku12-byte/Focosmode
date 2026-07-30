import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Our Pages and Components ---
import Focosmode from './Pages/focosmode'; 
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import FocosmodeDashboard from './Pages/Dashboard/FocosmodeDashboard';

// --- NEW: Import the Public Storefront Components ---
import ShopPublic from './Pages/Storefront/ShopPublic';
import CheckoutPublic from './Pages/Storefront/CheckoutPublic';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* --- Public Landing Page --- */}
            <Route path="/" element={<Focosmode />} />

            {/* --- Public E-commerce Storefront Routes --- */}
            {/* The :businessId parameter allows Focosmode to dynamically load the right store data */}
            <Route path="/store/:businessId" element={<ShopPublic />} />
            <Route path="/checkout/:businessId" element={<CheckoutPublic />} />

            {/* --- Protected Dashboard Route --- */}
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
