import React, { useState, useEffect, useRef } from 'react';
import './Customers.css';
// FIX: Corrected import paths to go up one directory
import { useAuth } from '../../context/AuthContext';
import { db } from '../../Services/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// --- Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;


const Customers = () => {
    const { currentUser } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- State for Add/Edit Modal ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCustomerId, setCurrentCustomerId] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    
    // --- State for Delete Confirmation ---
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); 


    // --- Fetch Customers in Real-time ---
    useEffect(() => {
        if (!currentUser) return;
        const customersCollectionRef = collection(db, 'businesses', currentUser.uid, 'customers');
        const unsubscribe = onSnapshot(customersCollectionRef, (snapshot) => {
            const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomers(customersData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching customers:", err);
            setError('Failed to load customers.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // --- Form Submission (Handles both Add and Edit) ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!currentUser) return setError("You are not logged in.");

        const customerData = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
        };

        try {
            if (isEditMode) {
                const customerDocRef = doc(db, 'businesses', currentUser.uid, 'customers', currentCustomerId);
                await updateDoc(customerDocRef, customerData);
            } else {
                customerData.createdAt = new Date();
                const customersCollectionRef = collection(db, 'businesses', currentUser.uid, 'customers');
                await addDoc(customersCollectionRef, customerData);
            }
            closeModalAndResetForm();
        } catch (err) {
            console.error("Firestore error:", err);
            setError("Failed to save customer. Please try again.");
        }
    };
    
    // --- Handle Delete Customer ---
    const handleDeleteCustomer = async (customerId) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'businesses', currentUser.uid, 'customers', customerId));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setShowDeleteConfirm(null); 
        }
    };

    // --- Modal Control Functions ---
    const openAddModal = () => {
        setIsEditMode(false);
        resetFormFields();
        setIsModalOpen(true);
    };

    const openEditModal = (customer) => {
        setIsEditMode(true);
        setCurrentCustomerId(customer.id);
        setCustomerName(customer.name);
        setCustomerEmail(customer.email || '');
        setCustomerPhone(customer.phone || '');
        setIsModalOpen(true);
    };

    const resetFormFields = () => {
        setCustomerName('');
        setCustomerEmail('');
        setCustomerPhone('');
    };
    
    const closeModalAndResetForm = () => {
        setIsModalOpen(false);
        resetFormFields();
        setError('');
    };

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
    );

    return (
        <div className="customers-container">
            <div className="customers-header">
                <h2>Your Customers</h2>
                <div className="header-actions">
                     <div className="search-wrapper">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="add-customer-btn" onClick={openAddModal}>
                        <PlusIcon />
                        <span>Add New Customer</span>
                    </button>
                </div>
            </div>
            
            {loading ? <p>Loading customers...</p> : filteredCustomers.length === 0 ? (
                <div className="no-customers-view">
                    <h3>{searchTerm ? 'No customers match your search.' : 'You haven\'t added any customers yet.'}</h3>
                    <p>{!searchTerm && 'Click "Add New Customer" to get started.'}</p>
                </div>
            ) : (
                <div className="customers-table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Phone Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.email || 'N/A'}</td>
                                    <td>{customer.phone || 'N/A'}</td>
                                    <td>
                                       {showDeleteConfirm === customer.id ? (
                                           <div className="delete-confirm">
                                               <span>Sure?</span>
                                               <button onClick={() => handleDeleteCustomer(customer.id)}>Yes</button>
                                               <button onClick={() => setShowDeleteConfirm(null)}>No</button>
                                           </div>
                                       ) : (
                                            <div className="action-buttons">
                                                <button className="action-btn edit" onClick={() => openEditModal(customer)}><EditIcon/></button>
                                                <button className="action-btn delete" onClick={() => setShowDeleteConfirm(customer.id)}><TrashIcon/></button>
                                            </div>
                                       )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-modal-btn" onClick={closeModalAndResetForm}><XIcon /></button>
                        <h3>{isEditMode ? 'Edit Customer' : 'Add a New Customer'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group"><label>Customer Name</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required /></div>
                            <div className="form-group"><label>Email (Optional)</label><input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
                            <div className="form-group"><label>Phone Number (Optional)</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
                            {error && <p className="modal-error">{error}</p>}
                            <button type="submit" className="modal-submit-btn">{isEditMode ? 'Update Customer' : 'Save Customer'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;

