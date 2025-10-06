import React, { useState, useEffect } from 'react';
import './FocosmodeDashboard.css';
// FIX: Corrected import paths to be relative from the 'Pages/Dashboard' directory
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../Services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// FIX: Corrected import path for the Inventory component
import Inventory from './Inventory';
// UPDATE: Import the new Sales component
import Sales from './Sales';

// --- Icon Components (for the sidebar) ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;


const FocosmodeDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('dashboard'); // This will control which feature we see
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'businesses', currentUser.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setBusinessData(docSnap.data());
            } else {
                setError("Could not find your business profile. Please contact support.");
            }
            setLoading(false);
        }, (err) => {
            console.error("Firestore snapshot error:", err);
            setError("Failed to load business data.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <div>
                        <h1>Welcome, {businessData?.businessName || '...'}!</h1>
                        <p>This is your main dashboard. Key metrics will appear here.</p>
                    </div>
                );
            case 'inventory':
                return <Inventory />;
            case 'sales':
                // UPDATE: The Sales component is now rendered here
                return <Sales />;
            default:
                return <div><h1>Welcome!</h1></div>;
        }
    };

    if (loading) {
        return <div className="dashboard-loader">Loading Your Dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-error">Error: {error}</div>;
    }

    const NavButton = ({ view, label, icon: Icon }) => (
        <button 
            className={`nav-button ${activeView === view ? 'active' : ''}`}
            onClick={() => {
                setActiveView(view);
                setIsSidebarOpen(false);
            }}
        >
            <Icon />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="dashboard-layout">
            <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                     <a href="/" className="sidebar-logo">
                        <img src="/logo192.png" alt="Focosmode Logo"/>
                        <span>Focosmode</span>
                    </a>
                </div>
                <nav className="sidebar-nav">
                    <NavButton view="dashboard" label="Dashboard" icon={DashboardIcon} />
                    <NavButton view="inventory" label="Inventory" icon={InventoryIcon} />
                    <NavButton view="sales" label="Sales" icon={SalesIcon} />
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-button logout" onClick={handleLogout}>
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <main className="dashboard-main-content">
                 <header className="dashboard-header">
                    <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <MenuIcon />
                    </button>
                    <h3>Hello, {businessData?.ownerName || 'Owner'}!</h3>
                </header>
                <div className="dashboard-view-container">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
};

export default FocosmodeDashboard;

