// src/components/Landing/HeroSection.jsx
import React from 'react';
import './HeroSection.css';

const HeroSection = ({ openAuthModal }) => {
    return (
        <>
            <section className="hero-section">
                <div className="container">
                    <h2>The All-in-One Tool for Your Business</h2>
                    <p>From sales and inventory to an instant online store, Focosmode brings everything together. Focus on growing your business, we'll handle the rest.</p>
                    <button onClick={() => openAuthModal('signup')} className="cta-button primary">Start Your Free Pro Trial</button>
                </div>
            </section>

            <section className="social-proof-section">
                <div className="container">
                    <div className="trusted-by-container">
                        <div className="user-avatars">
                            <img src="https://i.pravatar.cc/60?u=person1" alt="user avatar"/>
                            <img src="https://i.pravatar.cc/60?u=person2" alt="user avatar"/>
                            <img src="https://i.pravatar.cc/60?u=person3" alt="user avatar"/>
                        </div>
                        <h3>Trusted by over <strong>500,000</strong> users worldwide</h3>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroSection;
