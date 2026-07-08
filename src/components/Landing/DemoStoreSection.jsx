// src/components/Landing/DemoStoreSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import './DemoStoreSection.css';
import { SearchIcon, CartIcon, ChevronDownIcon, InstagramIcon, TiktokIcon, FacebookIcon } from '../Icons';

const DemoStoreSection = () => {
    const [isCurrencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const currencyRef = useRef(null);
    
    const currencies = [
        { code: 'GHS', flag: '🇬🇭' },
        { code: 'NGN', flag: '🇳🇬' },
        { code: 'USD', flag: '🇺🇸' },
        { code: 'GBP', flag: '🇬🇧' },
    ];
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (currencyRef.current && !currencyRef.current.contains(event.target)) {
                setCurrencyDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [currencyRef]);

    return (
        <section className="demo-store-section">
            <div className="container">
                <div className="demo-store-window">
                    <div className="browser-header">
                        <div className="browser-dots">
                            <span className="window-dot red"></span>
                            <span className="window-dot yellow"></span>
                            <span className="window-dot green"></span>
                        </div>
                        <div className="browser-url-bar">https://focosmode.com/demo</div>
                    </div>
                    <div className="store-ui">
                        <div className="store-sidebar">
                            <div className="store-brand">
                                <img src="https://placehold.co/80x80/1f2937/ffffff?text=S" alt="Store Logo" className="demo-store-logo" />
                                <h3>Demo Store</h3>
                                <div className="demo-store-socials">
                                    <a href="#demo"><InstagramIcon /></a>
                                    <a href="#demo"><TiktokIcon /></a>
                                    <a href="#demo"><FacebookIcon /></a>
                                </div>
                                <p>You can sell anything with Focosmode!</p>
                            </div>
                        </div>
                        <div className="store-main-content">
                            <div className="store-top-bar">
                                <div className="search-bar">
                                    <SearchIcon />
                                    <input type="text" placeholder="Search for a product" />
                                </div>
                                <div className="store-controls">
                                    <div className="currency-selector" ref={currencyRef}>
                                        <button onClick={() => setCurrencyDropdownOpen(!isCurrencyDropdownOpen)}>
                                            <span>{selectedCurrency.flag}</span>
                                            <span>{selectedCurrency.code}</span>
                                            <ChevronDownIcon isOpen={isCurrencyDropdownOpen} />
                                        </button>
                                        {isCurrencyDropdownOpen && (
                                            <ul className="currency-dropdown">
                                                {currencies.map(currency => (
                                                    <li key={currency.code} onClick={() => {
                                                        setSelectedCurrency(currency);
                                                        setCurrencyDropdownOpen(false);
                                                    }}>
                                                        <span>{currency.flag}</span>
                                                        <span>{currency.code}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="cart-container">
                                        <CartIcon />
                                        <span className="cart-count">3</span>
                                    </div>
                                </div>
                            </div>
                            <div className="live-demo-products-grid">
                                <div className="live-demo-product-card">
                                    <div className="product-image-placeholder book"></div>
                                    <p className="product-title">Milk and Honey by Rupi Kaur</p>
                                    <p className="product-price">₵45.00</p>
                                </div>
                                <div className="live-demo-product-card">
                                    <div className="product-image-placeholder course"></div>
                                    <p className="product-title">Digital Marketing Course</p>
                                    <p className="product-price">₵300.00</p>
                                </div>
                                <div className="live-demo-product-card">
                                    <div className="product-image-placeholder ticket"></div>
                                    <p className="product-title">Afrochella Ticket</p>
                                    <p className="product-price">₵150.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoStoreSection;
