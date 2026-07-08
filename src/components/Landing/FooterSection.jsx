// src/components/Landing/FooterSection.jsx
import React from 'react';
import './FooterSection.css';
import { ChatIcon, InstagramIcon, TiktokIcon, FacebookIcon, XTwitterIcon } from '../Icons';

const FooterSection = ({ openAuthModal }) => {
    return (
        <>
            <section className="final-cta-section">
                <div className="container">
                    <h2>Ready to take control of your business?</h2>
                    <p>Join hundreds of other small business owners and start growing with Focosmode today.</p>
                    <button onClick={() => openAuthModal('signup')} className="cta-button primary">Start Your Free Pro Trial</button>
                </div>
            </section>

            <section className="brand-showcase-section">
                <div className="container">
                    <img src="/logo512.png" alt="Focosmode Brand Logo" className="brand-showcase-logo" />
                </div>
            </section>

            <footer className="footer">
                <div className="container footer-container">
                    <div className="footer-col">
                        {/* --- UPDATE: Stripped default margins and line-height for perfect alignment --- */}
                        <div className="footer-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <img src="/logo192.png" alt="Focosmode Icon" style={{ height: '32px', width: 'auto', display: 'block' }} />
                            <h4 className="footer-logo" style={{ margin: 0, lineHeight: 1 }}>Focosmode</h4>
                        </div>
                        <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
                        <a href="mailto:info@focosmode.com" className="footer-email">info@focosmode.com</a>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#affiliates">Affiliates</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#careers">Careers</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Follow Us</h4>
                        <div className="social-icons">
                            <a href="#social"><InstagramIcon /></a>
                            <a href="#social"><TiktokIcon /></a>
                            <a href="#social"><FacebookIcon /></a>
                            <a href="#social"><XTwitterIcon /></a>
                        </div>
                    </div>
                </div>
            </footer>

            <button className="support-button">
                <ChatIcon />
            </button>
        </>
    );
};

export default FooterSection;
