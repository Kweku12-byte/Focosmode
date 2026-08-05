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

// --- Icons ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CustomersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const FocosmodeDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI States
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({}); 
    
    // Feature Choice
    const [activeProfile, setActiveProfile] = useState('creator');
    const [dashboardCurrencyFilter, setDashboardCurrencyFilter] = useState('ALL');
    
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

    const isOwner = activeCashier?.role === 'owner';

    const toggleMenu = (menuKey) => {
        setOpenMenus(prevMenus => ({ ...prevMenus, [menuKey]: !prevMenus[menuKey] }));
    };

    const handleNavClick = (view) => {
        const secureViews = ['staff', 'settings', 'ecommerce-settings', 'abandoned-carts', 'wallet', 'payouts', 'payout-settings', 'integrations', 'affiliate-management'];
        
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

    const renderActiveView = () => {
        switch (activeView) {
            // Core
            case 'dashboard': return isOwner ? <MainDashboard currencyFilter={dashboardCurrencyFilter} /> : <Sales activeCashier={activeCashier} />;
            
            // POS
            case 'sales-pos': return <Sales activeCashier={activeCashier} />;
            case 'sales-history': return <SalesHistory activeCashier={activeCashier} viewMode="pos" />;
            case 'expenses': return <Expenses activeCashier={activeCashier} />;
            
            // Products
            case 'inventory-all': return <Inventory viewMode="all" />;
            case 'add-product': return <Inventory viewMode="add-new" />;
            case 'inventory-online': return <Inventory viewMode="online" />;
            
            // E-commerce Sales
            case 'online-sales': return <div style={{padding: '2rem'}}><h2>Online Sales</h2><p>Successful transactions coming next...</p></div>;
            case 'online-orders': return <div style={{padding: '2rem'}}><h2>Online Orders</h2><p>Fulfillment & Shipping coming next...</p></div>;
            case 'abandoned-carts': return isOwner ? <div style={{padding: '2rem'}}><h2>Abandoned Carts</h2><p>Lost revenue tracking coming next...</p></div> : <Sales activeCashier={activeCashier} />;
            
            // Wallet & Payouts
            case 'wallet': return isOwner ? <div style={{padding: '2rem'}}><h2>My Wallet</h2><p>Available balance & pending clearing coming next...</p></div> : <Sales activeCashier={activeCashier} />;
            case 'payouts': return isOwner ? <div style={{padding: '2rem'}}><h2>Payout Requests</h2><p>Bank & Momo withdrawals coming next...</p></div> : <Sales activeCashier={activeCashier} />;
            case 'upcoming-payouts': return isOwner ? <div style={{padding: '2rem'}}><h2>Upcoming Payouts</h2><p>Scheduled funds coming next...</p></div> : <Sales activeCashier={activeCashier} />;
            case 'payout-settings': return isOwner ? <div style={{padding: '2rem'}}><h2>Payout Settings</h2><p>Bank & Momo accounts coming next...</p></div> : <Sales activeCashier={activeCashier} />;

            // Affiliates Management
            case 'affiliate-management': return isOwner ? <div style={{padding: '2rem'}}><h2>Manage Affiliates</h2><p>Set commission rates & view affiliate network...</p></div> : <Sales activeCashier={activeCashier} />;

            // General & Business
            case 'customers-all': return <Customers />;
            case 'ecommerce-settings': return isOwner ? <EcommerceSettings /> : <Sales activeCashier={activeCashier} />;
            case 'integrations': return isOwner ? <div style={{padding: '2rem'}}><h2>Integrations</h2><p>API connections coming soon...</p></div> : <Sales activeCashier={activeCashier} />;
            case 'settings': return isOwner ? <Settings /> : <Sales activeCashier={activeCashier} />;
            case 'staff': return isOwner ? <Staff /> : <Sales activeCashier={activeCashier} />;

            // Affiliate Mode Views
            case 'affiliate-dashboard': return <div style={{padding: '2rem'}}><h2>Affiliate Dashboard</h2><p>Track your referrals here.</p></div>;

            default: return <div><h1>Welcome!</h1></div>;
        }
    };

    if (loading) return <div className="dashboard-loader">Loading Your Dashboard...</div>;
    if (error) return <div className="dashboard-error">Error: {error}</div>;
    
    // --- NON-TRIPPING NAVIGATION COMPONENTS ---
    const NavItem = ({ view, label, icon: Icon, isSubItem = false }) => (
        <button 
            type="button"
            className={`nav-button ${activeView === view ? 'active' : ''} ${isSubItem ? 'sub-item' : ''}`} 
            onClick={(e) => {
                e.preventDefault();
                handleNavClick(view);
            }}
        >
            {Icon && <Icon />} <span>{label}</span>
        </button>
    );

    const AccordionItem = ({ title, menuKey, icon: Icon, children }) => (
        <div className="accordion-item">
            <button 
                type="button"
                className={`accordion-header ${openMenus[menuKey] ? 'open' : ''}`} 
                onClick={(e) => {
                    e.preventDefault();
                    toggleMenu(menuKey);
                }}
            >
                <div className="accordion-title"><Icon /><span>{title}</span></div>
                <ChevronDownIcon />
            </button>
            <div className={`accordion-content ${openMenus[menuKey] ? 'open' : ''}`}>{children}</div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            
            {/* --- TOP NAVBAR --- */}
            <nav className="top-navbar">
                <div className="top-nav-left">
                    <a href="/dashboard" className="top-nav-logo" onClick={(e) => { e.preventDefault(); handleNavClick('dashboard'); }}>
                        <img src="/logo192.png" alt="Focosmode Logo"/>
                        <span style={{ fontFamily: 'inherit', color: '#111827' }}>Focosmode</span>
                    </a>
                </div>
                
                <div className="top-nav-right">
                    {/* Action Zone: Shown dynamically based on owner and view */}
                    {isOwner && activeView === 'dashboard' && (
                        <select 
                            className="top-currency-filter"
                            value={dashboardCurrencyFilter}
                            onChange={(e) => setDashboardCurrencyFilter(e.target.value)}
                        >
                            <option value="ALL">All Currencies</option>
                            <option value="GHS">GHS (₵)</option>
                            <option value="USD">USD ($)</option>
                            <option value="NGN">NGN (₦)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    )}

                    {isOwner && (
                        <button 
                            type="button"
                            className="top-add-product-btn" 
                            onClick={() => handleNavClick('add-product')}
                        >
                            + Add Product
                        </button>
                    )}

                    <button 
                        type="button" 
                        className="hamburger-btn" 
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </button>
                </div>
            </nav>

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
                        <div style={{color: '#f59e0b', margin: '1rem 0'}}><LockIcon style={{width: '48px', height: '48px'}}/></div>
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
                            <button type="submit" style={{width: '100%', padding: '0.875rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>
                                Verify & Proceed
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- OFF-CANVAS SIDEBAR --- */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
            
            <div className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                
                <div className="sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
                    <button type="button" className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                        <XIcon />
                    </button>
                    
                    <div className="sidebar-business-info" style={{ width: '100%' }}>
                        <h3>{businessData?.businessName || 'My Store'}</h3>
                        <a href={`/store/${currentUser?.uid}`} target="_blank" rel="noopener noreferrer" className="store-link-header" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                            <ExternalLinkIcon /> View Store
                        </a>
                        
                        {/* PROFILE SWITCHER INSIDE SIDEBAR */}
                        {isOwner && (
                            <div className="profile-switcher">
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Workspace</label>
                                <select 
                                    value={activeProfile} 
                                    onChange={(e) => setActiveProfile(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer', outline: 'none', fontWeight: '600' }}
                                >
                                    <option value="creator">🛒 Store Owner</option>
                                    <option value="affiliate">🤝 Affiliate Marketer</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                
                <nav className="sidebar-nav-scrollable">
                    
                    {activeProfile === 'creator' && (
                        <>
                            <div className="menu-label">MENU</div>
                            {isOwner && <NavItem view="dashboard" label="Home" icon={DashboardIcon} />}
                            
                            <AccordionItem title="Point of Sale" menuKey="pos" icon={StoreIcon}>
                                <NavItem view="sales-pos" label="Register (POS)" isSubItem={true} />
                                <NavItem view="sales-history" label="POS History" isSubItem={true} />
                                <NavItem view="expenses" label="Expenses" isSubItem={true} />
                                
                                {/* LOCK / SWITCH CASHIER BUTTON */}
                                <button 
                                    type="button"
                                    className="nav-button sub-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsLocked(true);
                                        setActiveCashier(null);
                                        setIsBackendUnlocked(false);
                                        localStorage.removeItem('activeCashier');
                                        setIsSidebarOpen(false);
                                    }}
                                    style={{ color: '#ef4444', fontWeight: '500' }}
                                >
                                    <LockIcon style={{width: '16px', height: '16px', marginRight: '1rem', color: '#ef4444'}} />
                                    <span>Lock / Switch User</span>
                                </button>
                            </AccordionItem>

                            <AccordionItem title="Products" menuKey="products" icon={InventoryIcon}>
                                <NavItem view="inventory-all" label="All Products" isSubItem={true} />
                                <NavItem view="add-product" label="Add Product" isSubItem={true} />
                                <NavItem view="inventory-online" label="Online Products" isSubItem={true} />
                            </AccordionItem>

                            <AccordionItem title="Sales & Orders" menuKey="ecomSales" icon={SalesIcon}>
                                <NavItem view="online-sales" label="Online Sales" isSubItem={true} />
                                <NavItem view="online-orders" label="Orders" isSubItem={true} />
                                {isOwner && <NavItem view="abandoned-carts" label="Abandoned Transactions" isSubItem={true} />}
                            </AccordionItem>

                            <NavItem view="customers-all" label="Customers" icon={CustomersIcon} />

                            {isOwner && (
                                <>
                                    <AccordionItem title="Wallet & Payouts" menuKey="finance" icon={WalletIcon}>
                                        <NavItem view="wallet" label="Wallet" isSubItem={true} />
                                        <NavItem view="payouts" label="Payouts" isSubItem={true} />
                                        <NavItem view="upcoming-payouts" label="Upcoming Payouts" isSubItem={true} />
                                        <NavItem view="payout-settings" label="Payout Settings" isSubItem={true} />
                                    </AccordionItem>

                                    <AccordionItem title="Affiliates" menuKey="affiliates" icon={UsersIcon}>
                                        <NavItem view="affiliate-management" label="Manage Affiliates" isSubItem={true} />
                                    </AccordionItem>

                                    <AccordionItem title="Settings" menuKey="settings" icon={SettingsIcon}>
                                        <NavItem view="ecommerce-settings" label="Store Settings" isSubItem={true} />
                                        <NavItem view="settings" label="General Settings" isSubItem={true} />
                                        <NavItem view="staff" label="Staff Accounts" isSubItem={true} />
                                    </AccordionItem>

                                    <AccordionItem title="Integrations" menuKey="integrations" icon={LinkIcon}>
                                        <NavItem view="integrations" label="All Integrations" isSubItem={true} />
                                    </AccordionItem>
                                </>
                            )}
                        </>
                    )}

                    {activeProfile === 'affiliate' && (
                        <>
                            <div className="menu-label">AFFILIATE MODE</div>
                            <NavItem view="affiliate-dashboard" label="Overview" icon={DashboardIcon} />
                            <NavItem view="affiliate-sales" label="My Referrals" icon={SalesIcon} />
                            <NavItem view="wallet" label="Wallet & Payouts" icon={WalletIcon} />
                        </>
                    )}

                    <div style={{ marginTop: '1rem', padding: '1rem 1.5rem' }}>
                        <button 
                            type="button" 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 0', background: 'transparent', color: '#ef4444', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
                            onClick={async () => {
                                await signOut(auth);
                                navigate('/');
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width: '20px', height: '20px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Log out
                        </button>
                    </div>
                </nav>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="dashboard-main-content">
                <div className="dashboard-view-container">
                    {renderActiveView()}
                </div>
            </main>
            
        </div>
    );
};

export default FocosmodeDashboard;