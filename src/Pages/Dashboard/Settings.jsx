// src/Pages/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// --- Icons ---
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;

const CURRENCIES = [
    { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
    { code: 'NGN', label: 'Nigerian Naira (₦)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'EUR', label: 'Euro (€)' }
];

const Settings = () => {
    const { currentUser } = useAuth();
    
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [currency, setCurrency] = useState('GHS');
    const [receiptMessage, setReceiptMessage] = useState('');
    const [ownerPin, setOwnerPin] = useState('0000');
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [showPin, setShowPin] = useState(false); // --- NEW: Toggle for PIN visibility ---

    useEffect(() => {
        if (!currentUser) return;
        const docRef = doc(db, 'businesses', currentUser.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBusinessName(data.businessName || '');
                setOwnerName(data.ownerName || '');
                setPhone(data.phone || '');
                setAddress(data.address || '');
                setCurrency(data.currency || 'GHS');
                setReceiptMessage(data.receiptMessage || 'Thank you for your business!');
                setOwnerPin(data.ownerPin || '0000'); 
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatusMessage({ type: '', text: '' });

        try {
            const docRef = doc(db, 'businesses', currentUser.uid);
            await setDoc(docRef, {
                businessName, ownerName, phone, address, currency, receiptMessage,
                ownerPin, 
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setStatusMessage({ type: 'success', text: 'Business settings updated successfully!' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="settings-loading">Loading settings...</div>;

    return (
        <div className="settings-container">
            <div className="settings-header">
                <div className="header-icon"><StoreIcon /></div>
                <div>
                    <h2>Business Settings</h2>
                    <p>Manage your store profile, currency, and security.</p>
                </div>
            </div>

            {statusMessage.text && (
                <div className={`status-banner ${statusMessage.type}`}>{statusMessage.text}</div>
            )}

            <div className="settings-card">
                <form onSubmit={handleSaveSettings} className="settings-form">
                    
                    <div className="form-section">
                        <h3>General Information</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Store / Business Name</label>
                                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Owner's Name</label>
                                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-section">
                        <h3>Contact & Location</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Business Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-section">
                        <h3>Store Preferences</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Default Currency</label>
                                <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="input-group full-width mt-4">
                            <label>Receipt Footer Message</label>
                            <textarea rows="2" value={receiptMessage} onChange={e => setReceiptMessage(e.target.value)}></textarea>
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="form-section">
                        <h3>Security</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Owner POS PIN</label>
                                {/* --- NEW: Wrapper with Eye Icon Toggle --- */}
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type={showPin ? "text" : "password"} 
                                        maxLength="4" 
                                        value={ownerPin} 
                                        onChange={e => setOwnerPin(e.target.value.replace(/\D/g, ''))} 
                                        required
                                        style={{ width: '100%', paddingRight: '2.5rem' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPin(!showPin)}
                                        style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0, display: 'flex' }}
                                        title={showPin ? "Hide PIN" : "Show PIN"}
                                    >
                                        {showPin ? <EyeOffIcon style={{width: '20px', height: '20px'}} /> : <EyeIcon style={{width: '20px', height: '20px'}} />}
                                    </button>
                                </div>
                                {/* --- NEW: Updated clear instructions --- */}
                                <span className="input-hint">To change your PIN, just type a new 4-digit number here and click "Save Settings".</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button type="submit" className="save-settings-btn" disabled={saving}>
                            <SaveIcon /> {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Settings;
