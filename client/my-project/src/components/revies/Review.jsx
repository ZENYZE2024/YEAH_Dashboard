import axios from "axios";
import React, { useState, useEffect } from "react";
import Rating from 'react-stars';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import AdminNavbar from "../Dashboardnavbar/Dashboardnavbar";

const Addreview = () => {
    const [carousals, setCarousals] = useState([]);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [image, setImage] = useState(null);
    const [authorImage, setAuthorImage] = useState(null);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchCarousals = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/reviewcarousals');
                console.log("Fetched carousals:", response.data);
                if (Array.isArray(response.data)) {
                    setCarousals(response.data);
                } else {
                    console.error("Fetched data is not an array:", response.data);
                    setCarousals([]);
                }
            } catch (error) {
                console.error('Error fetching carousals:', error);
            }
        };

        fetchCarousals();
    }, []);

    const handleAddCarousal = async () => {
        if (title && author) {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('rating', rating);
            if (image) formData.append('image', image);
            if (authorImage) formData.append('authorImage', authorImage); // Append author's image

            try {
                const response = await axios.post('https://admin.yeahtrips.in/carousals', formData);

                if (response.status >= 200 && response.status < 300) {
                    const newCarousal = response.data;
                    setCarousals(prevCarousals => [...prevCarousals, newCarousal]);
                    setTitle("");
                    setAuthor("");
                    setImage(null);
                    setAuthorImage(null); // Reset author's image state
                    setRating(0);
                    window.location.reload();
                } else {
                    console.error('Failed to add carousal');
                }
            } catch (error) {
                console.error('Error adding carousal:', error);
            }
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleAuthorImageChange = (e) => {
        setAuthorImage(e.target.files[0]);
    };

    const handleDeleteCarousal = async (id) => {
        try {
            const response = await axios.delete(`https://admin.yeahtrips.in/carousalsdelete/${id}`);

            if (response.status >= 200 && response.status < 300) {
                setCarousals(prevCarousals => prevCarousals.filter(carousal => carousal.id !== id));
            } else {
                console.error('Failed to delete carousal');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="p-8 bg-white shadow-lg rounded-lg max-w-3xl mx-auto">
                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Add Carousals</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter the carousal title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Author</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter the author's name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <Rating
                            count={5}
                            value={rating}
                            onChange={(newRating) => setRating(newRating)}
                            size={24}
                            emptyIcon={<FontAwesomeIcon icon={farStar} />}
                            fullIcon={<FontAwesomeIcon icon={fasStar} />}
                            halfIcon={<FontAwesomeIcon icon={fasStar} />}
                            half={true}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Carousal Image</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Author Image</label>
                        <input
                            type="file"
                            onChange={handleAuthorImageChange} // Handle author's image change
                            className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                    </div>
                    <button
                        onClick={handleAddCarousal}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Carousal
                    </button>
                </div>

                <div className="mt-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">Carousals List</h3>
                    {carousals.length === 0 ? (
                        <p className="text-gray-500 text-center">No carousals added yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {carousals.map((carousal) => (
                                <li key={carousal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">{carousal.title}</p>
                                            <div className="flex items-center space-x-4">
                                                {carousal.author_image && ( // Use carousal.author_image instead of carousal.authorImage
                                                    <img
                                                        src={`https://admin.yeahtrips.in/${carousal.author_image}`} // Correct image path
                                                        alt={carousal.author}
                                                        className="w-16 h-16 object-cover rounded-full shadow-md" // Styling to make it circular and add shadow
                                                    />
                                                )}

                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">{carousal.author}</p>
                                                </div>
                                            </div>

                                            {carousal.rating !== undefined && (
                                                <div>
                                                    <p className="text-gray-700">Rating:</p>
                                                    <Rating
                                                        readonly
                                                        count={5}
                                                        value={carousal.rating}
                                                        size={24}
                                                        emptyIcon={<FontAwesomeIcon icon={farStar} />}
                                                        fullIcon={<FontAwesomeIcon icon={fasStar} />}
                                                        halfIcon={<FontAwesomeIcon icon={fasStar} />}
                                                        half={true}
                                                    />
                                                </div>
                                            )}
                                            {carousal.image && (
                                                <img
                                                    src={`https://admin.yeahtrips.in/${carousal.image}`}
                                                    alt={carousal.title}
                                                    className="mt-2 w-32 h-32 object-cover rounded-md shadow-md"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCarousal(carousal.id)}
                                        className="text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Addreview;
