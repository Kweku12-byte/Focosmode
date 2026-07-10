// src/Pages/Dashboard/Expenses.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './Expenses.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';

// --- NEW: Import the Security Modal ---
import DeleteAuthModal from './DeleteAuthModal';

// --- Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const EXPENSE_CATEGORIES = ['Restock / Inventory', 'Utilities & Bills', 'Rent', 'Marketing', 'Salaries', 'Transport', 'Other'];
const currencies = { 'GHS': '₵', 'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€' };

const Expenses = ({ activeCashier }) => {
    const { currentUser } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [businessData, setBusinessData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    
    // --- NEW: State for secure deletion ---
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        
        const expensesRef = collection(db, 'businesses', currentUser.uid, 'expenses');
        const q = query(expensesRef, orderBy('date', 'desc'));

        const unsubExpenses = onSnapshot(q, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(expensesData);
            setLoading(false);
        });

        const unsubBusiness = onSnapshot(doc(db, 'businesses', currentUser.uid), (doc) => {
            if (doc.exists()) setBusinessData(doc.data());
        });

        return () => { unsubExpenses(); unsubBusiness(); };
    }, [currentUser]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || isNaN(amount) || amount <= 0) return setError("Please enter a valid amount.");

        try {
            const expensesRef = collection(db, 'businesses', currentUser.uid, 'expenses');
            await addDoc(expensesRef, {
                amount: parseFloat(amount),
                category,
                description,
                date: expenseDate,
                cashierName: activeCashier?.name || 'Owner', 
                createdAt: new Date().toISOString()
            });
            closeModal();
        } catch (err) {
            console.error("Error adding expense:", err);
            setError("Failed to save expense.");
        }
    };

    // --- NEW: Actual delete execution after PIN verification ---
    const executeDelete = async () => {
        if (!itemToDelete) return;
        try {
            await deleteDoc(doc(db, 'businesses', currentUser.uid, 'expenses', itemToDelete.id));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setItemToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setAmount('');
        setDescription('');
        setCategory(EXPENSE_CATEGORIES[0]);
        setError('');
    };

    const currencySymbol = currencies[businessData?.currency] || '₵';

    const filteredExpenses = expenses.filter(exp => 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.cashierName && exp.cashierName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [expenses]);

    return (
        <div className="expenses-container">
            <div className="expenses-header-section">
                <div className="expenses-title-row">
                    <h2>Expense Tracking</h2>
                    <button className="add-expense-btn" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon /> Add Expense
                    </button>
                </div>

                <div className="expenses-kpi-card">
                    <div className="kpi-icon-wrapper"><ReceiptIcon /></div>
                    <div className="kpi-details">
                        <p>Total Logged Expenses</p>
                        <h3>{currencySymbol}{totalExpenses.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="expenses-list-section">
                <div className="list-header">
                    <h3>Recent Expenses</h3>
                    <div className="search-wrapper">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search descriptions, category, or staff..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? <p className="loading-text">Loading expenses...</p> : filteredExpenses.length === 0 ? (
                    <div className="no-expenses-view">
                        <p>No expenses found.</p>
                    </div>
                ) : (
                    <div className="expenses-table-container">
                        <table className="expenses-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Logged By</th>
                                    <th className="align-right">Amount</th>
                                    <th className="align-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                                        <td><span className="category-badge">{exp.category}</span></td>
                                        <td className="description-cell">{exp.description || '-'}</td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: exp.cashierName === 'Owner' ? '#d97706' : '#1d4ed8' }}>
                                                {exp.cashierName || 'Owner'}
                                            </span>
                                        </td>
                                        <td className="amount-cell align-right">{currencySymbol}{exp.amount.toFixed(2)}</td>
                                        <td className="align-center">
                                            {/* --- NEW: Trigger Modal instead of inline confirm --- */}
                                            <button className="action-btn delete" onClick={() => setItemToDelete(exp)} title="Delete Expense">
                                                <TrashIcon/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- NEW: Standalone Security Modal --- */}
            <DeleteAuthModal 
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                itemName={itemToDelete?.description || itemToDelete?.category || 'Expense'}
                onSuccess={executeDelete}
            />

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal-btn" onClick={closeModal}><XIcon /></button>
                        <h3>Log New Expense</h3>
                        <form onSubmit={handleAddExpense}>
                            <div className="form-group">
                                <label>Amount</label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-prefix">{currencySymbol}</span>
                                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description / Notes</label>
                                <textarea 
                                    rows="3" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    placeholder="e.g. Bought printer paper"
                                ></textarea>
                            </div>
                            {error && <p className="modal-error">{error}</p>}
                            <button type="submit" className="modal-submit-btn">Save Expense</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
