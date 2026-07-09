// src/Pages/Dashboard/SalesHistory.jsx
import React, { useState, useEffect } from 'react';
import './SalesHistory.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import ReceiptModal from './ReceiptModal';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const SalesHistory = ({ activeCashier }) => {
    const { currentUser } = useAuth();
    const [sales, setSales] = useState([]);
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        
        const salesCollectionRef = collection(db, 'businesses', currentUser.uid, 'sales');
        const q = query(salesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubSales = onSnapshot(q, (snapshot) => {
            const salesData = snapshot.docs.map(docSnap => ({ 
                id: docSnap.id, 
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate ? docSnap.data().createdAt.toDate() : new Date(docSnap.data().createdAt) 
            }));
            setSales(salesData);
            setLoading(false);
        });

        const unsubBusiness = onSnapshot(doc(db, 'businesses', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) setBusinessData(docSnap.data());
        });

        return () => { unsubSales(); unsubBusiness(); };
    }, [currentUser]);

    const filteredSales = sales.filter(sale => 
        (sale.items && sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.cashierName && sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="sales-history-container">
            <div className="sales-history-header">
                <h2>Sales History</h2>
                <div className="header-actions">
                     <div className="search-wrapper">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search order ID, item, or cashier..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            {loading ? <p>Loading sales...</p> : filteredSales.length === 0 ? (
                <div className="no-sales-view">
                    <h3>{searchTerm ? 'No sales match your search.' : 'You haven\'t made any sales yet.'}</h3>
                </div>
            ) : (
                <div className="sales-table-container">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Payment</th>
                                <th>Cashier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id} onClick={() => setSelectedSale(sale)} style={{cursor: 'pointer'}}>
                                    <td>{sale.createdAt ? sale.createdAt.toLocaleDateString() : 'N/A'}</td>
                                    <td>{sale.items?.length || 0} item(s)</td>
                                    <td>{currencies[sale.currency] || '₵'}{(sale.totalAmount || 0).toFixed(2)}</td>
                                    <td>{sale.paymentMethod}</td>
                                    <td>
                                        <span style={{
                                            background: sale.cashierName === 'Owner' ? '#fef3c7' : '#e0e7ff',
                                            color: sale.cashierName === 'Owner' ? '#d97706' : '#1d4ed8',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {sale.cashierName || 'Owner'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSale && (
                <ReceiptModal 
                    sale={selectedSale} 
                    business={businessData}
                    onClose={() => setSelectedSale(null)} 
                    currencies={currencies}
                />
            )}
        </div>
    );
};

export default SalesHistory;
