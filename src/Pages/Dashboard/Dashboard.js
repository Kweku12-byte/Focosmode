import React from 'react';
import { useAuth } from '../../context/AuthContext'; // We'll need this soon
import './dashboard.css';

const Dashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <h1>Welcome to Your Dashboard</h1>
                <p>You are logged in as: {currentUser.email}</p>
                {/* All our dashboard features will be built here */}
            </div>
        </div>
    );
};

export default Dashboard;
