// src/Pages/Dashboard/Staff.jsx
import React, { useState, useEffect } from 'react';
import './Staff.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const Staff = () => {
    const { currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [businessData, setBusinessData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, staffId: null, enteredPin: '', error: '' });
    // --- UPDATE: Add totalExpenses to state ---
    const [statsModal, setStatsModal] = useState({ isOpen: false, staffData: null, salesCount: 0, totalRevenue: 0, totalExpenses: 0 });

    useEffect(() => {
        if (!currentUser) return;
        
        const staffRef = collection(db, 'businesses', currentUser.uid, 'staff');
        const unsubStaff = onSnapshot(staffRef, (snap) => {
            setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const businessRef = doc(db, 'businesses', currentUser.uid);
        const unsubBusiness = onSnapshot(businessRef, (doc) => {
            if (doc.exists()) setBusinessData(doc.data());
        });

        return () => { unsubStaff(); unsubBusiness(); };
    }, [currentUser]);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        const staffRef = collection(db, 'businesses', currentUser.uid, 'staff');
        await addDoc(staffRef, { name, pin, role: 'cashier', createdAt: new Date() });
        setName(''); setPin(''); setIsModalOpen(false);
    };

    const handleSecureDelete = async (e) => {
        e.preventDefault();
        const ownerPin = businessData?.ownerPin || '0000';
        
        if (deleteModal.enteredPin === ownerPin) {
            await deleteDoc(doc(db, 'businesses', currentUser.uid, 'staff', deleteModal.staffId));
            setDeleteModal({ isOpen: false, staffId: null, enteredPin: '', error: '' });
        } else {
            setDeleteModal(prev => ({ ...prev, error: 'Incorrect Owner PIN', enteredPin: '' }));
        }
    };

    const viewStaffStats = (staffMember) => {
        setStatsModal({ isOpen: true, staffData: staffMember, salesCount: 0, totalRevenue: 0, totalExpenses: 0 });
        
        // 1. Fetch Sales for Cashier
        const salesRef = collection(db, 'businesses', currentUser.uid, 'sales');
        const qSales = query(salesRef, where("cashierName", "==", staffMember.name));
        onSnapshot(qSales, (snapshot) => {
            const sales = snapshot.docs.map(doc => doc.data());
            const totalRev = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
            setStatsModal(prev => ({ ...prev, salesCount: sales.length, totalRevenue: totalRev }));
        });

        // 2. NEW: Fetch Expenses for Cashier
        const expensesRef = collection(db, 'businesses', currentUser.uid, 'expenses');
        const qExp = query(expensesRef, where("cashierName", "==", staffMember.name));
        onSnapshot(qExp, (snapshot) => {
            const expenses = snapshot.docs.map(doc => doc.data());
            const totalExp = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            setStatsModal(prev => ({ ...prev, totalExpenses: totalExp }));
        });
    };

    return (
        <div className="staff-container">
            <div className="staff-header">
                <h2>Staff Management</h2>
                <button className="add-staff-btn" onClick={() => setIsModalOpen(true)}><PlusIcon /> Add Staff</button>
            </div>
            
            <table className="staff-table">
                <thead><tr><th>Name</th><th>Role</th><th>Performance</th><th>Actions</th></tr></thead>
                <tbody>
                    {staff.map(s => (
                        <tr key={s.id}>
                            <td><strong>{s.name}</strong></td>
                            <td><span className="role-badge cashier">{s.role}</span></td>
                            <td>
                                <button className="action-btn view-stats" onClick={() => viewStaffStats(s)} style={{color: '#3b82f6', background: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                                    <ChartIcon style={{width: '16px', height: '16px'}} /> Stats
                                </button>
                            </td>
                            <td>
                                <button className="action-btn delete" onClick={() => setDeleteModal({ isOpen: true, staffId: s.id, enteredPin: '', error: '' })} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}>
                                    <TrashIcon style={{width: '20px', height: '20px'}}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ADD STAFF MODAL */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '350px'}}>
                        <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}><XIcon /></button>
                        <h3>Add New Staff</h3>
                        <form onSubmit={handleAddStaff}>
                            <div className="form-group"><label>Cashier Name</label><input placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required /></div>
                            <div className="form-group"><label>4-Digit Login PIN</label><input type="password" placeholder="e.g. 1234" maxLength="4" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} required /></div>
                            <button type="submit" className="modal-submit-btn" style={{background: '#1f2937', color: 'white', width: '100%', padding: '0.75rem', borderRadius: '0.5rem'}}>Save Staff</button>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE PROTECTION MODAL */}
            {deleteModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '350px', textAlign: 'center'}}>
                        <h3 style={{color: '#ef4444'}}>Owner Authorization Required</h3>
                        <p style={{fontSize: '0.9rem', color: '#6b7280'}}>Enter the Owner POS PIN to delete this staff member.</p>
                        <form onSubmit={handleSecureDelete}>
                            <input 
                                type="password" maxLength="4" 
                                placeholder="Owner PIN" 
                                value={deleteModal.enteredPin} 
                                onChange={e => setDeleteModal(prev => ({...prev, enteredPin: e.target.value.replace(/\D/g, '')}))} 
                                required 
                                style={{width: '100%', padding: '0.75rem', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem'}}
                            />
                            {deleteModal.error && <p style={{color: '#ef4444', fontSize: '0.85rem', margin: '-0.5rem 0 1rem 0'}}>{deleteModal.error}</p>}
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <button type="button" onClick={() => setDeleteModal({ isOpen: false, staffId: null, enteredPin: '', error: '' })} style={{flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '0.5rem'}}>Cancel</button>
                                <button type="submit" style={{flex: 1, padding: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem'}}>Delete</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STAFF STATS MODAL */}
            {statsModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '500px'}}>
                        <button className="close-modal-btn" onClick={() => setStatsModal({isOpen: false, staffData: null, salesCount: 0, totalRevenue: 0, totalExpenses: 0})}><XIcon /></button>
                        <h3>Performance: {statsModal.staffData?.name}</h3>
                        
                        {/* --- UPDATE: Grid is now 3 columns to include Expenses --- */}
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem'}}>
                            
                            <div style={{background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #e5e7eb'}}>
                                <p style={{margin: '0 0 0.25rem 0', color: '#6b7280', fontSize: '0.85rem'}}>Total Sales</p>
                                <h2 style={{margin: 0, color: '#1f2937', fontSize: '1.25rem'}}>{statsModal.salesCount}</h2>
                            </div>
                            
                            <div style={{background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #bbf7d0'}}>
                                <p style={{margin: '0 0 0.25rem 0', color: '#166534', fontSize: '0.85rem'}}>Revenue</p>
                                <h2 style={{margin: 0, color: '#15803d', fontSize: '1.25rem'}}>₵{statsModal.totalRevenue.toFixed(2)}</h2>
                            </div>

                            <div style={{background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid #fecaca'}}>
                                <p style={{margin: '0 0 0.25rem 0', color: '#991b1b', fontSize: '0.85rem'}}>Expenses</p>
                                <h2 style={{margin: 0, color: '#b91c1c', fontSize: '1.25rem'}}>₵{statsModal.totalExpenses.toFixed(2)}</h2>
                            </div>
                            
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
