// src/Pages/Dashboard/UpcomingPayouts.jsx
import React, { useState, useEffect } from 'react';
import './Finance.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

const UpcomingPayouts = () => {
    const { currentUser } = useAuth();
    const [pendingAmount, setPendingAmount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // 1. Get total pending from the wallet
        const walletRef = doc(db, 'businesses', currentUser.uid, 'finance', 'wallet');
        const unsubWallet = onSnapshot(walletRef, (docSnap) => {
            if (docSnap.exists()) {
                setPendingAmount(docSnap.data().pending || 0);
            }
        });

        // 2. Get recent online orders to show the clearing pipeline
        const ordersRef = collection(db, 'businesses', currentUser.uid, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(10));
        const unsubOrders = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentOrders(data);
            setLoading(false);
        });

        return () => {
            unsubWallet();
            unsubOrders();
        };
    }, [currentUser]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
    };

    return (
        <div className="finance-container">
            <div className="finance-header">
                <h2>Upcoming Payouts</h2>
            </div>

            <div className="wallet-cards-grid" style={{ marginBottom: '2rem' }}>
                <div className="wallet-card primary">
                    <div className="wallet-card-title">Total Clearing</div>
                    <div className="wallet-card-amount">₵ {pendingAmount.toFixed(2)}</div>
                    <div className="wallet-card-note">Funds currently settling from payment processors.</div>
                </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: '#111827', marginBottom: '0.25rem' }}>Clearing Pipeline</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Online card and mobile money transactions typically take 1-3 business days to clear into your available balance.
            </p>

            {loading ? (
                <p>Loading pipeline...</p>
            ) : recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                    <p>No recent transactions in the clearing pipeline.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Order ID</th>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', fontFamily: 'monospace', fontWeight: 'bold', color: '#374151' }}>#{order.id.slice(-6).toUpperCase()}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>{formatDate(order.createdAt)}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', fontWeight: 'bold' }}>{order.currency || '₵'} {order.totalAmount?.toFixed(2)}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span className="payout-status-badge processing">Clearing</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UpcomingPayouts;
