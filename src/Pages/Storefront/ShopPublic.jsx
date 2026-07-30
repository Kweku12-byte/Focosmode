// src/Pages/Storefront/ShopPublic.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../Services/firebase';
import { collection, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import './Storefront.css';

// --- Icons ---
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- Social Icons ---
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TikTokIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>;
const TelegramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const ShopPublic = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    
    const [business, setBusiness] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Cart & Modal States
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // --- NEW: Track product for overlay ---
    
    // UI States
    const [selectedCurrency, setSelectedCurrency] = useState('GHS');

    useEffect(() => {
        if (!businessId) {
            setError("Store not found.");
            setLoading(false);
            return;
        }

        const fetchBusiness = async () => {
            try {
                const docRef = doc(db, 'businesses', businessId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBusiness(data);
                    setSelectedCurrency(data.currency || 'GHS');
                } else {
                    setError("This store does not exist or has been removed.");
                }
            } catch (err) {
                setError("Failed to load store information.");
            }
        };

        fetchBusiness();

        const productsRef = collection(db, 'businesses', businessId, 'products');
        const q = query(productsRef, where("sellOnline", "==", true));

        const unsubProducts = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setLoading(false);
        });

        return () => unsubProducts();
    }, [businessId]);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setSelectedProduct(null); // Close the overlay if it was open
        setIsCartOpen(true);      // Open the cart drawer
    };

    const updateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                return newQ > 0 ? { ...item, quantity: newQ } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const displayCurrencySymbol = currencies[selectedCurrency] || '₵';
    const brandColor = business?.brandColor || '#111827';

    const handleCheckout = () => {
        navigate(`/checkout/${businessId}`, { state: { cart, cartTotal, business, displayCurrency: selectedCurrency } });
    };

    if (loading) return <div className="store-loading">Loading Store...</div>;
    if (error) return <div className="store-error">{error}</div>;

    return (
        <div className="public-store-layout">
            
            {/* --- NEW: Product Details Quick View Modal --- */}
            {selectedProduct && (
                <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}><XIcon /></button>
                        
                        <div className="product-modal-body">
                            <div 
                                className="product-modal-image" 
                                style={{backgroundImage: `url(${selectedProduct.imageUrl || 'https://placehold.co/600x600/f9fafb/e5e7eb?text=No+Image'})`}}
                            >
                                {selectedProduct.type === 'Digital' && <span className="type-badge" style={{ backgroundColor: brandColor }}>Digital Download</span>}
                                {selectedProduct.type === 'Ticket' && <span className="type-badge ticket" style={{ backgroundColor: brandColor }}>Event Ticket</span>}
                            </div>
                            
                            <div className="product-modal-info">
                                <h2>{selectedProduct.name}</h2>
                                <p className="product-modal-price">{displayCurrencySymbol}{selectedProduct.price.toFixed(2)}</p>
                                
                                <div className="product-modal-description">
                                    {selectedProduct.description ? (
                                        <p>{selectedProduct.description}</p>
                                    ) : (
                                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No description provided for this item.</p>
                                    )}
                                </div>
                                
                                {selectedProduct.type === 'Physical' && (
                                    <p className="product-stock-status">
                                        {selectedProduct.quantity > 0 ? (
                                            <span style={{ color: '#10b981' }}>✓ In Stock ({selectedProduct.quantity} available)</span>
                                        ) : (
                                            <span style={{ color: '#ef4444' }}>✗ Out of Stock</span>
                                        )}
                                    </p>
                                )}

                                <button 
                                    className="public-add-to-cart-btn modal-buy-btn"
                                    style={{ backgroundColor: (selectedProduct.type === 'Physical' && selectedProduct.quantity <= 0) ? '#9ca3af' : brandColor }}
                                    onClick={() => addToCart(selectedProduct)}
                                    disabled={selectedProduct.type === 'Physical' && selectedProduct.quantity <= 0}
                                >
                                    {selectedProduct.type === 'Physical' && selectedProduct.quantity <= 0 ? 'Out of Stock' : 'Add to Cart Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- END PRODUCT MODAL --- */}

            {/* --- Slide-Out Cart Drawer --- */}
            <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-drawer-header">
                    <h2>Your Cart</h2>
                    <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><XIcon /></button>
                </div>
                
                <div className="cart-drawer-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart-message">
                            <ShoppingCartIcon style={{width: '48px', height: '48px', color: '#d1d5db', marginBottom: '1rem'}}/>
                            <p>Your cart is empty.</p>
                            <button className="continue-shopping-btn" style={{ backgroundColor: brandColor }} onClick={() => setIsCartOpen(false)}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="cart-drawer-item">
                                <div className="item-image" style={{backgroundImage: `url(${item.imageUrl || 'https://placehold.co/100x100/f9fafb/e5e7eb?text=Img'})`}}></div>
                                <div className="item-details">
                                    <h4>{item.name}</h4>
                                    <p className="item-price">{displayCurrencySymbol}{item.price.toFixed(2)}</p>
                                    <div className="item-controls">
                                        <div className="qty-controls">
                                            <button onClick={() => updateQuantity(item.id, -1)}><MinusIcon/></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}><PlusIcon/></button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}><TrashIcon/></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="cart-summary-line">
                            <span>Subtotal</span>
                            <span className="summary-total">{displayCurrencySymbol}{cartTotal.toFixed(2)}</span>
                        </div>
                        <p className="tax-shipping-note">Taxes and shipping calculated at checkout</p>
                        <button className="checkout-btn" style={{ backgroundColor: brandColor }} onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
            {/* --- END CART DRAWER --- */}

            <nav className="store-navbar">
                <div className="store-brand">
                    <StoreIcon style={{ color: brandColor }} />
                    <h1>{business?.businessName || 'Welcome to our Store'}</h1>
                </div>
                
                <div className="store-nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={selectedCurrency} 
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', outline: 'none' }}
                    >
                        {Object.keys(currencies).map(code => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>

                    <button className="public-cart-btn" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCartIcon />
                        <span>Cart</span>
                        {cartItemCount > 0 && <span className="cart-badge" style={{ backgroundColor: brandColor }}>{cartItemCount}</span>}
                    </button>
                </div>
            </nav>

            <main className="store-main-content">
                <div className="store-banner">
                    <h2>Shop Our Latest Products</h2>
                    <p>{business?.storeDescription || 'Fast, secure, and reliable checkout powered by Focosmode.'}</p>
                </div>

                {products.length === 0 ? (
                    <div className="empty-store">
                        <p>This store doesn't have any public products yet.</p>
                    </div>
                ) : (
                    <div className="public-product-grid">
                        {products.map(product => (
                            <div key={product.id} className="public-product-card">
                                <div 
                                    className="public-product-image" 
                                    style={{backgroundImage: `url(${product.imageUrl || 'https://placehold.co/400x400/f9fafb/e5e7eb?text=No+Image'})`}}
                                >
                                    {product.type === 'Digital' && <span className="type-badge" style={{ backgroundColor: brandColor }}>Digital Download</span>}
                                    {product.type === 'Ticket' && <span className="type-badge ticket" style={{ backgroundColor: brandColor }}>Event Ticket</span>}
                                </div>
                                
                                <div className="public-product-info">
                                    <h3 className="public-product-name">{product.name}</h3>
                                    <p className="public-product-price">{displayCurrencySymbol}{product.price.toFixed(2)}</p>
                                    
                                    {/* --- CHANGED: View Details Button (Dynamic Ghost Style) --- */}
<button 
    className="public-view-details-btn"
    style={{ 
        backgroundColor: 'transparent', 
        color: brandColor, 
        border: `2px solid ${brandColor}` 
    }}
    onClick={() => setSelectedProduct(product)}
>
    View Details
</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="store-footer" style={{ padding: '3rem 5%', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                {business?.socials && (
                    <div className="social-links" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {business.socials.instagram && <a href={business.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}><InstagramIcon /></a>}
                        {business.socials.facebook && <a href={business.socials.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}><FacebookIcon /></a>}
                        {business.socials.tiktok && <a href={business.socials.tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}><TikTokIcon /></a>}
                        {business.socials.telegram && <a href={business.socials.telegram} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563' }}><TelegramIcon /></a>}
                    </div>
                )}
                <p style={{ margin: 0, color: '#6b7280' }}>&copy; {new Date().getFullYear()} {business?.businessName}. Powered by <strong>Focosmode</strong>.</p>
            </footer>
        </div>
    );
};

export default ShopPublic;
