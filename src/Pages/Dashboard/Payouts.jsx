// src/Pages/Dashboard/Payouts.jsx
import React, { useState, useEffect } from 'react';
import './Finance.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Payouts = () => {
    const { currentUser } = useAuth();
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        
        // Fixed: Both variable names now match perfectly (payoutsRef)
        const payoutsRef = collection(db, 'businesses', currentUser.uid, 'payoutRequests');
        const q = query(payoutsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPayouts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="finance-container">
            <div className="finance-header">
                <h2>Payout History</h2>
            </div>

            {loading ? (
                <p>Loading history...</p>
            ) : payouts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                    <h3>No payout requests yet.</h3>
                    <p>When you withdraw funds from your wallet, they will appear here.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                                <th style={{ padding: '0.75rem 1rem', backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(payout => (
                                <tr key={payout.id}>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '0.875rem' }}>{formatDate(payout.createdAt)}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '0.875rem', fontWeight: 'bold' }}>{payout.currency || '₵'} {payout.amount.toFixed(2)}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span className={`payout-status-badge ${(payout.status || 'pending').toLowerCase()}`}>
                                            {payout.status || 'Pending'}
                                        </span>
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

export default Payouts;
