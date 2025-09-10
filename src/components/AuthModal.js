import React, { useState, useEffect } from 'react';
import './AuthModal.css';
import { auth, db } from '../Services/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// --- SVG Icon Components ---
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.464,44,28.708,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AuthModal = ({ closeModal, initialView }) => {
    const [view, setView] = useState(initialView); // 'login', 'signup', 'reset', 'verify', 'reset_sent'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- Form State ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setView(initialView);
    }, [initialView]);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 30);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: Timestamp.fromDate(new Date()),
                plan: "pro_trial",
                trialEndDate: Timestamp.fromDate(trialEndDate)
            });
            
            setView('verify');

        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                setError("Please verify your email before logging in. Check your inbox.");
                setLoading(false);
                return;
            }
            closeModal();
            navigate('/dashboard');

        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            // Create a user profile only if it's their first time signing in
            if (!userDoc.exists()) {
                const trialEndDate = new Date();
                trialEndDate.setDate(trialEndDate.getDate() + 30);
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    createdAt: Timestamp.fromDate(new Date()),
                    plan: "pro_trial",
                    trialEndDate: Timestamp.fromDate(trialEndDate)
                });
            }
            
            closeModal();
            navigate('/dashboard');

        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setView('reset_sent');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const switchView = (newView) => {
        setError('');
        setView(newView);
    };

    const isLoginView = view === 'login';

    return (
        <div className="auth-modal-overlay" onClick={closeModal}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={closeModal}><XIcon /></button>
                
                {view === 'verify' ? (
                    <div className="auth-view">
                        <h3>Verify Your Email</h3>
                        <p className="auth-success-message">
                            We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder!) to complete your registration.
                        </p>
                    </div>
                ) : view === 'reset' ? (
                     <div className="auth-view">
                        <h3>Reset Your Password</h3>
                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                        <form onSubmit={handlePasswordReset}>
                            <div className="input-group">
                                <label htmlFor="reset-email">Email</label>
                                <input 
                                    type="email" 
                                    id="reset-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            {error && <p className="auth-error">{error}</p>}
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            Remember your password? <button onClick={() => switchView('login')}>Back to Login</button>
                        </p>
                    </div>
                ): view === 'reset_sent' ? (
                    <div className="auth-view">
                        <h3>Check Your Inbox</h3>
                        <p className="auth-success-message">
                            A password reset link has been sent to <strong>{email}</strong> if an account with that email exists.
                        </p>
                         <p className="auth-switch">
                            <button onClick={() => switchView('login')}>Back to Login</button>
                        </p>
                    </div>
                ) : (
                    <div className="auth-view">
                        <h3>{isLoginView ? 'Welcome Back' : 'Create Your Account'}</h3>
                        <p>{isLoginView ? 'Log in to continue to Focosmode.' : 'Start your 30-day free Pro trial.'}</p>
                        
                        <button className="google-signin-btn" onClick={handleGoogleSignIn} disabled={loading}>
                            <GoogleIcon />
                            <span>{isLoginView ? 'Log in with Google' : 'Sign up with Google'}</span>
                        </button>
                        
                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <form onSubmit={isLoginView ? handleLogin : handleSignup}>
                            {!isLoginView && (
                                <div className="input-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                            )}
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {!isLoginView && (
                                <div className="input-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                            )}

                            {isLoginView && (
                                <div className="forgot-password-container">
                                    <button type="button" className="forgot-password-btn" onClick={() => switchView('reset')}>
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            {error && <p className="auth-error">{error}</p>}

                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Loading...' : (isLoginView ? 'Log In' : 'Create Account')}
                            </button>
                        </form>
                        
                        <p className="auth-switch">
                            {isLoginView ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => switchView(isLoginView ? 'signup' : 'login')}>
                                {isLoginView ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;

