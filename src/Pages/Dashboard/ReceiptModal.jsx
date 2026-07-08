// src/Pages/Dashboard/ReceiptModal.jsx
import React, { useState } from 'react';
import './ReceiptModal.css';

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ReceiptModal = ({ sale, business, onClose, currencies }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Receipt');

    const copyReceiptToClipboard = () => {
        const saleCurrency = sale.currency || 'GHS';
        const currencySymbol = currencies[saleCurrency] || '₵';

        let receiptText = `*SALE RECEIPT*\n\n`;
        receiptText += `Date: ${new Date(sale.createdAt).toLocaleString()}\n`;
        receiptText += `Payment Method: ${sale.paymentMethod}\n`;
        if (sale.customer) {
            receiptText += `Customer: ${sale.customer.name}\n`;
        }
        receiptText += `--------------------\n`;
        sale.items.forEach(item => {
            receiptText += `${item.quantity} x ${item.name} (@ ${currencySymbol}${(item.price || 0).toFixed(2)} ea)\n`;
        });
        receiptText += `--------------------\n`;
        receiptText += `Subtotal: ${currencySymbol}${(sale.subtotal || 0).toFixed(2)}\n`;
        receiptText += `Discount: -${currencySymbol}${(sale.discountAmount || 0).toFixed(2)}\n`;
        receiptText += `*TOTAL: ${currencySymbol}${(sale.totalAmount || 0).toFixed(2)}*\n\n`;
        
        if ((sale.tenderedAmount || 0) > 0) {
             receiptText += `Tendered: ${currencySymbol}${(sale.tenderedAmount || 0).toFixed(2)}\n`;
             receiptText += `Change: ${currencySymbol}${(sale.changeDue || 0).toFixed(2)}\n`;
        }

        const textArea = document.createElement('textarea');
        textArea.value = receiptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Receipt'), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const saleCurrency = sale.currency || 'GHS';
    const currencySymbol = currencies[saleCurrency] || '₵';

    return (
        <>
            {/* --- SCREEN UI (Hidden during print) --- */}
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
                        <button className="receipt-btn copy" onClick={copyReceiptToClipboard}>{copyButtonText}</button>
                        <button className="receipt-btn print" onClick={handlePrint}>Print Receipt</button>
                        <button className="receipt-btn new-sale" onClick={onClose}>New Sale</button>
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
                <p className="print-footer">Thank you for your business!</p>
            </div>
        </>
    );
};

export default ReceiptModal;
