import React, { useState, useEffect } from 'react';
import './Sales.css';
// FIX: Corrected import paths to go up two directories
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch } from 'firebase/firestore';

// --- Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const Sales = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processingSale, setProcessingSale] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash'); // NEW: State for payment method

    // --- NEW: State for Receipt Modal ---
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const productsCollectionRef = collection(db, 'businesses', currentUser.uid, 'products');
        const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (product.type !== 'Physical' || existingItem.quantity < product.quantity) {
                 setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, originalQuantity: product.quantity } : item));
            }
        } else {
            if (product.type !== 'Physical' || product.quantity > 0) {
                 setCart([...cart, { ...product, quantity: 1, originalQuantity: product.quantity }]);
            }
        }
    };

    const updateCartQuantity = (productId, newQuantity) => {
        const cartItem = cart.find(item => item.id === productId);
        if (newQuantity < 1) {
            setCart(cart.filter(item => item.id !== productId));
        } else if (cartItem.type !== 'Physical' || newQuantity <= cartItem.originalQuantity) {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };
    
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0 || !currentUser) return;
        setProcessingSale(true);

        const saleData = {
            items: cart.map(({id, name, price, currency, quantity}) => ({id, name, price, currency, quantity})),
            totalAmount: calculateTotal(),
            currency: cart.length > 0 ? cart[0].currency : 'GHS',
            paymentMethod: paymentMethod, // NEW: Save payment method
            createdAt: new Date(),
        };

        try {
            const salesCollectionRef = collection(db, 'businesses', currentUser.uid, 'sales');
            await addDoc(salesCollectionRef, saleData);

            const batch = writeBatch(db);
            for (const item of cart) {
                if (item.type === 'Physical') {
                    const productRef = doc(db, 'businesses', currentUser.uid, 'products', item.id);
                    const newQuantity = item.originalQuantity - item.quantity;
                    batch.update(productRef, { quantity: newQuantity });
                }
            }
            await batch.commit();

            // NEW: Show receipt modal on success
            setLastSale(saleData);
            setShowReceiptModal(true);
            setCart([]);
            setPaymentMethod('Cash'); // Reset payment method

        } catch (error) {
            console.error("Error processing sale: ", error);
        } finally {
            setProcessingSale(false);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="pos-layout">
            <div className="product-selection">
                <div className="pos-header">
                    <h3>Products</h3>
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {loading ? <p>Loading...</p> : (
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <button 
                                key={product.id} 
                                className="product-card" 
                                onClick={() => addToCart(product)}
                                disabled={(product.type === 'Physical' && product.quantity === 0) || processingSale}
                            >
                                <div className="product-card-image" style={{backgroundImage: `url(${product.imageUrl || 'https://placehold.co/150x150/f9fafb/e5e7eb?text=Img'})`}}></div>
                                <div className="product-card-info">
                                    <p className="product-name">{product.name}</p>
                                    <p className="product-price">{currencies[product.currency] || '₵'}{product.price.toFixed(2)}</p>
                                    {product.type === 'Physical' && <p className="product-stock">{product.quantity} in stock</p>}
                                </div>
                                {(product.type === 'Physical' && product.quantity === 0) && <div className="out-of-stock-overlay">Out of Stock</div>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="cart-summary">
                <div className="pos-header">
                    <h3>Current Sale</h3>
                </div>
                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <p>Select products to start a new sale.</p>
                    </div>
                ) : (
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="item-details">
                                    <p className="item-name">{item.name}</p>
                                    <p className="item-price">{currencies[item.currency] || '₵'}{item.price.toFixed(2)}</p>
                                </div>
                                <div className="item-controls">
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} disabled={processingSale}><MinusIcon /></button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} disabled={processingSale}><PlusIcon /></button>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)} disabled={processingSale}><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="cart-footer">
                     {/* --- NEW: Payment Method Selector --- */}
                    <div className="payment-method-selector">
                        <label htmlFor="payment-method">Payment Method</label>
                        <select 
                            id="payment-method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled={processingSale}
                        >
                            <option>Cash</option>
                            <option>Mobile Money</option>
                            <option>Card</option>
                            <option>Bank Transfer</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="total-section">
                        <span className="total-label">Total</span>
                        <span className="total-amount">{currencies[cart[0]?.currency] || '₵'}{calculateTotal().toFixed(2)}</span>
                    </div>
                    <button 
                        className="checkout-btn" 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0 || processingSale}
                    >
                        {processingSale ? 'Processing...' : 'Record Sale'}
                    </button>
                </div>
            </div>

             {/* --- NEW: Receipt Modal --- */}
            {showReceiptModal && lastSale && (
                <ReceiptModal sale={lastSale} onClose={() => setShowReceiptModal(false)} />
            )}
        </div>
    );
};

// --- NEW: Receipt Modal Component ---
const ReceiptModal = ({ sale, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Receipt');

    const copyReceiptToClipboard = () => {
        let receiptText = `*SALE RECEIPT*\n\n`;
        receiptText += `Date: ${new Date(sale.createdAt).toLocaleString()}\n`;
        receiptText += `Payment Method: ${sale.paymentMethod}\n`;
        receiptText += `--------------------\n`;
        sale.items.forEach(item => {
            receiptText += `${item.quantity} x ${item.name} (@ ${currencies[item.currency]}${item.price.toFixed(2)} ea)\n`;
        });
        receiptText += `--------------------\n`;
        receiptText += `*TOTAL: ${currencies[sale.currency]}${sale.totalAmount.toFixed(2)}*`;

        // Use the clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = receiptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Receipt'), 2000);
    };

    return (
        <div className="receipt-modal-overlay">
            <div className="receipt-modal-content">
                <div className="receipt-header">
                    <CheckCircleIcon />
                    <h3>Sale Recorded!</h3>
                </div>
                <div className="receipt-details">
                    <p><strong>Total:</strong> {currencies[sale.currency]}{sale.totalAmount.toFixed(2)}</p>
                    <p><strong>Payment:</strong> {sale.paymentMethod}</p>
                    <p><strong>Items:</strong></p>
                    <ul>
                        {sale.items.map((item, index) => (
                            <li key={index}>{item.quantity} x {item.name}</li>
                        ))}
                    </ul>
                </div>
                <div className="receipt-actions">
                    <button className="receipt-btn copy" onClick={copyReceiptToClipboard}>{copyButtonText}</button>
                    <button className="receipt-btn new-sale" onClick={onClose}>New Sale</button>
                </div>
            </div>
        </div>
    );
};


export default Sales;

