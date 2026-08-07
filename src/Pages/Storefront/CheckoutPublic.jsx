// src/Pages/Storefront/CheckoutPublic.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { db } from '../../Services/firebase';
import { collection, addDoc, doc, writeBatch } from 'firebase/firestore';
import './Storefront.css';

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>;

const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const CheckoutPublic = () => {
    const { businessId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { cart, cartTotal, business } = location.state || { cart: [], cartTotal: 0, business: null };

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');

    const currencySymbol = currencies[business?.currency] || '₵';
    
    // --- NEW: Figure out order type for the Dashboard ---
    const needsShipping = cart.some(item => item.type === 'Physical');
    const orderType = needsShipping ? 'Physical' : cart.some(item => item.type === 'Ticket') ? 'Ticket' : 'Digital';

    if (!cart || cart.length === 0) {
        return (
            <div className="checkout-empty">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate(`/store/${businessId}`)} className="public-add-to-cart-btn">Return to Store</button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
    };

    // --- SECURE: Now pulling from your .env file! ---
    const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY; 

    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: customerInfo.email,
        amount: cartTotal * 100,
        publicKey: paystackPublicKey,
        currency: business?.currency || 'GHS',
    };

    const handlePaystackSuccessAction = async (reference) => {
        setIsProcessing(true);
        try {
            // --- NEW: Structured to match OnlineOrders.jsx exactly ---
            const orderData = {
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone,
                currency: business?.currency || 'GHS',
                totalAmount: cartTotal,
                createdAt: new Date(),
                orderType: orderType,
                status: needsShipping ? 'Pending' : 'Delivered', 
                paystackRef: reference.reference,
                items: cart.map(({id, name, price, type, quantity}) => ({id, name, price, type, quantity})),
                
                // Format address for the dashboard modal
                shippingAddress: needsShipping ? {
                    street: customerInfo.address,
                    city: 'N/A',
                    region: 'N/A',
                    country: 'Ghana',
                    notes: ''
                } : null
            };

            // --- SAVING TO 'orders' COLLECTION INSTEAD OF 'sales' ---
            const ordersRef = collection(db, 'businesses', businessId, 'orders');
            const docRef = await addDoc(ordersRef, orderData);
            
            // Deduct Inventory
            const batch = writeBatch(db);
            cart.forEach(item => {
                if (item.type === 'Physical') {
                    const productRef = doc(db, 'businesses', businessId, 'products', item.id);
                    batch.update(productRef, { quantity: item.originalQuantity ? item.originalQuantity - item.quantity : 0 });
                }
            });
            await batch.commit();

            setOrderId(docRef.id);
            setPaymentSuccess(true);
        } catch (error) {
            console.error("Error saving order: ", error);
            alert("Payment successful, but order failed to save. Please contact support.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaystackCloseAction = () => {
        console.log("Payment window closed.");
    };

    const componentProps = {
        ...paystackConfig,
        text: `Pay ${currencySymbol}${cartTotal.toFixed(2)} Securely`,
        onSuccess: (reference) => handlePaystackSuccessAction(reference),
        onClose: handlePaystackCloseAction,
    };

    if (paymentSuccess) {
        return (
            <div className="public-store-layout" style={{ backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
                <div className="success-card">
                    <div className="success-icon-wrapper">
                        <CheckCircleIcon />
                    </div>
                    <h2>Payment Successful!</h2>
                    <p>Thank you for your order, <strong>{customerInfo.name}</strong>.</p>
                    
                    <div className="order-id-box">
                        <span>Order Reference ID</span>
                        <strong>{orderId}</strong>
                    </div>

                    <p className="success-email-note">A confirmation receipt has been sent to <strong>{customerInfo.email}</strong></p>
                    
                    <button onClick={() => navigate(`/store/${businessId}`)} className="public-add-to-cart-btn" style={{ marginTop: '1.5rem', backgroundColor: business?.brandColor || '#eab308', color: '#111827' }}>
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="public-store-layout" style={{ backgroundColor: '#fff' }}>
            <div className="checkout-container">
                <div className="checkout-form-section">
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ArrowLeftIcon /> Back to Cart
                    </button>
                    <h2>Contact & Delivery</h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Please enter your details to complete your order.</p>

                    <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" value={customerInfo.name} onChange={handleInputChange} required placeholder="John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}/>
                        </div>
                        
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" value={customerInfo.email} onChange={handleInputChange} required placeholder="john@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}/>
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={customerInfo.phone} onChange={handleInputChange} required placeholder="+233..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}/>
                            </div>
                        </div>

                        {/* Only show address if physical products are in cart */}
                        {needsShipping && (
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <textarea name="address" rows="3" value={customerInfo.address} onChange={handleInputChange} required placeholder="Street address, city, region..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}></textarea>
                            </div>
                        )}
                        
                        {(customerInfo.name && customerInfo.email && customerInfo.phone && (!needsShipping || customerInfo.address)) ? (
                            <PaystackButton className="paystack-checkout-btn" style={{ backgroundColor: business?.brandColor || '#eab308', color: '#111827', width: '100%', padding: '1.25rem', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }} {...componentProps} />
                        ) : (
                            <button disabled className="paystack-checkout-btn disabled" style={{ width: '100%', padding: '1.25rem', background: '#d1d5db', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'not-allowed', marginTop: '1rem' }}>
                                Fill details to Pay
                            </button>
                        )}
                    </form>
                </div>

                <div className="checkout-summary-section">
                    <h3>Order Summary</h3>
                    <div className="summary-items">
                        {cart.map(item => (
                            <div key={item.id} className="summary-item">
                                <div className="summary-item-image" style={{backgroundImage: `url(${item.imageUrl || 'https://placehold.co/60x60'})`}}>
                                    <span className="summary-item-qty">{item.quantity}</span>
                                </div>
                                <div className="summary-item-info">
                                    <h4>{item.name}</h4>
                                    <p>{currencySymbol}{item.price.toFixed(2)}</p>
                                </div>
                                <div className="summary-item-total">
                                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="summary-totals">
                        <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Subtotal</span>
                            <span>{currencySymbol}{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Shipping</span>
                            <span>Calculated later</span>
                        </div>
                        <div className="summary-line final-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <span>Total</span>
                            <span>{currencySymbol}{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPublic;
