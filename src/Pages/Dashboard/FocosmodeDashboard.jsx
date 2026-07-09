// src/Pages/Dashboard/FocosmodeDashboard.jsx
import React, { useState, useEffect } from 'react';
import './FocosmodeDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../Services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

import Inventory from './Inventory';
import Sales from './Sales';
import Customers from './Customers';
import SalesHistory from './SalesHistory';
import MainDashboard from './MainDashboard';
import Expenses from './Expenses';
import Settings from './Settings';
import Staff from './Staff';
import RegisterLock from './RegisterLock';

// --- Icon Components (for the sidebar) ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

const FocosmodeDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    
    const [activeCashier, setActiveCashier] = useState(() => {
        const saved = localStorage.getItem('activeCashier');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [isLocked, setIsLocked] = useState(() => {
        return localStorage.getItem('activeCashier') ? false : true;
    });

    const toggleMenu = (menuKey) => {
        setOpenMenus(prevMenus => ({ ...prevMenus, [menuKey]: !prevMenus[menuKey] }));
    };

    useEffect(() => {
        if (!currentUser) return setLoading(false);
        const docRef = doc(db, 'businesses', currentUser.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) setBusinessData(docSnap.data());
            else setError("Could not find your business profile.");
            setLoading(false);
        }, (err) => {
            setError("Failed to load business data.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Clear memory on full logout
            localStorage.removeItem('activeCashier');
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isOwner = activeCashier?.role === 'owner';

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard': return isOwner ? <MainDashboard /> : <Sales activeCashier={activeCashier} />;
            case 'inventory-all': return <Inventory />;
            case 'sales-pos': return <Sales activeCashier={activeCashier} />;
            case 'customers-all': return <Customers />;
            case 'sales-history': return <SalesHistory activeCashier={activeCashier} />;
            case 'expenses': return isOwner ? <Expenses /> : <Sales activeCashier={activeCashier} />;
            case 'settings': return isOwner ? <Settings /> : <Sales activeCashier={activeCashier} />;
            case 'staff': return isOwner ? <Staff /> : <Sales activeCashier={activeCashier} />;
            default: return <div><h1>Welcome!</h1></div>;
        }
    };

    if (loading) return <div className="dashboard-loader">Loading Your Dashboard...</div>;
    if (error) return <div className="dashboard-error">Error: {error}</div>;
    
    const NavItem = ({ view, label, icon: Icon }) => (
        <button className={`nav-button ${activeView === view ? 'active' : ''}`} onClick={() => { setActiveView(view); setIsSidebarOpen(false); }}>
            {Icon && <Icon />} <span>{label}</span>
        </button>
    );

    const AccordionItem = ({ title, menuKey, icon: Icon, children }) => (
        <div className="accordion-item">
            <button className={`accordion-header ${openMenus[menuKey] ? 'open' : ''}`} onClick={() => toggleMenu(menuKey)}>
                <div className="accordion-title"><Icon /><span>{title}</span></div>
                <ChevronDownIcon />
            </button>
            <div className={`accordion-content ${openMenus[menuKey] ? 'open' : ''}`}>{children}</div>
        </div>
    );

    return (
        <>
            {isLocked && (
                <RegisterLock 
                    businessData={businessData} 
                    onUnlock={(user) => {
                        setActiveCashier(user);
                        setIsLocked(false);
                        localStorage.setItem('activeCashier', JSON.stringify(user));
                        if (user.role !== 'owner') setActiveView('sales-pos');
                    }} 
                />
            )}

            <div className="dashboard-layout">
                <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
                
                <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <button className="sidebar-logo" onClick={() => { setActiveView(isOwner ? 'dashboard' : 'sales-pos'); setIsSidebarOpen(false); }}>
                            <img src="/logo192.png" alt="Focosmode Logo"/>
                            <span>Focosmode</span>
                        </button>
                    </div>
                    
                    <nav className="sidebar-nav-scrollable">
                        {isOwner && <NavItem view="dashboard" label="Dashboard" icon={DashboardIcon} />}
                        
                        <AccordionItem title="Sales" menuKey="sales" icon={SalesIcon}>
                            <NavItem view="sales-pos" label="New Sale (POS)" />
                            <NavItem view="sales-history" label="Sales History" />
                        </AccordionItem>

                        <AccordionItem title="Inventory" menuKey="inventory" icon={InventoryIcon}>
                            <NavItem view="inventory-all" label="All Products" />
                        </AccordionItem>

                        <AccordionItem title="Customers" menuKey="customers" icon={CustomersIcon}>
                            <NavItem view="customers-all" label="All Customers" />
                        </AccordionItem>

                        {isOwner && (
                            <>
                                <AccordionItem title="Expenses" menuKey="expenses" icon={ExpenseIcon}>
                                    <NavItem view="expenses" label="Track Expenses" />
                                </AccordionItem>

                                <AccordionItem title="Business" menuKey="business" icon={SettingsIcon}>
                                    <NavItem view="staff" label="Staff" />
                                    <NavItem view="settings" label="Settings" />
                                </AccordionItem>
                            </>
                        )}
                    </nav>
                    
                    <div className="sidebar-footer">
                        <div className="user-profile">
                            <div className="user-avatar">{activeCashier?.name?.charAt(0) || businessData?.ownerName?.charAt(0) || 'U'}</div>
                            <div className="user-info">
                                <span className="user-name">{activeCashier?.name || businessData?.ownerName || '...'}</span>
                                <span className="user-email">{activeCashier?.role === 'owner' ? 'Owner' : 'Cashier Mode'}</span>
                            </div>
                        </div>
                        
                        {/* MAIN FIREBASE LOGOUT RESTORED */}
                        <button className="nav-button logout" onClick={handleLogout} title="Sign Out of Focosmode">
                            <LogoutIcon />
                        </button>
                    </div>
                </div>

                <main className="dashboard-main-content">
                    <header className="dashboard-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <button className="mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                <MenuIcon />
                            </button>
                            <h3 style={{margin: 0}}>Hello, {activeCashier?.name || businessData?.ownerName || 'User'}!</h3>
                        </div>
                        
                        {/* --- NEW: Lock / Switch User Button in the Header --- */}
                        <button 
                            className="header-lock-btn"
                            onClick={() => {
                                setIsLocked(true);
                                setActiveCashier(null);
                                localStorage.removeItem('activeCashier');
                            }}
                            title="Lock Register or Switch User"
                        >
                            <LockIcon style={{width: '20px', height: '20px'}} />
                            <span className="screen-only">Lock POS</span>
                        </button>
                    </header>
                    <div className="dashboard-view-container">
                        {renderActiveView()}
                    </div>
                </main>
            </div>
        </>
    );
};

export default FocosmodeDashboard;

