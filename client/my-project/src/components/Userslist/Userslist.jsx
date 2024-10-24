import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

function Userslist() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getallusers');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleAddUserClick = () => {
        navigate('/adduser');
    };

    const handleEditUserClick = (userId) => {
        navigate(`/edituser/${userId}`);
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">TEAM</h1>
                    <button
                        className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
                        onClick={handleAddUserClick}
                    >
                        Add Member
                    </button>
                </div>
                
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by email"
                        className="border rounded-lg p-2 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p className="text-center text-lg text-gray-600">Loading users...</p>
                ) : (
                    <div className="overflow-x-auto">
                        {filteredUsers.length === 0 ? ( 
                            <p className="text-center text-lg text-gray-600">No users available.</p>
                        ) : (
                            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="py-3 px-6 text-left">Email</th>
                                        <th className="py-3 px-6 text-left">Role</th>
                                        <th className="py-3 px-6 text-left">Position</th> 
                                        <th className="py-3 px-6 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-100">
                                            <td className="py-3 px-6">{user.email}</td>
                                            <td className="py-3 px-6">{user.role}</td>
                                            <td className="py-3 px-6">{user.position || 'Not Set'}</td> 
                                            <td className="py-3 px-6">
                                                <button
                                                    onClick={() => handleEditUserClick(user.id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Userslist;
