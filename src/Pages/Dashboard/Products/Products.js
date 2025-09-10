import React, { useState } from 'react';
import './products.css';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../Services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Products = () => {
    const { currentUser } = useAuth();
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!productName || !productPrice) {
            return setError("Please fill out all fields.");
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Create a reference to the user's specific 'products' sub-collection
            const productsCollectionRef = collection(db, 'users', currentUser.uid, 'products');
            
            await addDoc(productsCollectionRef, {
                name: productName,
                price: Number(productPrice),
                createdAt: serverTimestamp()
            });

            setSuccess(`Product "${productName}" added successfully!`);
            setProductName('');
            setProductPrice('');

        } catch (err) {
            setError("Failed to add product. Please try again.");
            console.error(err);
        }

        setLoading(false);
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>My Products</h2>
                <p>Add and manage your products here.</p>
            </div>

            <div className="add-product-form-container">
                <h3>Add a New Product</h3>
                <form onSubmit={handleAddProduct} className="add-product-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="productName">Product Name</label>
                            <input
                                type="text"
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="e.g., Kente Scarf"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="productPrice">Price (GHS)</label>
                            <input
                                type="number"
                                id="productPrice"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                                placeholder="e.g., 120"
                            />
                        </div>
                    </div>
                    <button type="submit" className="add-product-btn" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </form>
                {error && <p className="form-message error">{error}</p>}
                {success && <p className="form-message success">{success}</p>}
            </div>

            <div className="product-list-container">
                <h3>Your Product List</h3>
                <div className="product-list-placeholder">
                    <p>Your products will appear here once you add them.</p>
                </div>
            </div>
        </div>
    );
};

export default Products;
