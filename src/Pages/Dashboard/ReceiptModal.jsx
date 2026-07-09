// src/Pages/Dashboard/ReceiptModal.jsx
import React, { useState } from 'react';
import './ReceiptModal.css';

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ReceiptModal = ({ sale, business, onClose, currencies }) => {
    const [viewMode, setViewMode] = useState('modal'); // 'modal' or 'view'

    const handlePrint = () => {
        window.print();
    };

    const saleCurrency = sale.currency || 'GHS';
    const currencySymbol = currencies[saleCurrency] || '₵';

    // --- VIEW RECEIPT UI ---
    if (viewMode === 'view') {
        let receiptText = `*SALE RECEIPT*\n\n`;
        receiptText += `Date: ${new Date(sale.createdAt).toLocaleString()}\n`;
        receiptText += `Payment Method: ${sale.paymentMethod}\n`;
        if (sale.customer) receiptText += `Customer: ${sale.customer.name}\n`;
        receiptText += `--------------------------------\n`;
        sale.items.forEach(item => {
            receiptText += `${item.quantity} x ${item.name}\n   @ ${currencySymbol}${(item.price || 0).toFixed(2)} ea\n`;
        });
        receiptText += `--------------------------------\n`;
        receiptText += `Subtotal: ${currencySymbol}${(sale.subtotal || 0).toFixed(2)}\n`;
        receiptText += `Discount: -${currencySymbol}${(sale.discountAmount || 0).toFixed(2)}\n`;
        receiptText += `TOTAL:    ${currencySymbol}${(sale.totalAmount || 0).toFixed(2)}\n\n`;
        if ((sale.tenderedAmount || 0) > 0) {
             receiptText += `Tendered: ${currencySymbol}${(sale.tenderedAmount || 0).toFixed(2)}\n`;
             receiptText += `Change:   ${currencySymbol}${(sale.changeDue || 0).toFixed(2)}\n`;
        }
        
        // NEW: Dynamic Receipt Message added to view mode
        receiptText += `\n${business?.receiptMessage || 'Thank you for your business!'}\n`;

        return (
            <div className="receipt-modal-overlay">
                <div className="receipt-modal-content" style={{paddingTop: '3rem'}}>
                    <button className="receipt-close-btn" onClick={() => setViewMode('modal')}>
                        <XIcon />
                    </button>
                    <h3 style={{marginTop: 0}}>Receipt View</h3>
                    <div className="receipt-details" style={{textAlign: 'left', maxHeight: '400px', overflowY: 'auto', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem'}}>
                        <pre style={{fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', margin: 0}}>
                            {receiptText}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    // --- STANDARD MODAL UI ---
    return (
        <>
            <div className="receipt-modal-overlay screen-only">
                <div className="receipt-modal-content">
                    <div className="receipt-header">
                        <CheckCircleIcon />
                        <h3>Sale Recorded!</h3>
                    </div>
                    <div className="receipt-details">
                        <p><strong>Total:</strong> {currencySymbol}{(sale.totalAmount || 0).toFixed(2)}</p>
                        <p><strong>Payment:</strong> {sale.paymentMethod}</p>
                        {sale.customer && <p><strong>Customer:</strong> {sale.customer.name}</p>}
                        <p><strong>Items:</strong></p>
                        <ul>
                            {sale.items.map((item, index) => (
                                <li key={index}>{item.quantity} x {item.name}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="receipt-actions">
                        <button className="receipt-btn copy" onClick={() => setViewMode('view')}>View Receipt</button>
                        <button className="receipt-btn print" onClick={handlePrint}>Print Receipt</button>
                        <button className="receipt-btn new-sale" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {/* --- PRINT UI (Hidden on screen, visible during print) --- */}
            <div id="printable-receipt" className="print-only">
                <div className="print-header">
                    <h2>{business?.businessName || 'Your Business'}</h2>
                    <p>{business?.address || ''}</p>
                    <p>{business?.phone || ''}</p>
                </div>
                <h3>Sale Receipt</h3>
                <p><strong>Order ID:</strong> {sale.id}</p>
                <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
                {sale.customer && <p><strong>Customer:</strong> {sale.customer.name}</p>}
                
                <table className="print-items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{(item.price || 0).toFixed(2)}</td>
                                <td>{((item.price || 0) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="print-totals">
                    <p><strong>Subtotal:</strong> {currencySymbol}{(sale.subtotal || 0).toFixed(2)}</p>
                    <p><strong>Discount:</strong> -{currencySymbol}{(sale.discountAmount || 0).toFixed(2)}</p>
                    <p className="grand-total"><strong>Total:</strong> {currencySymbol}{(sale.totalAmount || 0).toFixed(2)}</p>
                </div>
                {/* NEW: Dynamic Receipt Message on the printed paper */}
                <p className="print-footer">{business?.receiptMessage || 'Thank you for your business!'}</p>
            </div>
        </>
    );
};

export default ReceiptModal;

