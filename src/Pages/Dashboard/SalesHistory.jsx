import React, { useState, useEffect } from 'react';
import './SalesHistory.css';
// FIX: Corrected import paths to go up two directories from the Dashboard folder
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// --- Icon Components ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const SalesHistory = () => {
    const { currentUser } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        
        const salesCollectionRef = collection(db, 'businesses', currentUser.uid, 'sales');
        const q = query(salesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() 
            }));
            setSales(salesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching sales history:", err);
            setError('Failed to load sales history.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const filteredSales = sales.filter(sale => 
        (sale.items && sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
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
                            placeholder="Search by product or Order ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            
            {loading ? <p>Loading sales...</p> : filteredSales.length === 0 ? (
                <div className="no-sales-view">
                    <h3>{searchTerm ? 'No sales match your search.' : 'You haven\'t made any sales yet.'}</h3>
                    <p>{!searchTerm && 'Go to the "Sales" tab to record your first transaction.'}</p>
                </div>
            ) : (
                <div className="sales-table-container">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id} onClick={() => setSelectedSale(sale)}>
                                    <td>{sale.createdAt ? sale.createdAt.toLocaleDateString() : 'N/A'} <span className="time">{sale.createdAt ? sale.createdAt.toLocaleTimeString() : ''}</span></td>
                                    <td>{sale.items?.length || 0} item(s)</td>
                                    <td>{currencies[sale.currency] || '₵'}{(sale.totalAmount || 0).toFixed(2)}</td>
                                    <td>{sale.paymentMethod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSale && (
                <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
            )}
        </div>
    );
};


const SaleDetailsModal = ({ sale, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content sale-details-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}><XIcon /></button>
                <h3>Sale Details</h3>
                <div className="sale-details-grid">
                    <div><strong>Order ID:</strong> {sale.id}</div>
                    <div><strong>Date:</strong> {sale.createdAt ? sale.createdAt.toLocaleString() : 'N/A'}</div>
                    <div><strong>Payment Method:</strong> {sale.paymentMethod}</div>
                    <div><strong>Subtotal:</strong> {currencies[sale.currency] || '₵'}{(sale.subtotal || 0).toFixed(2)}</div>
                    <div><strong>Discount:</strong> -{currencies[sale.currency] || '₵'}{(sale.discountAmount || sale.discount || 0).toFixed(2)}</div>
                    <div><strong>Total:</strong> {currencies[sale.currency] || '₵'}{(sale.totalAmount || 0).toFixed(2)}</div>
                </div>
                <h4>Items Sold</h4>
                <ul className="sale-items-list">
                    {(sale.items || []).map((item, index) => (
                        <li key={index}>
                           <span>{item.quantity} x {item.name}</span>
                           <span>{currencies[item.currency] || '₵'}{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export default SalesHistory;

