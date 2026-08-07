// src/Pages/Dashboard/Wallet.jsx
import React, { useState, useEffect } from 'react';
import './Finance.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

const Wallet = () => {
    const { currentUser } = useAuth();
    const [wallet, setWallet] = useState({ available: 0, pending: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const walletRef = doc(db, 'businesses', currentUser.uid, 'finance', 'wallet');
        
        const unsubscribe = onSnapshot(walletRef, async (docSnap) => {
            if (docSnap.exists()) {
                setWallet(docSnap.data());
            } else {
                // Initialize wallet if it doesn't exist
                await setDoc(walletRef, { available: 0, pending: 0, total: 0 });
                setWallet({ available: 0, pending: 0, total: 0 });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleRequestPayout = async () => {
        if (wallet.available < 10) return alert("Minimum payout is ₵10.00");
        setRequesting(true);

        try {
            // 1. Create a payout request
            await addDoc(collection(db, 'businesses', currentUser.uid, 'payoutRequests'), {
                amount: wallet.available,
                status: 'Pending',
                createdAt: new Date(),
                currency: 'GHS'
            });

            // 2. Deduct from available balance
            const walletRef = doc(db, 'businesses', currentUser.uid, 'finance', 'wallet');
            await updateDoc(walletRef, {
                available: 0 // Reset to 0 after full withdrawal request
            });
            
            alert("Payout requested successfully! Our team is processing it.");
        } catch (err) {
            console.error("Error requesting payout:", err);
            alert("Failed to request payout.");
        } finally {
            setRequesting(false);
        }
    };

    // --- TEST FUNCTIONS ---
    const injectPendingFunds = async () => {
        const walletRef = doc(db, 'businesses', currentUser.uid, 'finance', 'wallet');
        await updateDoc(walletRef, {
            pending: wallet.pending + 150.00,
            total: wallet.total + 150.00
        });
    };

    const clearPendingFunds = async () => {
        if (wallet.pending <= 0) return alert("No pending funds to clear.");
        const walletRef = doc(db, 'businesses', currentUser.uid, 'finance', 'wallet');
        await updateDoc(walletRef, {
            available: wallet.available + wallet.pending,
            pending: 0
        });
    };

    if (loading) return <div className="finance-container"><p>Loading wallet...</p></div>;

    return (
        <div className="finance-container">
            <div className="finance-header">
                <h2>My Wallet</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={injectPendingFunds} style={{ background: '#e5e7eb', border: 'none', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem' }}>+ Test Sale (₵150)</button>
                    <button onClick={clearPendingFunds} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.8rem' }}>Simulate Paystack Clearing</button>
                </div>
            </div>

            <div className="wallet-cards-grid">
                <div className="wallet-card primary">
                    <div className="wallet-card-title">Available for Withdrawal</div>
                    <div className="wallet-card-amount">₵ {wallet.available.toFixed(2)}</div>
                    <div className="wallet-card-note">Funds cleared and ready to transfer.</div>
                </div>
                
                <div className="wallet-card">
                    <div className="wallet-card-title">Pending Clearance</div>
                    <div className="wallet-card-amount">₵ {wallet.pending.toFixed(2)}</div>
                    <div className="wallet-card-note">Awaiting Paystack settlement (1-3 days).</div>
                </div>

                <div className="wallet-card">
                    <div className="wallet-card-title">Total Lifetime Earnings</div>
                    <div className="wallet-card-amount">₵ {wallet.total.toFixed(2)}</div>
                    <div className="wallet-card-note">All-time revenue processed.</div>
                </div>
            </div>

            <button 
                className="finance-primary-btn" 
                onClick={handleRequestPayout}
                disabled={wallet.available < 10 || requesting}
            >
                {requesting ? 'Processing...' : `Request Payout (₵ ${wallet.available.toFixed(2)})`}
            </button>
            {wallet.available < 10 && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>Minimum withdrawal is ₵10.00</p>}
        </div>
    );
};

export default Wallet;
