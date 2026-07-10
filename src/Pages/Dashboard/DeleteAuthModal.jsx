// src/Pages/Dashboard/DeleteAuthModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

const DeleteAuthModal = ({ isOpen, onClose, onSuccess, itemName }) => {
    const { currentUser } = useAuth();
    const [enteredPin, setEnteredPin] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEnteredPin('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        setError('');

        try {
            // Fetch the actual owner PIN directly from the database
            const businessRef = doc(db, 'businesses', currentUser.uid);
            const businessSnap = await getDoc(businessRef);
            
            if (businessSnap.exists()) {
                const ownerPin = businessSnap.data().ownerPin || '0000';
                
                if (enteredPin === ownerPin) {
                    onSuccess(); // Trigger the actual delete function from the parent
                    onClose();   // Close the modal
                } else {
                    setError('Incorrect Owner PIN');
                    setEnteredPin('');
                }
            } else {
                setError('Could not verify business data.');
            }
        } catch (err) {
            console.error(err);
            setError('Verification failed. Try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="modal-overlay" style={{zIndex: 9999}}>
            <div className="modal-content" style={{width: '350px', textAlign: 'center'}}>
                <button className="close-modal-btn" onClick={onClose}><XIcon /></button>
                
                <div style={{color: '#ef4444', marginBottom: '1rem', display: 'flex', justifyContent: 'center'}}>
                    <ShieldIcon style={{width: '48px', height: '48px'}} />
                </div>
                
                <h3 style={{color: '#ef4444', marginTop: 0}}>Owner Authorization</h3>
                <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                    Enter Owner PIN to delete <strong>{itemName || 'this item'}</strong>.
                </p>
                
                <form onSubmit={handleVerify}>
                    <input 
                        type="password" 
                        maxLength="4" 
                        placeholder="PIN" 
                        value={enteredPin} 
                        onChange={e => setEnteredPin(e.target.value.replace(/\D/g, ''))} 
                        required 
                        autoFocus
                        style={{width: '100%', padding: '0.75rem', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem'}}
                    />
                    {error && <p style={{color: '#ef4444', fontSize: '0.85rem', margin: '-0.5rem 0 1rem 0'}}>{error}</p>}
                    
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button type="button" onClick={onClose} style={{flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isVerifying} style={{flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold'}}>
                            {isVerifying ? 'Checking...' : 'Delete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteAuthModal;
