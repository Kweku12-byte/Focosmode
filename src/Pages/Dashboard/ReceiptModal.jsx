// src/Pages/Dashboard/ReceiptModal.jsx
import React, { useState } from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ sale, business, onClose, currencies }) => {
    const [viewMode, setViewMode] = useState('modal'); 

    const saleCurrency = sale.currency || 'GHS';
    const currencySymbol = currencies[saleCurrency] || '₵';

    if (viewMode === 'view') {
        return (
            <div className="receipt-modal-overlay">
                <div className="receipt-modal-content">
                    <button className="close-modal-btn" onClick={() => setViewMode('modal')}>Close</button>
                    <h3>Receipt View</h3>
                    <div className="receipt-details" style={{textAlign: 'left', maxHeight: '300px', overflowY: 'auto'}}>
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
        <div className="receipt-modal-overlay">
            <div className="receipt-modal-content">
                <h3>Sale Actions</h3>
                <div className="receipt-actions">
                    <button className="receipt-btn copy" onClick={() => setViewMode('view')}>View Receipt</button>
                    <button className="receipt-btn print" onClick={() => window.print()}>Print Receipt</button>
                    <button className="receipt-btn new-sale" onClick={onClose}>Close</button>
                </div>
            </div>
            {/* Print structure remains unchanged as per previous instruction */}
            <div id="printable-receipt" className="print-only">
               {/* Keep your existing receipt HTML structure here */}
            </div>
        </div>
    );
};
export default ReceiptModal;
