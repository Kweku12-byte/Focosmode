// src/Pages/Dashboard/ReceiptModal.jsx
import React, { useState } from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ sale, business, onClose, currencies }) => {
    const [viewMode, setViewMode] = useState('modal'); // 'modal' or 'view'

    const handlePrint = () => window.print();

    const saleCurrency = sale.currency || 'GHS';
    const currencySymbol = currencies[saleCurrency] || '₵';

    if (viewMode === 'view') {
        return (
            <div className="receipt-modal-overlay">
                <div className="receipt-modal-content">
                    <button className="close-modal-btn" onClick={() => setViewMode('modal')}>Back</button>
                    <div className="receipt-details" style={{textAlign: 'left'}}>
                         {/* This shows the receipt text on screen */}
                        <pre style={{fontFamily: 'monospace', fontSize: '12px'}}>
{`Date: ${new Date(sale.createdAt).toLocaleString()}
Customer: ${sale.customer?.name || 'Walk-in'}
------------------------------
${sale.items.map(i => `${i.quantity} x ${i.name} - ${currencySymbol}${(i.price * i.quantity).toFixed(2)}`).join('\n')}
------------------------------
Subtotal: ${currencySymbol}${(sale.subtotal || 0).toFixed(2)}
Discount: -${currencySymbol}${(sale.discountAmount || 0).toFixed(2)}
TOTAL: ${currencySymbol}${(sale.totalAmount || 0).toFixed(2)}`}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="receipt-modal-overlay screen-only">
                <div className="receipt-modal-content">
                    <h3>Sale Details</h3>
                    <div className="receipt-actions">
                        <button className="receipt-btn copy" onClick={() => setViewMode('view')}>View Receipt</button>
                        <button className="receipt-btn print" onClick={handlePrint}>Print Receipt</button>
                        <button className="receipt-btn new-sale" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div id="printable-receipt" className="print-only">
                {/* ... keep your existing #printable-receipt JSX exactly as it was ... */}
                <div className="print-header">
                    <h2>{business?.businessName || 'Your Business'}</h2>
                    <p>{business?.address || ''}</p>
                </div>
                <h3>Sale Receipt</h3>
                <p><strong>Order ID:</strong> {sale.id}</p>
                <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
                <table className="print-items-table">
                    <tbody>
                        {sale.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>{currencySymbol}{(item.price || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="grand-total">Total: {currencySymbol}{(sale.totalAmount || 0).toFixed(2)}</p>
            </div>
        </>
    );
};

export default ReceiptModal;
