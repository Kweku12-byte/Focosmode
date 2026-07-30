// src/Pages/Dashboard/EcommerceSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import './EcommerceSettings.css';

const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const EcommerceSettings = () => {
    const { currentUser } = useAuth();
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Form States
    const [storeDescription, setStoreDescription] = useState('');
    const [brandColor, setBrandColor] = useState('#111827');
    const [baseCurrency, setBaseCurrency] = useState('GHS');
    
    // Social Media States
    const [socials, setSocials] = useState({
        instagram: '',
        facebook: '',
        tiktok: '',
        telegram: ''
    });

    useEffect(() => {
        if (!currentUser) return;
        const docRef = doc(db, 'businesses', currentUser.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBusinessData(data);
                setStoreDescription(data.storeDescription || '');
                setBrandColor(data.brandColor || '#111827');
                setBaseCurrency(data.currency || 'GHS');
                if (data.socials) setSocials(data.socials);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleSocialChange = (e) => {
        setSocials({ ...socials, [e.target.name]: e.target.value });
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, 'businesses', currentUser.uid);
            await updateDoc(docRef, {
                storeDescription,
                brandColor,
                currency: baseCurrency,
                socials
            });
            alert("Storefront settings updated successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const storeUrl = `${window.location.origin}/store/${currentUser?.uid}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="ecom-settings-container">
            <div className="ecom-settings-header">
                <h2>E-commerce Settings</h2>
                <p>Customize how your store appears to your online customers.</p>
            </div>

            {/* Store Link Card */}
            <div className="settings-card highlight-card">
                <div className="card-header-flex">
                    <h3><LinkIcon /> Your Public Store Link</h3>
                </div>
                <p className="setting-description">Share this link on your social media or website to direct customers to your Focosmode store.</p>
                
                <div className="store-link-box">
                    <input type="text" readOnly value={storeUrl} className="store-link-input" />
                    <button className="copy-link-btn" onClick={handleCopyLink}>
                        <CopyIcon /> {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                    <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="visit-store-btn">
                        <ExternalLinkIcon /> Visit
                    </a>
                </div>
            </div>

            {/* Customization Form */}
            <form className="settings-card" onSubmit={handleSaveSettings}>
                <h3>Storefront Customization</h3>
                
                <div className="form-group">
                    <label>Store Description</label>
                    <p className="setting-sub-label">A short tagline that appears beneath your store name.</p>
                    <textarea 
                        value={storeDescription} 
                        onChange={(e) => setStoreDescription(e.target.value)}
                        placeholder="e.g. Fast, secure, and reliable checkout powered by Focosmode."
                        rows="3"
                    ></textarea>
                </div>

                <div className="form-group-row">
                    <div className="form-group">
                        <label>Brand Primary Color</label>
                        <p className="setting-sub-label">Used for your 'Add to Cart' and 'Checkout' buttons.</p>
                        <div className="color-picker-wrapper">
                            <input 
                                type="color" 
                                value={brandColor} 
                                onChange={(e) => setBrandColor(e.target.value)} 
                                className="color-input"
                            />
                            <span className="color-hex">{brandColor}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Base Currency</label>
                        <p className="setting-sub-label">Your store's default trading currency.</p>
                        <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
                            {Object.keys(currencies).map(code => (
                                <option key={code} value={code}>{code} ({currencies[code]})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <hr style={{borderTop: '1px solid #e5e7eb', margin: '2rem 0'}} />
                
                <h3>Social Media Links</h3>
                <p className="setting-sub-label" style={{marginBottom: '1.5rem'}}>These will appear in the footer of your public store.</p>
                
                <div className="form-group-row">
                    <div className="form-group">
                        <label>Instagram URL</label>
                        <input type="url" name="instagram" value={socials.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/yourshop" />
                    </div>
                    <div className="form-group">
                        <label>TikTok URL</label>
                        <input type="url" name="tiktok" value={socials.tiktok} onChange={handleSocialChange} placeholder="https://tiktok.com/@yourshop" />
                    </div>
                </div>
                <div className="form-group-row">
                    <div className="form-group">
                        <label>Facebook URL</label>
                        <input type="url" name="facebook" value={socials.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/yourshop" />
                    </div>
                    <div className="form-group">
                        <label>Telegram URL</label>
                        <input type="url" name="telegram" value={socials.telegram} onChange={handleSocialChange} placeholder="https://t.me/yourshop" />
                    </div>
                </div>

                <div className="form-group coming-soon-box" style={{marginTop: '2rem'}}>
                    <label style={{color: '#6b7280'}}>Hero Banner Image (Coming Soon)</label>
                    <p className="setting-sub-label">We are preparing the secure image vault for your high-res banners.</p>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="save-settings-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EcommerceSettings;
