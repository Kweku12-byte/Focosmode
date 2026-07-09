// src/Pages/Dashboard/Settings.jsx
import React, { useState, useEffect } from 'react';
import './Settings.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

// --- Icons ---
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;

const CURRENCIES = [
    { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
    { code: 'NGN', label: 'Nigerian Naira (₦)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'EUR', label: 'Euro (€)' }
];

const Settings = () => {
    const { currentUser } = useAuth();
    
    // Form State
    const [businessName, setBusinessName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [currency, setCurrency] = useState('GHS');
    const [receiptMessage, setReceiptMessage] = useState('');
    
    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

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
            // We use setDoc with merge: true just in case the document doesn't fully exist yet
            await setDoc(docRef, {
                businessName,
                ownerName,
                phone,
                address,
                currency,
                receiptMessage,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setStatusMessage({ type: 'success', text: 'Business settings updated successfully!' });
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating settings:", error);
            setStatusMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
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
                    <p>Manage your store profile, currency, and receipt details.</p>
                </div>
            </div>

            {statusMessage.text && (
                <div className={`status-banner ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}

            <div className="settings-card">
                <form onSubmit={handleSaveSettings} className="settings-form">
                    
                    <div className="form-section">
                        <h3>General Information</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Store / Business Name</label>
                                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="e.g. Focosmode Supermarket" />
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
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+233 55 123 4567" />
                            </div>
                            <div className="input-group">
                                <label>Business Address</label>
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street, Accra" />
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
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <span className="input-hint">This currency will be applied to your inventory, sales, and expenses.</span>
                            </div>
                        </div>
                        <div className="input-group full-width mt-4">
                            <label>Receipt Footer Message</label>
                            <textarea 
                                rows="2" 
                                value={receiptMessage} 
                                onChange={e => setReceiptMessage(e.target.value)}
                                placeholder="Thank you for your business! Follow us on IG: @focosmode"
                            ></textarea>
                            <span className="input-hint">This message prints at the very bottom of your customer receipts.</span>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button type="submit" className="save-settings-btn" disabled={saving}>
                            <SaveIcon />
                            {saving ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Settings;
