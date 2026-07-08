// src/components/Landing/FAQSection.jsx
import React, { useState } from 'react';
import './FAQSection.css';
import { ChevronDownIcon } from '../Icons';

const FAQItem = ({ faq, index, toggleFAQ }) => (
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

const FAQSection = () => {
    const [faqs, setFaqs] = useState([
        { question: "Is my business data safe and secure?", answer: "Absolutely. We use industry-standard encryption and secure cloud infrastructure to protect your data. Your business information is safe, backed up, and only accessible by you.", open: false },
        { question: "Can I use Focosmode on my mobile phone?", answer: "Yes! Focosmode is a web-based application, which means it's designed to work perfectly on any device with a web browser, including your smartphone, tablet, or computer. No downloads required.", open: false },
        { question: "What happens after my 30-day Pro trial ends?", answer: "Your account will switch to a 'view-only' mode. You can still log in and see all your data, but you won't be able to add new information (like products or sales). To continue using the full features, you can easily subscribe to either the Basic or Pro plan from your dashboard.", open: false },
        { question: "How do I receive payments from my online store?", answer: "On the Basic plan, your store works with manual payments like Mobile Money or cash on delivery. On the Pro plan, you can connect your own payment gateway accounts (like Paystack or Flutterwave) so that online payments go directly to you.", open: false },
        { question: "Do I need any technical skills to use Focosmode?", answer: "Not at all. We've designed Focosmode to be as easy and intuitive as possible. If you can use popular social media apps, you'll feel right at home with Focosmode.", open: false }
    ]);

    const toggleFAQ = (index) => {
        setFaqs(faqs.map((faq, i) => {
            if (i === index) faq.open = !faq.open;
            else faq.open = false;
            return faq;
        }));
    };

    return (
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
    );
};

export default FAQSection;
