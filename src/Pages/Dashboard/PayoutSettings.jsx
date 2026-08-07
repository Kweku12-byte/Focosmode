// src/Pages/Dashboard/PayoutSettings.jsx
import React, { useState, useEffect } from 'react';
import './Finance.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PayoutSettings = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [payoutMethod, setPayoutMethod] = useState('momo'); // 'momo' or 'bank'
    const [provider, setProvider] = useState('MTN');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentUser) return;
            try {
                const docRef = doc(db, 'businesses', currentUser.uid, 'settings', 'payoutInfo');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPayoutMethod(data.method || 'momo');
                    setProvider(data.provider || 'MTN');
                    setAccountName(data.accountName || '');
                    setAccountNumber(data.accountNumber || '');
                }
            } catch (err) {
                console.error("Error fetching payout settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, 'businesses', currentUser.uid, 'settings', 'payoutInfo');
            await setDoc(docRef, {
                method: payoutMethod,
                provider: payoutMethod === 'momo' ? provider : provider, // Bank name if bank
                accountName,
                accountNumber,
                updatedAt: new Date()
            });
            alert("Payout settings saved successfully!");
        } catch (err) {
            console.error("Error saving payout settings:", err);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="finance-container"><p>Loading settings...</p></div>;

    return (
        <div className="finance-container">
            <div className="finance-header">
                <h2>Payout Settings</h2>
            </div>
            
            <form className="finance-form" onSubmit={handleSave}>
                <div className="finance-form-group">
                    <label>Withdrawal Method</label>
                    <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
                        <option value="momo">Mobile Money (MoMo)</option>
                        <option value="bank">Bank Account</option>
                    </select>
                </div>

                {payoutMethod === 'momo' ? (
                    <div className="finance-form-group">
                        <label>Network Provider</label>
                        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                            <option value="MTN">MTN Mobile Money</option>
                            <option value="Telecel">Telecel Cash</option>
                            <option value="AT">AT Money</option>
                        </select>
                    </div>
                ) : (
                    <div className="finance-form-group">
                        <label>Bank Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Ecobank, GCB, GTBank" 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)} 
                            required 
                        />
                    </div>
                )}

                <div className="finance-form-group">
                    <label>Account Name (Must match ID)</label>
                    <input 
                        type="text" 
                        placeholder="John Doe" 
                        value={accountName} 
                        onChange={(e) => setAccountName(e.target.value)} 
                        required 
                    />
                </div>

                <div className="finance-form-group">
                    <label>Account / Phone Number</label>
                    <input 
                        type="text" 
                        placeholder={payoutMethod === 'momo' ? "054XXXXXXX" : "Account Number"} 
                        value={accountNumber} 
                        onChange={(e) => setAccountNumber(e.target.value)} 
                        required 
                    />
                </div>

                <button type="submit" className="finance-primary-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
};

export default PayoutSettings;
