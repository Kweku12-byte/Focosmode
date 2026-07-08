// src/components/Landing/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { MenuIcon, XIcon } from '../Icons';

const Navbar = ({ openAuthModal }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <header className="header">
            <div className="container header-container">
                {/* --- UPDATE: Replaced placeholder with local logo192.png and text --- */}
                <a href="/" className="logo" style={{ gap: '0.5rem' }}>
                    <img src="/logo192.png" alt="Focosmode Icon" />
                    <span>Focosmode</span>
                </a>
                <div ref={menuRef}>
                    <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                    <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                        <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
                        <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
                        <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                        <button onClick={() => openAuthModal('login')} className="login-btn">Login</button>
                        <button onClick={() => openAuthModal('signup')} className="cta-button primary nav-cta">Get Started</button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
