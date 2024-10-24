import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../components/Dashboardnavbar/Dashboardnavbar';

const UploadPerfectMoment = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // State to hold the image preview
    const [message, setMessage] = useState('');
    const [images, setImages] = useState([]); // State to hold fetched images

    // Fetch images on component mount
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getperfectmoments');
                setImages(response.data); // Set the state with the fetched data
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, []);

    // Handle image input change
    const handleImageChange = (event) => {
        const selectedImage = event.target.files[0];
        setImage(selectedImage);

        // Create a preview URL for the selected image
        if (selectedImage) {
            const previewUrl = URL.createObjectURL(selectedImage);
            setImagePreview(previewUrl);
        } else {
            setImagePreview(null); // Reset preview if no image is selected
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!image) {
            setMessage('Please select an image to upload.');
            return;
        }

        // Create FormData object to send the image to the backend
        const formData = new FormData();
        formData.append('image', image); // Append the image file

        try {
            // Send the image to the backend via POST request
            const response = await axios.post('https://admin.yeahtrips.in/perfectmoments', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setMessage('Image uploaded successfully!');
                setImage(null);
                setImagePreview(null); // Reset the image preview after upload
                
                // Refetch images after uploading a new one
                const newImagesResponse = await axios.get('https://admin.yeahtrips.in/getperfectmoments');
                setImages(newImagesResponse.data); // Ensure you're accessing the data correctly
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage('Error uploading image. Please try again.');
        }
    };

    // Handle image deletion
    const handleDelete = async (imageId) => {
        try {
            // Send DELETE request to the backend
            const response = await axios.delete(`https://admin.yeahtrips.in/perfectmoments/${imageId}`);
            if (response.status === 200) {
                setMessage('Image deleted successfully!');

                // Refetch images after deletion
                const newImagesResponse = await axios.get('https://admin.yeahtrips.in/getperfectmoments');
                setImages(newImagesResponse.data); // Update state with new images
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            setMessage('Error deleting image. Please try again.');
        }
    };

    return (
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
                <h2 className="text-2xl font-bold text-center mb-4">Upload Perfect Moment</h2>

                {message && <div className="text-center text-red-500">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="image">Upload Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                            required
                        />
                    </div>

                    {imagePreview && (
                        <div className="flex justify-center">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-4 max-w-full h-auto rounded-lg border border-gray-300"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                    >
                        Upload Moment
                    </button>
                </form>

                {/* Display the uploaded images */}
                <div className="mt-6">
                    <h3 className="text-lg font-bold">Uploaded Images:</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {Array.isArray(images) && images.map((img) => (
                            <div key={img.id} className="border rounded-lg overflow-hidden relative">
                                <img 
                                    src={`https://admin.yeahtrips.in${img.image}`}  // Use the image path from the API response
                                    alt={`Uploaded ${img.id}`} 
                                    className="w-full h-auto" 
                                />
                                <button
                                    onClick={() => handleDelete(img.id)} // Call handleDelete with the image ID
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition duration-300"
                                >
                                    &times; {/* Close icon */}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPerfectMoment;
