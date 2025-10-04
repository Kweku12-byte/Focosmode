import React, { useState, useEffect, useRef } from 'react';
import './focosmode.css';
// FIX: Corrected the import path for AuthModal based on your project structure.
import AuthModal from '../components/AuthModal';

// --- SVG Icon Components ---
const CheckIcon = () => <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const MenuIcon = () => <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const XIcon = () => <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SearchIcon = () => <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CartIcon = () => <svg className="cart-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChevronDownIcon = ({ isOpen }) => <svg className={`chevron-down-icon ${isOpen ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

// Social Icons
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const TiktokIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H12a4 4 0 0 0-4 4v12a4 4 0 0 0 8 0V4Z"></path><path d="M12 4v4a4 4 0 0 0 4 4h4"></path></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const XTwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>;


// --- FAQ Item Component ---
const FAQItem = ({ faq, index, toggleFAQ }) => {
    return (
        <div className={`faq-item ${faq.open ? 'open' : ''}`} onClick={() => toggleFAQ(index)}>
            <div className="faq-question">
                <h4>{faq.question}</h4>
                <ChevronDownIcon isOpen={faq.open} />
            </div>
            <div className="faq-answer">
                <p>{faq.answer}</p>
            </div>
        </div>
    );
};


const Focosmode = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const menuRef = useRef(null);
    const currencyRef = useRef(null);

    // --- NEW: CURRENCY DROPDOWN STATE ---
    const [isCurrencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
    const currencies = [
        { code: 'GHS', flag: '🇬🇭' },
        { code: 'NGN', flag: '🇳🇬' },
        { code: 'USD', flag: '🇺🇸' },
        { code: 'GBP', flag: '🇬🇧' },
    ];
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

    // --- MODAL STATE AND HANDLERS ---
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialView, setAuthInitialView] = useState('login');

    const openAuthModal = (view) => {
        setAuthInitialView(view);
        setIsAuthModalOpen(true);
        setIsMenuOpen(false); // Close mobile menu if open
    };
    
    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };
    // --- END MODAL STATE ---

    const [faqs, setFaqs] = useState([
        { question: "Is my business data safe and secure?", answer: "Absolutely. We use industry-standard encryption and secure cloud infrastructure to protect your data. Your business information is safe, backed up, and only accessible by you.", open: false },
        { question: "Can I use Focosmode on my mobile phone?", answer: "Yes! Focosmode is a web-based application, which means it's designed to work perfectly on any device with a web browser, including your smartphone, tablet, or computer. No downloads required.", open: false },
        { question: "What happens after my 30-day Pro trial ends?", answer: "Your account will switch to a 'view-only' mode. You can still log in and see all your data, but you won't be able to add new information (like products or sales). To continue using the full features, you can easily subscribe to either the Basic or Pro plan from your dashboard.", open: false },
        { question: "How do I receive payments from my online store?", answer: "On the Basic plan, your store works with manual payments like Mobile Money or cash on delivery. On the Pro plan, you can connect your own payment gateway accounts (like Paystack or Flutterwave) so that online payments go directly to you.", open: false },
        { question: "Do I need any technical skills to use Focosmode?", answer: "Not at all. We've designed Focosmode to be as easy and intuitive as possible. If you can use popular social media apps, you'll feel right at home with Focosmode.", open: false }
    ]);

    const toggleFAQ = (index) => {
        setFaqs(faqs.map((faq, i) => {
            if (i === index) {
                faq.open = !faq.open;
            } else {
                faq.open = false; // Optional: close others when one opens
            }
            return faq;
        }));
    };

    const testimonials = [
        { quote: "Focosmode has been a game-changer for my shop. I can finally see my daily profit without doing calculations in a notebook. The online store brought me new customers from Instagram!", name: "Afi Mensah", title: "Fashion Boutique Owner, Accra", avatar: "https://i.pravatar.cc/100?u=afi" },
        { quote: "Setting up was surprisingly easy. I had my products online in 15 minutes. The WhatsApp order feature is perfect for how I do business.", name: "Kwame Asante", title: "Electronics Seller, Kumasi", avatar: "https://i.pravatar.cc/100?u=kwame" },
        { quote: "The analytics are powerful. I now know which products are my bestsellers and when to re-stock. It's like having a business consultant in my pocket.", name: "Emily Carter", title: "Online Coach, London", avatar: "https://i.pravatar.cc/100?u=emily" },
        { quote: "As a digital artist, selling my prints has never been easier. The platform is intuitive and my customers love the simple checkout process.", name: "Carlos Silva", title: "Digital Artist, São Paulo", avatar: "https://i.pravatar.cc/100?u=carlos" },
        { quote: "Managing event tickets was a nightmare before Focosmode. Now, it's all automated. I've saved countless hours that I can now put back into my events.", name: "Fatima Aliyu", title: "Event Planner, Lagos", avatar: "https://i.pravatar.cc/100?u=fatima" },
        { quote: "The customer support is top-notch. They are always responsive and helpful. It's clear they care about the success of their users.", name: "Ken Tanaka", title: "Coffee Shop Owner, Tokyo", avatar: "https://i.pravatar.cc/100?u=ken" }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close mobile menu
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Close currency dropdown
            if (currencyRef.current && !currencyRef.current.contains(event.target)) {
                setCurrencyDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef, currencyRef]);

    return (
        <div className="focosmode-page">
            {isAuthModalOpen && <AuthModal closeModal={closeAuthModal} initialView={authInitialView} />}

            {/* --- Header --- */}
            <header className="header">
                <div className="container header-container">
                    {/* --- UPDATE: Logo Added --- */}
                    <a href="/" className="logo">
                        <img src="https://placehold.co/140x40/f59e0b/111827?text=Focosmode" alt="Focosmode Logo" />
                    </a>
                    <div ref={menuRef}>
                        <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                            <a href="#how-it-works">How It Works</a>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <button onClick={() => openAuthModal('login')} className="login-btn">Login</button>
                            <button onClick={() => openAuthModal('signup')} className="cta-button primary nav-cta">Get Started</button>
                        </nav>
                    </div>
                </div>
            </header>

            <main>
                {/* --- Hero Section --- */}
                <section className="hero-section">
                    <div className="container">
                        <h2>The All-in-One Tool for Your Business</h2>
                        <p>From sales and inventory to an instant online store, Focosmode brings everything together. Focus on growing your business, we'll handle the rest.</p>
                        <button onClick={() => openAuthModal('signup')} className="cta-button primary">Start Your Free Pro Trial</button>
                    </div>
                </section>

                {/* --- Social Proof --- */}
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


                {/* --- Demo Store Section --- */}
                <section className="demo-store-section">
                    <div className="container">
                        <div className="demo-store-window">
                            <div className="browser-header">
                                <div className="browser-dots">
                                    <span className="window-dot red"></span>
                                    <span className="window-dot yellow"></span>
                                    <span className="window-dot green"></span>
                                </div>
                                <div className="browser-url-bar">
                                    https://focosmode.com/demo
                                </div>
                            </div>
                            <div className="store-ui">
                                <div className="store-sidebar">
                                    <div className="store-brand">
                                        <img src="https://placehold.co/80x80/1f2937/ffffff?text=S" alt="Store Logo" className="demo-store-logo" />
                                        <h3>Demo Store</h3>
                                        {/* --- UPDATE: Social Icons Added --- */}
                                        <div className="demo-store-socials">
                                            <a href="#"><InstagramIcon /></a>
                                            <a href="#"><TiktokIcon /></a>
                                            <a href="#"><FacebookIcon /></a>
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
                                            {/* --- UPDATE: Currency Dropdown --- */}
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

                {/* --- How It Works Section --- */}
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

                {/* --- Dashboard Preview Section --- */}
                <section className="dashboard-preview-section">
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

                {/* --- Payment Methods Section --- */}
                <section className="payment-gateways-section">
                    <div className="container">
                        <div className="section-title">
                            <h3>Accept Payments From Anywhere</h3>
                            <p>We support local and international payment methods to ensure you never miss a sale.</p>
                        </div>
                        <div className="gateways-grid">
                            <img src="https://logo.clearbit.com/mtn.com" alt="MTN Mobile Money" />
                            <img src="https://logo.clearbit.com/vodafone.com" alt="Telecel Cash" />
                            <img src="https://logo.clearbit.com/airtel.in" alt="AirtelTigo Money" />
                            <img src="https://logo.clearbit.com/safaricom.co.ke" alt="M-Pesa" />
                            <img src="https://logo.clearbit.com/visa.com" alt="Visa" />
                            <img src="https://logo.clearbit.com/mastercard.com" alt="Mastercard" />
                        </div>
                    </div>
                </section>

                {/* --- Integrations Section --- */}
                <section className="integrations-section">
                    <div className="container">
                        <div className="section-title">
                            <h3>Integrate With Your Favorite Tools</h3>
                            <p>Connect Focosmode to the tools you already use to automate your workflow.</p>
                        </div>
                        <div className="integrations-grid">
                            <div className="integration-card">
                                <img src="https://logo.clearbit.com/mailchimp.com" alt="Mailchimp" />
                            </div>
                            <div className="integration-card">
                                <img src="https://logo.clearbit.com/convertkit.com" alt="ConvertKit" />
                            </div>
                            <div className="integration-card">
                                <img src="https://logo.clearbit.com/zapier.com" alt="Zapier" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Testimonials Section --- */}
                <section className="testimonials-section">
                    <div className="container">
                        <div className="section-title">
                            <h3>Don't just take our word for it</h3>
                            <p>See what our users are saying about Focosmode.</p>
                        </div>
                        <div className="testimonial-slider-container">
                            <div className="testimonial-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {testimonials.map((t, index) => (
                                    <div className="testimonial-slide" key={index}>
                                        <div className="testimonial-card">
                                            <p className="quote">"{t.quote}"</p>
                                            <div className="author">
                                                <img src={t.avatar} alt={t.name} />
                                                <div>
                                                    <p className="name">{t.name}</p>
                                                    <p className="title">{t.title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="slider-btn prev" onClick={prevSlide}><ChevronLeftIcon/></button>
                            <button className="slider-btn next" onClick={nextSlide}><ChevronRightIcon/></button>
                        </div>
                    </div>
                </section>

                {/* --- Pricing Section --- */}
                <section id="pricing" className="pricing-section">
                    <div className="container">
                        <div className="section-title">
                            <h3>Simple, Transparent Pricing</h3>
                            <p>Choose the plan that's right for your business. Start with a free 30-day trial of our Pro plan.</p>
                        </div>
                        <div className="pricing-grid">
                            {/* --- Basic Plan Tier --- */}
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

                            {/* --- Pro Plan Tier (Featured) --- */}
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
                
                {/* --- NEW: FAQ Section --- */}
                <section className="faq-section">
                    <div className="container">
                        <div className="section-title">
                            <h3>Frequently Asked Questions</h3>
                            <p>Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
                        </div>
                        <div className="faq-container">
                            {faqs.map((faq, index) => (
                                <FAQItem faq={faq} index={index} key={index} toggleFAQ={toggleFAQ} />
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* --- Final CTA Section --- */}
                <section className="final-cta-section">
                    <div className="container">
                        <h2>Ready to take control of your business?</h2>
                        <p>Join hundreds of other small business owners and start growing with Focosmode today.</p>
                        <button onClick={() => openAuthModal('signup')} className="cta-button primary">Start Your Free Pro Trial</button>
                    </div>
                </section>
            </main>

            {/* --- Footer --- */}
            <footer className="footer">
                <div className="container footer-container">
                    <div className="footer-col">
                        <h4 className="footer-logo">Focosmode</h4>
                        <p>&copy; {new Date().getFullYear()}. All rights reserved.</p>
                        <a href="mailto:info@focosmode.com" className="footer-email">info@focosmode.com</a>
                    </div>
                    <div className="footer-col">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#">Affiliates</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">Careers</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Follow Us</h4>
                        <div className="social-icons">
                                <a href="#"><InstagramIcon /></a>
                                <a href="#"><TiktokIcon /></a>
                                <a href="#"><FacebookIcon /></a>
                                <a href="#"><XTwitterIcon /></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- NEW: Floating Support Button --- */}
            <button className="support-button">
                <ChatIcon />
            </button>
        </div>
    );
};

export default Focosmode;
