import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`https://admin.yeahtrips.in/getuser/${userId}`);

                if (response.data.length === 0) {
                    setUser(null); // No user found
                }else{
                    setUser({
                        ...response.data,
                        link: response.data.link || '', // Ensure link is a string
                    });
                    setLoading(false);
                }
               
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('Failed to fetch user details');
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Link validation
        if (isEditing && user.link && !/^https?:\/\/|^wa\.me/.test(user.link)) {
            alert('Please provide a valid link starting with http://, https://, or wa.me/');
            return;
        }

        const formData = new FormData();
        Object.entries(user).forEach(([key, value]) => {
            formData.append(key, value);
        });

        if (newImage) {
            formData.append('profile_image', newImage);
        }

        try {
            await axios.put(`https://admin.yeahtrips.in/updateuser/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('User details successfully updated');
            window.location.reload();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user details');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!user) {
        return <p>User not found.</p>; 
    }
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="bg-blue-500 text-white py-2 px-4 rounded-lg mb-4"
            >
                {isEditing ? 'Cancel Edit' : 'Edit'}
            </button>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Profile Image</label>
                    <div className="mb-2">
                        {user.profile_image && (
                            <img
                                src={`https://admin.yeahtrips.in${user.profile_image.replace(/\\/g, '/')}`}
                                alt="Profile"
                                className="w-32 h-32 object-cover mb-2"
                            />
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Profile Mode</label>
                    <input
                        type="text"
                        name="profile_mode"
                        value={user.profile_mode}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Link</label>
                    <input
                        type="url"
                        name="link"
                        value={user.link}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                        required={isEditing} // Only require when editing
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Role</label>
                    <input
                        type="text"
                        name="role"
                        value={user.role}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 w-full"
                        disabled={!isEditing}
                        required
                    />
                </div>
                {isEditing && (
                    <button type="submit" className="bg-indigo-500 text-white py-2 px-4 rounded-lg">
                        Save Changes
                    </button>
                )}
            </form>
        </div>
    );
}

export default EditUser;
