import React, { useState, useEffect, useMemo } from 'react';
import './Sales.css';
// FIX: Corrected import paths to be relative from the 'Pages/Dashboard' directory
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch } from 'firebase/firestore';

// --- Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UserAddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;


const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const Sales = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processingSale, setProcessingSale] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [discount, setDiscount] = useState('');
    const [discountType, setDiscountType] = useState('fixed');
    const [tenderedAmount, setTenderedAmount] = useState('');

    const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerModalView, setCustomerModalView] = useState('list');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [businessData, setBusinessData] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);

        const productsRef = collection(db, 'businesses', currentUser.uid, 'products');
        const customersRef = collection(db, 'businesses', currentUser.uid, 'customers');
        const businessDocRef = doc(db, 'businesses', currentUser.uid);

        const unsubProducts = onSnapshot(productsRef, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubCustomers = onSnapshot(customersRef, (snapshot) => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        
        const unsubBusiness = onSnapshot(businessDocRef, (doc) => {
            if (doc.exists()) {
                setBusinessData(doc.data());
            }
        });
        
        setLoading(false);
        return () => {
            unsubProducts();
            unsubCustomers();
            unsubBusiness();
        };
    }, [currentUser]);

    const { subtotal, discountAmount, finalTotal } = useMemo(() => {
        const sub = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        let disc = 0;
        const discountValue = parseFloat(discount);
        if (discountValue > 0) {
            if (discountType === 'fixed') {
                disc = Math.min(sub, discountValue);
            } else { // percentage
                disc = (sub * discountValue) / 100;
            }
        }
        const final = sub - disc;
        return { subtotal: sub, discountAmount: disc, finalTotal: final < 0 ? 0 : final };
    }, [cart, discount, discountType]);

    const changeDue = useMemo(() => {
        const tendered = parseFloat(tenderedAmount);
        if (!tendered || tendered < finalTotal) return 0;
        return tendered - finalTotal;
    }, [tenderedAmount, finalTotal]);

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

    const handleCheckout = async () => {
        if (cart.length === 0 || !currentUser) return;
        setProcessingSale(true);

        const saleData = {
            items: cart.map(({id, name, price, currency, quantity}) => ({id, name, price, currency, quantity})),
            subtotal, 
            discount: parseFloat(discount) || 0,
            discountType,
            discountAmount, 
            totalAmount: finalTotal, 
            tenderedAmount: parseFloat(tenderedAmount) || 0, 
            changeDue,
            currency: cart[0]?.currency || 'GHS',
            paymentMethod,
            createdAt: new Date(),
            customer: selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name } : null,
        };

        try {
            const salesCollectionRef = collection(db, 'businesses', currentUser.uid, 'sales');
            const docRef = await addDoc(salesCollectionRef, { ...saleData, createdAt: new Date(saleData.createdAt) });
            
            const batch = writeBatch(db);
            for (const item of cart) {
                if (item.type === 'Physical') {
                    const productRef = doc(db, 'businesses', currentUser.uid, 'products', item.id);
                    const newQuantity = item.originalQuantity - item.quantity;
                    batch.update(productRef, { quantity: newQuantity });
                }
            }
            await batch.commit();

            setLastSale({ ...saleData, id: docRef.id });
            setShowReceiptModal(true);
            setCart([]);
            setPaymentMethod('Cash');
            setDiscount('');
            setTenderedAmount('');
            setSelectedCustomer(null);

        } catch (error) {
            console.error("Error processing sale: ", error);
        } finally {
            setProcessingSale(false);
        }
    };

    const handleAddNewCustomer = async (e) => {
        e.preventDefault();
        if (!currentUser || !newCustomerName) return;

        const customerData = {
            name: newCustomerName,
            email: newCustomerEmail,
            phone: newCustomerPhone,
            createdAt: new Date(),
        };

        try {
            const customersCollectionRef = collection(db, 'businesses', currentUser.uid, 'customers');
            const docRef = await addDoc(customersCollectionRef, customerData);
            
            setSelectedCustomer({ id: docRef.id, ...customerData });
            
            setIsCustomerSelectorOpen(false);
            setNewCustomerName('');
            setNewCustomerEmail('');
            setNewCustomerPhone('');
            setCustomerModalView('list');

        } catch (error) {
            console.error("Error adding new customer:", error);
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

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
                    <div className="customer-selector-container">
                        {selectedCustomer ? (
                            <div className="selected-customer-display">
                               <span>{selectedCustomer.name}</span>
                               <button onClick={() => setSelectedCustomer(null)}>Remove</button>
                            </div>
                        ) : (
                            <button className="add-customer-to-sale-btn" onClick={() => setIsCustomerSelectorOpen(true)}>
                                <UserAddIcon />
                                <span>Add Customer to Sale</span>
                            </button>
                        )}
                    </div>
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

                    <div className="checkout-calculations">
                        <div className="calc-group">
                            <label htmlFor="discount">Discount</label>
                            <div className="discount-group">
                                <input 
                                    id="discount"
                                    type="number" 
                                    className="discount-input"
                                    placeholder="0"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    disabled={processingSale}
                                />
                                <select 
                                    className="discount-type-selector"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    disabled={processingSale}
                                >
                                    <option value="fixed">{currencies[cart[0]?.currency] || '₵'}</option>
                                    <option value="percentage">%</option>
                                </select>
                            </div>
                        </div>
                         <div className="calc-group">
                            <label htmlFor="tendered">Amount Tendered</label>
                            <input 
                                id="tendered"
                                type="number" 
                                placeholder="0.00"
                                value={tenderedAmount}
                                onChange={(e) => setTenderedAmount(e.target.value)}
                                disabled={processingSale}
                            />
                        </div>
                    </div>
                    
                    <div className="summary-line">
                        <span>Subtotal</span>
                        <span>{currencies[cart[0]?.currency] || '₵'}{subtotal.toFixed(2)}</span>
                    </div>
                     <div className="summary-line">
                        <span>Discount</span>
                        <span>-{currencies[cart[0]?.currency] || '₵'}{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="total-section">
                        <span className="total-label">Total</span>
                        <span className="total-amount">{currencies[cart[0]?.currency] || '₵'}{finalTotal.toFixed(2)}</span>
                    </div>
                     <div className="summary-line change-due">
                        <span>Change Due</span>
                        <span>{currencies[cart[0]?.currency] || '₵'}{changeDue.toFixed(2)}</span>
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

            {showReceiptModal && lastSale && (
                <ReceiptModal 
                    sale={lastSale} 
                    business={businessData}
                    onClose={() => setShowReceiptModal(false)} 
                />
            )}

            {isCustomerSelectorOpen && (
                <div className="modal-overlay">
                    <div className="modal-content customer-selector-modal">
                        <button className="close-modal-btn" onClick={() => setIsCustomerSelectorOpen(false)}><XIcon /></button>
                        
                        {customerModalView === 'list' ? (
                            <>
                                <h3>Select a Customer</h3>
                                <div className="search-wrapper">
                                    <SearchIcon />
                                    <input type="text" placeholder="Search customers..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
                                </div>
                                <ul className="customer-list">
                                    {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                                        <li key={customer.id} onClick={() => { setSelectedCustomer(customer); setIsCustomerSelectorOpen(false); }}>
                                            <p className="customer-name">{customer.name}</p>
                                            <p className="customer-phone">{customer.phone}</p>
                                        </li>
                                    )) : <p className="no-results">No customers found.</p>}
                                </ul>
                                <button className="quick-add-customer-btn" onClick={() => setCustomerModalView('add')}>
                                    <PlusIcon /> Add New Customer
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>Add a New Customer</h3>
                                <form onSubmit={handleAddNewCustomer}>
                                    <div className="form-group"><label>Customer Name</label><input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} required /></div>
                                    <div className="form-group"><label>Email (Optional)</label><input type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} /></div>
                                    <div className="form-group"><label>Phone Number (Optional)</label><input type="tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} /></div>
                                    <div className="quick-add-actions">
                                        <button type="button" className="back-btn" onClick={() => setCustomerModalView('list')}><ArrowLeftIcon /> Back to List</button>
                                        <button type="submit" className="save-customer-btn">Save Customer</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReceiptModal = ({ sale, business, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Receipt');

    const copyReceiptToClipboard = () => {
        const saleSubtotal = sale.subtotal || 0;
        const saleDiscountAmount = sale.discountAmount || 0;
        const saleTotalAmount = sale.totalAmount || 0;
        const saleTenderedAmount = sale.tenderedAmount || 0;
        const saleChangeDue = sale.changeDue || 0;
        const saleCurrency = sale.currency || 'GHS';

        let receiptText = `*SALE RECEIPT*\n\n`;
        receiptText += `Date: ${new Date(sale.createdAt).toLocaleString()}\n`;
        receiptText += `Payment Method: ${sale.paymentMethod}\n`;
        if (sale.customer) {
            receiptText += `Customer: ${sale.customer.name}\n`;
        }
        receiptText += `--------------------\n`;
        sale.items.forEach(item => {
            receiptText += `${item.quantity} x ${item.name} (@ ${currencies[item.currency]}${(item.price || 0).toFixed(2)} ea)\n`;
        });
        receiptText += `--------------------\n`;
        receiptText += `Subtotal: ${currencies[saleCurrency]}${saleSubtotal.toFixed(2)}\n`;
        receiptText += `Discount: -${currencies[saleCurrency]}${saleDiscountAmount.toFixed(2)}\n`;
        receiptText += `*TOTAL: ${currencies[saleCurrency]}${saleTotalAmount.toFixed(2)}*\n\n`;
        if (saleTenderedAmount > 0) {
             receiptText += `Tendered: ${currencies[saleCurrency]}${saleTenderedAmount.toFixed(2)}\n`;
             receiptText += `Change: ${currencies[saleCurrency]}${saleChangeDue.toFixed(2)}\n`;
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

    const saleSubtotal = sale.subtotal || 0;
    const saleDiscountAmount = sale.discountAmount || 0;
    const saleTotalAmount = sale.totalAmount || 0;
    const saleCurrency = sale.currency || 'GHS';

    return (
        <>
            <div className="receipt-modal-overlay">
                <div className="receipt-modal-content">
                    <div className="receipt-header">
                        <CheckCircleIcon />
                        <h3>Sale Recorded!</h3>
                    </div>
                    <div className="receipt-details">
                        <p><strong>Total:</strong> {currencies[saleCurrency]}{saleTotalAmount.toFixed(2)}</p>
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
                    <p><strong>Subtotal:</strong> {currencies[saleCurrency]}{saleSubtotal.toFixed(2)}</p>
                    <p><strong>Discount:</strong> -{currencies[saleCurrency]}{saleDiscountAmount.toFixed(2)}</p>
                    <p className="grand-total"><strong>Total:</strong> {currencies[saleCurrency]}{saleTotalAmount.toFixed(2)}</p>
                </div>
                <p className="print-footer">Thank you for your business!</p>
            </div>
        </>
    );
};

export default Sales;