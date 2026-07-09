// src/Pages/Dashboard/Staff.jsx
import React, { useState, useEffect } from 'react';
import './Staff.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query } from 'firebase/firestore';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const Staff = () => {
    const { currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (!currentUser) return;
        const staffRef = collection(db, 'businesses', currentUser.uid, 'staff');
        const unsub = onSnapshot(staffRef, (snap) => {
            setStaff(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, [currentUser]);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        const staffRef = collection(db, 'businesses', currentUser.uid, 'staff');
        await addDoc(staffRef, { name, pin, role: 'cashier', createdAt: new Date() });
        setName(''); setPin(''); setIsModalOpen(false);
    };

    const deleteStaff = async (id) => {
        await deleteDoc(doc(db, 'businesses', currentUser.uid, 'staff', id));
    };

    return (
        <div className="staff-container">
            <div className="staff-header">
                <h2>Staff Management</h2>
                <button className="add-staff-btn" onClick={() => setIsModalOpen(true)}><PlusIcon /> Add Staff</button>
            </div>
            <table className="staff-table">
                <thead><tr><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                    {staff.map(s => (
                        <tr key={s.id}><td>{s.name}</td><td>{s.role}</td><td><button onClick={() => deleteStaff(s.id)}><TrashIcon /></button></td></tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Staff</h3>
                        <form onSubmit={handleAddStaff}>
                            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input type="password" placeholder="4-Digit PIN" maxLength="4" value={pin} onChange={e => setPin(e.target.value)} required />
                            <button type="submit">Save Staff</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Staff;
