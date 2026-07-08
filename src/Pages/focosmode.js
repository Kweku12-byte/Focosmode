// src/Pages/focosmode.js
import React, { useState } from 'react';
import './focosmode.css';
import AuthModal from '../components/AuthModal';

// Modular Landing Sections
import Navbar from '../components/Landing/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import DemoStoreSection from '../components/Landing/DemoStoreSection';
import FeaturesSection from '../components/Landing/FeaturesSection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import PricingSection from '../components/Landing/PricingSection';
import FAQSection from '../components/Landing/FAQSection';
import FooterSection from '../components/Landing/FooterSection';

const Focosmode = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialView, setAuthInitialView] = useState('login');

    const openAuthModal = (view) => {
        setAuthInitialView(view);
        setIsAuthModalOpen(true);
    };
    
    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <div className="focosmode-page">
            {isAuthModalOpen && <AuthModal closeModal={closeAuthModal} initialView={authInitialView} />}

            <Navbar openAuthModal={openAuthModal} />
            <main>
                <HeroSection openAuthModal={openAuthModal} />
                <DemoStoreSection />
                <FeaturesSection />
                <TestimonialsSection />
                <PricingSection openAuthModal={openAuthModal} />
                <FAQSection />
            </main>
            <FooterSection openAuthModal={openAuthModal} />
        </div>
    );
};

export default Focosmode;
