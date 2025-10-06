import React, { useState, useEffect, useRef } from 'react';
import './Inventory.css';
// FIX: Corrected import paths to go up two directories
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../Services/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// --- Icon Components ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// --- NEW: Currency Definitions ---
const currencies = {
    'GHS': '₵',
    'NGN': '₦',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
};

const Inventory = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    // --- State for Add/Edit Modal ---
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [productName, setProductName] = useState('');
    const [productType, setProductType] = useState('Physical');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('GHS'); // NEW currency state
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const fileInputRef = useRef(null);
    
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const productsCollectionRef = collection(db, 'businesses', currentUser.uid, 'products');
        const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching products:", err);
            setError('Failed to load products.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!currentUser) return setError("You are not logged in.");

        // NEW: Check image file size before doing anything else
        if (imageFile && imageFile.size > 5 * 1024 * 1024) { // 5MB limit
            return setError("Image file is too large. Please upload an image under 5MB.");
        }
        
        setUploading(true);
        let imageUrl = existingImageUrl;

        if (imageFile) {
            const imageRef = ref(storage, `products/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
            try {
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (err) {
                console.error("Image upload error:", err);
                setError("Failed to upload image.");
                setUploading(false);
                return;
            }
        }
        
        const productData = {
            name: productName,
            type: productType,
            price: Number(price),
            currency: currency, // NEW: save currency
            description: description,
            imageUrl: imageUrl || '',
        };
        if (productType === 'Physical') {
            productData.quantity = Number(quantity);
        }

        try {
            if (isEditMode) {
                const productDocRef = doc(db, 'businesses', currentUser.uid, 'products', currentProductId);
                await updateDoc(productDocRef, productData);
            } else {
                productData.createdAt = new Date();
                const productsCollectionRef = collection(db, 'businesses', currentUser.uid, 'products');
                await addDoc(productsCollectionRef, productData);
            }
            closeModalAndResetForm();
        } catch (err) {
            console.error("Firestore error:", err);
            setError("Failed to save product. Please try again.");
        } finally {
            setUploading(false);
        }
    };
    
    const handleDeleteProduct = async (productId, imageUrl) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'businesses', currentUser.uid, 'products', productId));
            if (imageUrl) {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
            }
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        resetFormFields();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEditMode(true);
        setCurrentProductId(product.id);
        setProductName(product.name);
        setProductType(product.type);
        setPrice(product.price);
        setCurrency(product.currency || 'GHS'); // NEW: set currency on edit
        setQuantity(product.quantity || '');
        setDescription(product.description || '');
        setExistingImageUrl(product.imageUrl || '');
        setIsModalOpen(true);
    };

    const resetFormFields = () => {
        setProductName('');
        setProductType('Physical');
        setPrice('');
        setCurrency('GHS'); // NEW: reset currency
        setQuantity('');
        setDescription('');
        setExistingImageUrl('');
        setImageFile(null);
        if(fileInputRef.current) fileInputRef.current.value = null;
    };
    
    const closeModalAndResetForm = () => {
        setIsModalOpen(false);
        resetFormFields();
        setError('');
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Your Inventory</h2>
                <div className="header-actions">
                     <div className="search-wrapper">
                        <SearchIcon />
                        <input 
                            type="text" 
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="add-product-btn" onClick={openAddModal}>
                        <PlusIcon />
                        <span>Add New Product</span>
                    </button>
                </div>
            </div>
            
            {loading ? <p>Loading products...</p> : filteredProducts.length === 0 ? (
                <div className="no-products-view">
                    <h3>{searchTerm ? 'No products match your search.' : 'Your inventory is empty!'}</h3>
                    <p>{!searchTerm && 'Click "Add New Product" to get started.'}</p>
                </div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Product Name</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-image-thumbnail" style={{backgroundImage: `url(${product.imageUrl || 'https://placehold.co/60x60/f9fafb/e5e7eb?text=Img'})`}}></div>
                                    </td>
                                    <td>{product.name}</td>
                                    <td><span className={`product-type-badge ${product.type.toLowerCase()}`}>{product.type}</span></td>
                                    {/* UPDATE: Display correct currency symbol */}
                                    <td>{currencies[product.currency] || '₵'}{product.price.toFixed(2)}</td>
                                    <td>{product.type === 'Physical' ? product.quantity : 'N/A'}</td>
                                    <td>
                                       {showDeleteConfirm === product.id ? (
                                           <div className="delete-confirm">
                                               <span>Sure?</span>
                                               <button onClick={() => handleDeleteProduct(product.id, product.imageUrl)}>Yes</button>
                                               <button onClick={() => setShowDeleteConfirm(null)}>No</button>
                                           </div>
                                       ) : (
                                            <div className="action-buttons">
                                                <button className="action-btn edit" onClick={() => openEditModal(product)}><EditIcon/></button>
                                                <button className="action-btn delete" onClick={() => setShowDeleteConfirm(product.id)}><TrashIcon/></button>
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
                        <h3>{isEditMode ? 'Edit Product' : 'Add a New Product'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Product Image (Optional, max 5MB)</label>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files[0])} />
                            </div>
                            <div className="form-group"><label>Product Name</label><input type="text" value={productName} onChange={e => setProductName(e.target.value)} required /></div>
                            <div className="form-group"><label>Product Type</label><select value={productType} onChange={e => setProductType(e.target.value)}><option value="Physical">Physical Good</option><option value="Digital">Digital Product</option><option value="Ticket">Event Ticket</option></select></div>
                            
                            {/* UPDATE: New Price and Currency input group */}
                            <div className="form-group">
                                <label>Price</label>
                                <div className="price-group">
                                    <select className="currency-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                                        {Object.keys(currencies).map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <input className="price-input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                            </div>

                            {productType === 'Physical' && (<div className="form-group"><label>Quantity in Stock</label><input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required /></div>)}
                            <div className="form-group"><label>Description (Optional)</label><textarea value={description} onChange={e => setDescription(e.target.value)}></textarea></div>
                            {error && <p className="modal-error">{error}</p>}
                            <button type="submit" className="modal-submit-btn" disabled={uploading}>{uploading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
