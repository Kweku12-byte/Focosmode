// src/Services/cloudinary.js

export const uploadProductImage = async (file, businessId) => {
    // 1. Get the keys from your .env file
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    // 2. Package the file and instructions into FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // 3. Dynamically create a folder for this specific business
    // Example: businesses/12345ABCD/products
    formData.append('folder', `businesses/${businessId}/products`);

    try {
        // 4. Send the POST request to Cloudinary's API
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        
        // 5. Return the secure HTTPS URL Cloudinary generates
        return data.secure_url; 
        
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};
