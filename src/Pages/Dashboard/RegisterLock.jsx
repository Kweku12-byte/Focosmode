// src/Pages/Dashboard/RegisterLock.jsx
import React, { useState, useEffect } from 'react';
import './RegisterLock.css';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../Services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth'; // --- NEW: Auth import for verification ---

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>;

const RegisterLock = ({ businessData, onUnlock }) => {
    const { currentUser } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pinEntry, setPinEntry] = useState('');
    const [error, setError] = useState('');

    // --- NEW: Recovery State ---
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryPassword, setRecoveryPassword] = useState('');
    const [revealedPin, setRevealedPin] = useState('');
    const [recoveryError, setRecoveryError] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const staffRef = collection(db, 'businesses', currentUser.uid, 'staff');
        const unsub = onSnapshot(staffRef, (snapshot) => {
            setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [currentUser]);

    const handleKeypadClick = (num) => {
        setError('');
        if (pinEntry.length < 4) {
            const newPin = pinEntry + num;
            setPinEntry(newPin);
            if (newPin.length === 4) validatePin(newPin);
        }
    };

    const handleDeleteClick = () => {
        setPinEntry(pinEntry.slice(0, -1));
        setError('');
    };

    const validatePin = (enteredPin) => {
        if (selectedUser.role === 'owner') {
            // Check against dynamic ownerPin from settings
            const correctPin = businessData?.ownerPin || '0000';
            if (enteredPin === correctPin) {
                onUnlock({ name: businessData?.ownerName, role: 'owner' });
            } else {
                handleFailedAttempt();
            }
        } else {
            if (selectedUser.pin === enteredPin) {
                onUnlock(selectedUser);
            } else {
                handleFailedAttempt();
            }
        }
    };

    const handleFailedAttempt = () => {
        setError('Incorrect PIN');
        setTimeout(() => setPinEntry(''), 500);
    };

    const resetSelection = () => {
        setSelectedUser(null);
        setPinEntry('');
        setError('');
        setShowRecovery(false);
        setRevealedPin('');
    };

    // --- NEW: Recovery verification ---
    const handleRecoverySubmit = async (e) => {
        e.preventDefault();
        setRecoveryError('');
        try {
            // Verify identity using main Firebase account password
            await signInWithEmailAndPassword(auth, currentUser.email, recoveryPassword);
            setRevealedPin(businessData?.ownerPin || '0000');
        } catch (err) {
            setRecoveryError('Incorrect account password.');
        }
    };

    return (
        <div className="register-lock-overlay">
            <div className="register-lock-card">
                
                {!selectedUser ? (
                    <div className="user-selection-view">
                        <div className="lock-header">
                            <LockIcon />
                            <h2>Register Locked</h2>
                            <p>Select your profile to unlock the POS.</p>
                        </div>
                        <div className="staff-grid">
                            <button className="staff-btn owner-btn" onClick={() => setSelectedUser({ name: businessData?.ownerName || 'Owner', role: 'owner' })}>
                                <div className="avatar owner-avatar">{businessData?.ownerName?.charAt(0) || 'O'}</div>
                                <span>{businessData?.ownerName || 'Owner'}</span>
                                <span className="role-badge">Owner</span>
                            </button>
                            {staffList.map(staff => (
                                <button key={staff.id} className="staff-btn" onClick={() => setSelectedUser(staff)}>
                                    <div className="avatar">{staff.name.charAt(0)}</div>
                                    <span>{staff.name}</span>
                                    <span className="role-badge cashier">Cashier</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : showRecovery ? (
                    // --- NEW: Recovery UI ---
                    <div className="recovery-view" style={{textAlign: 'center', marginTop: '2rem'}}>
                        <button className="back-btn" onClick={() => {setShowRecovery(false); setRevealedPin(''); setRecoveryPassword('');}}>
                            <BackIcon /> Back
                        </button>
                        <h3 style={{marginBottom: '0.5rem'}}>Recover PIN</h3>
                        <p style={{color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem'}}>Enter your main Focosmode account password to verify your identity.</p>
                        
                        {!revealedPin ? (
                            <form onSubmit={handleRecoverySubmit}>
                                <input 
                                    type="password" 
                                    placeholder="Account Password" 
                                    value={recoveryPassword}
                                    onChange={(e) => setRecoveryPassword(e.target.value)}
                                    style={{width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', marginBottom: '1rem'}}
                                    required
                                />
                                {recoveryError && <p style={{color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem'}}>{recoveryError}</p>}
                                <button type="submit" style={{width: '100%', padding: '0.75rem', background: '#1f2937', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer'}}>
                                    Reveal PIN
                                </button>
                            </form>
                        ) : (
                            <div style={{background: '#f0fdf4', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0'}}>
                                <p style={{color: '#166534', margin: '0 0 0.5rem 0', fontWeight: 'bold'}}>Verification Successful</p>
                                <h1 style={{fontSize: '3rem', margin: '0', color: '#15803d', letterSpacing: '0.5rem'}}>{revealedPin}</h1>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- PIN ENTRY VIEW ---
                    <div className="pin-entry-view">
                        <button className="back-btn" onClick={resetSelection}>
                            <BackIcon /> Back
                        </button>
                        
                        <div className="active-user-display">
                            <div className={`avatar ${selectedUser.role === 'owner' ? 'owner-avatar' : ''}`}>
                                {selectedUser.name.charAt(0)}
                            </div>
                            <h3>{selectedUser.name}</h3>
                            <p>Enter your 4-digit PIN</p>
                        </div>

                        <div className={`pin-indicators ${error ? 'shake error' : ''}`}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`pin-dot ${i < pinEntry.length ? 'filled' : ''}`}></div>
                            ))}
                        </div>
                        {error && <p className="pin-error-text">{error}</p>}

                        <div className="numpad-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button key={num} className="numpad-btn" onClick={() => handleKeypadClick(num.toString())}>{num}</button>
                            ))}
                            <button className="numpad-btn empty" disabled></button>
                            <button className="numpad-btn" onClick={() => handleKeypadClick('0')}>0</button>
                            <button className="numpad-btn delete" onClick={handleDeleteClick}><DeleteIcon /></button>
                        </div>

                        {/* --- NEW: Forgot PIN Button for Owner --- */}
                        {selectedUser.role === 'owner' && (
                            <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
                                <button 
                                    onClick={() => setShowRecovery(true)}
                                    style={{background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}
                                >
                                    Forgot PIN?
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterLock;
