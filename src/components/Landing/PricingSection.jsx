// src/components/Landing/PricingSection.jsx
import React from 'react';
import './PricingSection.css';
import { CheckIcon } from '../Icons';

const PricingSection = ({ openAuthModal }) => {
    return (
        <section id="pricing" className="pricing-section">
            <div className="container">
                <div className="section-title">
                    <h3>Simple, Transparent Pricing</h3>
                    <p>Choose the plan that's right for your business. Start with a free 30-day trial of our Pro plan.</p>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-tier">
                        <h4>Basic</h4>
                        <p className="description">For the essentials of running and managing your business online.</p>
                        <p className="price">₵50 / $5<span>/month</span></p>
                        <ul>
                            <li><CheckIcon /> Unlimited Sales Tracking</li>
                            <li><CheckIcon /> Expense Management</li>
                            <li><CheckIcon /> Instant Online Store</li>
                            <li><CheckIcon /> 10 Product Limit</li>
                        </ul>
                        <button onClick={() => openAuthModal('signup')} className="cta-button secondary">Choose Basic</button>
                    </div>

                    <div className="pricing-tier featured">
                        <div className="popular-badge">Most Popular</div>
                        <h4>Pro</h4>
                        <p className="description">Unlock powerful tools to scale your operations and grow faster.</p>
                        <p className="price">₵100 / $10<span>/month</span></p>
                        <ul>
                            <li><CheckIcon /> Everything in Basic, plus:</li>
                            <li><CheckIcon /> Unlimited Products</li>
                            <li><CheckIcon /> Sell Event Tickets & Digital Goods</li>
                            <li><CheckIcon /> Customer Management (CRM)</li>
                            <li><CheckIcon /> Advanced Analytics & Reports</li>
                        </ul>
                        <button onClick={() => openAuthModal('signup')} className="cta-button primary">Start Your 30-Day Pro Trial</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
