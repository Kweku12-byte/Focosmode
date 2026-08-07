// src/Pages/Dashboard/OnlineOrders.jsx
import React, { useState, useEffect } from 'react';
import './OnlineOrders.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore'; // Removed addDoc

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;


const OnlineOrders = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        
        const ordersRef = collection(db, 'businesses', currentUser.uid, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(ordersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching online orders:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus || newStatus === selectedOrder.status) return;
        setIsUpdating(true);
        
        try {
            const orderDocRef = doc(db, 'businesses', currentUser.uid, 'orders', selectedOrder.id);
            await updateDoc(orderDocRef, {
                status: newStatus,
                updatedAt: new Date()
            });
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Error updating order status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status || 'Pending');
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
        setNewStatus('');
    };

    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    };

    const getOrderIcon = (type) => {
        if (type === 'Digital') return <DownloadIcon style={{ width: '16px', height: '16px', color: '#ca8a04', marginRight: '5px' }} />;
        if (type === 'Ticket') return <TicketIcon style={{ width: '16px', height: '16px', color: '#ca8a04', marginRight: '5px' }} />;
        return <BoxIcon style={{ width: '16px', height: '16px', color: '#ca8a04', marginRight: '5px' }} />;
    };

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h2>Online Orders</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="orders-search-wrapper" style={{ marginLeft: '1rem' }}>
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search by ID, Name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <p>Loading your orders...</p>
            ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
                    <h3>No online orders found.</h3>
                    <p>When customers buy from your store, their orders will appear here.</p>
                </div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{order.id.slice(-6).toUpperCase()}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                                        {getOrderIcon(order.orderType)}
                                        {order.orderType || 'Physical'}
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{order.customerName || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.customerEmail}</div>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{order.currency || '₵'} {order.totalAmount?.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="view-btn" onClick={() => openOrderModal(order)}>
                                            <EyeIcon style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- Order Details Modal --- */}
            {selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <button className="close-modal-btn" onClick={closeOrderModal}><XIcon /></button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            {getOrderIcon(selectedOrder.orderType)}
                            <h3 style={{ margin: 0 }}>Order #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                        </div>
                        
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Placed on {formatDate(selectedOrder.createdAt)}</p>

                        <div className="order-details-grid">
                            <div className="order-section">
                                <h4>Customer Details</h4>
                                <p><strong>{selectedOrder.customerName || 'N/A'}</strong></p>
                                <p>{selectedOrder.customerEmail || 'No email provided'}</p>
                                <p>{selectedOrder.customerPhone || 'No phone provided'}</p>
                            </div>
                            
                            <div className="order-section">
                                <h4>Delivery Details</h4>
                                {selectedOrder.orderType === 'Digital' ? (
                                    <div style={{ background: '#fefce8', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fef08a' }}>
                                        <p style={{ color: '#854d0e', fontWeight: '600', fontSize: '0.8rem', margin: 0 }}>
                                            <DownloadIcon style={{ width: '14px', height: '14px', verticalAlign: 'middle' }}/> Digital Delivery
                                        </p>
                                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#374151' }}>File access link has been automatically emailed to <strong>{selectedOrder.customerEmail}</strong>.</p>
                                    </div>
                                ) : selectedOrder.orderType === 'Ticket' ? (
                                    <div style={{ background: '#fefce8', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #fef08a' }}>
                                        <p style={{ color: '#854d0e', fontWeight: '600', fontSize: '0.8rem', margin: 0 }}>
                                            <TicketIcon style={{ width: '14px', height: '14px', verticalAlign: 'middle' }}/> E-Ticket Issued
                                        </p>
                                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#374151' }}>QR Code ticket has been automatically emailed to <strong>{selectedOrder.customerEmail}</strong>.</p>
                                    </div>
                                ) : (
                                    selectedOrder.shippingAddress ? (
                                        <>
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                            {selectedOrder.shippingAddress.notes && <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.5rem' }}>Notes: {selectedOrder.shippingAddress.notes}</p>}
                                        </>
                                    ) : (
                                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No shipping address provided.</p>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="order-section">
                            <h4>Order Summary</h4>
                            <div className="order-items-list">
                                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                    <div className="order-item-row" key={index}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>{selectedOrder.currency || '₵'} {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="order-total-row">
                                    <span>Total Paid</span>
                                    <span style={{ color: '#ca8a04' }}>{selectedOrder.currency || '₵'} {selectedOrder.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-section">
                            <h4>Fulfillment Status</h4>
                            <div className="status-update-group">
                                <select 
                                    value={newStatus} 
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Pending">Pending (Awaiting fulfillment)</option>
                                    <option value="Processing">Processing (Packing order)</option>
                                    <option value="Shipped">Shipped (In transit)</option>
                                    <option value="Delivered">Delivered (Completed)</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <button 
                                    className="modal-submit-btn" 
                                    onClick={handleUpdateStatus}
                                    disabled={isUpdating || newStatus === selectedOrder.status}
                                    style={{ marginTop: '0.5rem', backgroundColor: newStatus !== selectedOrder.status ? '#eab308' : '#e5e7eb', color: newStatus !== selectedOrder.status ? '#111827' : '#9ca3af' }}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineOrders;
