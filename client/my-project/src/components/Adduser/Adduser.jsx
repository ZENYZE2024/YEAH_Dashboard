import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../navbar/navbar';
function Adduser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [link, setLink] = useState('');
    const [profileMode, setProfileMode] = useState(''); 
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('name', name);
        formData.append('link', link);
        formData.append('profile_mode', profileMode);
        if (image) {
            formData.append('image', image); 
        }

        try {
            const response = await axios.post('https://admin.yeahtrips.in/adduser', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            window.location.reload();
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Error during registration');
            }
        }
    };

    // Handle file input change
    const handleImageChange = (e) => {
        setImage(e.target.files[0]); // Store the selected file in state
    };

    return (

        <div>
            <div>
                 <Navbar/>
            </div>
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register</h2>
                    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                        <div className="form-group">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role:</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="User">User</option>
                                <option value="Trip Supervisor">Trip Supervisor</option>
                                <option value="Read-Only">Read-Only</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link:</label>
                            <input
                                type="text"
                                id="link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile_mode" className="block text-sm font-medium text-gray-700">Profile Mode:</label>
                            <select
                                id="profile_mode"
                                value={profileMode}
                                onChange={(e) => setProfileMode(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select Profile Mode</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Instagram">Instagram</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Profile Image:</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Register
                        </button>
                    </form>
                    {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
                </div>
            </div>
        </div>

    );
}

export default Adduser;
