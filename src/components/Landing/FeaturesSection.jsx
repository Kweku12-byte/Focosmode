// src/components/Landing/FeaturesSection.jsx
import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
    return (
        <>
            <section id="how-it-works" className="how-it-works-section">
                <div className="container">
                    <div className="section-title">
                        <h3>Get Started in 3 Simple Steps</h3>
                        <p>Launch your business online in minutes. No technical skills required.</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h4>Create Your Account</h4>
                            <p>Sign up for your free 30-day Pro trial. All you need is an email and your business name.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h4>Add Your Products</h4>
                            <p>Easily add your products or services, set your prices, and upload images right from your phone or computer.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h4>Share Your Store</h4>
                            <p>Get your unique store link instantly. Share it on social media and start receiving orders right away.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="dashboard-preview-section">
                <div className="container">
                    <div className="section-title">
                        <h3>Your Business, All in One Place</h3>
                        <p>Manage everything from a single, powerful dashboard. No more switching between apps.</p>
                    </div>
                    <div className="dashboard-image-placeholder">
                        <p>Dashboard Screenshot Coming Soon</p>
                    </div>
                </div>
            </section>

            <section className="payment-gateways-section">
                <div className="container">
                    <div className="section-title">
                        <h3>Accept Payments From Anywhere</h3>
                        <p>We support local and international payment methods to ensure you never miss a sale.</p>
                    </div>
                    <div className="gateways-grid">
                        <img src="/assets/logos/mtn.svg" alt="MTN Mobile Money" />
                        <img src="/assets/logos/telecel.svg" alt="Telecel Cash" />
                        <img src="/assets/logos/airteltigo.svg" alt="AirtelTigo Money" />
                        <img src="/assets/logos/mpesa.svg" alt="M-Pesa" />
                        <img src="/assets/logos/visa.svg" alt="Visa" />
                        <img src="/assets/logos/mastercard.svg" alt="Mastercard" />
                    </div>
                </div>
            </section>

            <section className="integrations-section">
                <div className="container">
                    <div className="section-title">
                        <h3>Integrate With Your Favorite Tools</h3>
                        <p>Connect Focosmode to the tools you already use to automate your workflow.</p>
                    </div>
                    <div className="integrations-grid">
                        <div className="integration-card"><img src="/assets/logos/mailchimp.svg" alt="Mailchimp" /></div>
                        <div className="integration-card"><img src="/assets/logos/convertkit.svg" alt="ConvertKit" /></div>
                        <div className="integration-card"><img src="/assets/logos/zapier.svg" alt="Zapier" /></div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FeaturesSection;
