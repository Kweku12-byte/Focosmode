// src/components/Landing/TestimonialsSection.jsx
import React, { useState } from 'react';
import './TestimonialsSection.css';
import { ChevronLeftIcon, ChevronRightIcon } from '../Icons';

const TestimonialsSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

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

    return (
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
    );
};

export default TestimonialsSection;
