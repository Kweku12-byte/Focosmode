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
import EcommerceSettings from './EcommerceSettings';

// --- Icon Components (for the sidebar) ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ShoppingBagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

const FocosmodeDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [activeCashier, setActiveCashier] = useState(() => {
        const saved = localStorage.getItem('activeCashier');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [isLocked, setIsLocked] = useState(() => {
        return localStorage.getItem('activeCashier') ? false : true;
    });

    const [isBackendUnlocked, setIsBackendUnlocked] = useState(false);
    const [showBackendPinModal, setShowBackendPinModal] = useState(false);
    const [pendingBackendView, setPendingBackendView] = useState(null);
    const [backendPinEntry, setBackendPinEntry] = useState('');
    const [backendPinError, setBackendPinError] = useState('');

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
            localStorage.removeItem('activeCashier');
            setIsBackendUnlocked(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const isOwner = activeCashier?.role === 'owner';

    const handleNavClick = (view) => {
        const secureViews = ['staff', 'settings', 'ecommerce-settings', 'abandoned-carts'];
        
        if (secureViews.includes(view) && isOwner) {
            if (!isBackendUnlocked) {
                setPendingBackendView(view);
                setShowBackendPinModal(true);
                return;
            }
        }
        setActiveView(view);
        setIsSidebarOpen(false); 
    };

    const handleBackendPinSubmit = (e) => {
        e.preventDefault();
        const correctPin = businessData?.ownerPin || '0000';
        if (backendPinEntry === correctPin) {
            setIsBackendUnlocked(true);
            setActiveView(pendingBackendView);
            setShowBackendPinModal(false);
            setBackendPinEntry('');
            setBackendPinError('');
            setIsSidebarOpen(false);
        } else {
            setBackendPinError('Incorrect Owner PIN');
            setBackendPinEntry('');
        }
    };

    // --- REFINED RENDER VIEWS WITH PROPS ---
    const renderActiveView = () => {
        switch (activeView) {
            // Core
            case 'dashboard': return isOwner ? <MainDashboard /> : <Sales activeCashier={activeCashier} />;
            case 'inventory-all': return <Inventory viewMode="all" />; // Master Inventory
            
            // POS
            case 'sales-pos': return <Sales activeCashier={activeCashier} />;
            case 'sales-history': return <SalesHistory activeCashier={activeCashier} viewMode="pos" />;
            case 'customers-all': return <Customers />;
            case 'expenses': return <Expenses activeCashier={activeCashier} />;
            
            // E-commerce
            case 'inventory-online': return <Inventory viewMode="online" />; // Online Only Products
            case 'online-orders': return <div style={{padding: '2rem'}}><h2>Online Orders</h2><p>Coming next...</p></div>; // We will build this next to handle shipping/fulfillment
            case 'abandoned-carts': return isOwner ? <div style={{padding: '2rem'}}><h2>Abandoned Carts</h2><p>Coming next...</p></div> : <Sales activeCashier={activeCashier} />;
            case 'ecommerce-settings': return isOwner ? <EcommerceSettings /> : <Sales activeCashier={activeCashier} />;
            
            // Business
            case 'settings': return isOwner ? <Settings /> : <Sales activeCashier={activeCashier} />;
            case 'staff': return isOwner ? <Staff /> : <Sales activeCashier={activeCashier} />;
            default: return <div><h1>Welcome!</h1></div>;
        }
    };

    if (loading) return <div className="dashboard-loader">Loading Your Dashboard...</div>;
    if (error) return <div className="dashboard-error">Error: {error}</div>;
    
    const NavItem = ({ view, label, icon: Icon }) => (
        <button className={`nav-button ${activeView === view ? 'active' : ''}`} onClick={() => handleNavClick(view)}>
            {Icon && <Icon />} <span>{label}</span>
        </button>
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

            {showBackendPinModal && (
                <div className="modal-overlay" style={{zIndex: 9999}}>
                    <div className="modal-content" style={{width: '350px', textAlign: 'center'}}>
                        <button className="close-modal-btn" onClick={() => {setShowBackendPinModal(false); setBackendPinEntry(''); setBackendPinError('');}}><XIcon /></button>
                        <div style={{color: '#f59e0b', marginBottom: '1rem'}}><LockIcon style={{width: '48px', height: '48px'}}/></div>
                        <h3 style={{marginTop: 0}}>Security Check</h3>
                        <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem'}}>Enter the Owner POS PIN to access Secure Settings.</p>
                        <form onSubmit={handleBackendPinSubmit}>
                            <input 
                                type="password" maxLength="4" 
                                placeholder="PIN" 
                                value={backendPinEntry} 
                                onChange={e => setBackendPinEntry(e.target.value.replace(/\D/g, ''))} 
                                required autoFocus
                                style={{width: '100%', padding: '1rem', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem'}}
                            />
                            {backendPinError && <p style={{color: '#ef4444', fontSize: '0.85rem', margin: '-0.5rem 0 1rem 0'}}>{backendPinError}</p>}
                            <button type="submit" style={{width: '100%', padding: '0.875rem', background: '#1f2937', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>
                                Verify & Proceed
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="dashboard-layout">
                <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
                
                <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <button className="sidebar-logo" onClick={() => { handleNavClick(isOwner ? 'dashboard' : 'sales-pos'); }}>
                            <img src="/logo192.png" alt="Focosmode Logo"/>
                            <span>Focosmode</span>
                        </button>
                    </div>
                    
                    <nav className="sidebar-nav-scrollable">
                        
                        <div className="sidebar-section-title">CORE</div>
                        {isOwner && <NavItem view="dashboard" label="Overview" icon={DashboardIcon} />}
                        <NavItem view="inventory-all" label="Master Inventory" icon={InventoryIcon} />

                        <hr className="sidebar-divider" />

                        <div className="sidebar-section-title">POINT OF SALE</div>
                        <NavItem view="sales-pos" label="Register (POS)" icon={SalesIcon} />
                        <NavItem view="sales-history" label="POS History" icon={RefreshIcon} />
                        <NavItem view="customers-all" label="Customers" icon={CustomersIcon} />
                        <NavItem view="expenses" label="Expenses" icon={ExpenseIcon} />

                        <hr className="sidebar-divider" />

                        <div className="sidebar-section-title">E-COMMERCE</div>
                        <NavItem view="inventory-online" label="Online Products" icon={ShoppingBagIcon} />
                        <NavItem view="online-orders" label="Online Orders" icon={ShoppingBagIcon} />
                        {isOwner && <NavItem view="abandoned-carts" label="Abandoned Carts" icon={RefreshIcon} />}
                        {isOwner && <NavItem view="ecommerce-settings" label="Store Settings" icon={StoreIcon} />}
                        
                        {/* --- NEW: Direct Link to Public Store --- */}
                        <a 
                            href={`/store/${currentUser?.uid}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="nav-button" 
                            style={{ textDecoration: 'none', color: '#3b82f6', marginTop: '0.5rem' }}
                        >
                            <ExternalLinkIcon /> <span>View Live Store</span>
                        </a>

                        {isOwner && (
                            <>
                                <hr className="sidebar-divider" />
                                <div className="sidebar-section-title">BUSINESS</div>
                                <NavItem view="staff" label="Staff Accounts" icon={SettingsIcon} />
                                <NavItem view="settings" label="App Settings" icon={SettingsIcon} />
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
                        
                        <button 
                            className="header-lock-btn"
                            onClick={() => {
                                setIsLocked(true);
                                setActiveCashier(null);
                                setIsBackendUnlocked(false);
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
