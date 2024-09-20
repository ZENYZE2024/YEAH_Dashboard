import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa'; // Ensure react-icons is installed
import Menu from '../Menu/Menu';
import logo from './images/logo.svg';
import { useNavigate } from 'react-router-dom';

function AdminNavbar() {
    const [showSidebar, setShowSidebar] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        navigate('/', { replace: true });
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleAddTripsClick = () => {
        navigate('/addtrips');
    };

    // Get the role from local storage
    const userRole = localStorage.getItem('role');

    return (
        <>
            <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
                <div className="flex items-center">
                    <img src={logo} alt="Logo" className="h-10 w-auto" />
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                    <button
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                        onClick={handleAddTripsClick}
                    >
                        Add Trips
                    </button>

                    {/* Conditionally render the menu icon based on user role */}
                    {userRole !== 'Trip Supervisor' && (
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="text-gray-700 focus:outline-none border border-black p-2"
                        >
                            <FaBars className="text-3xl text-black" />
                        </button>
                    )}

                    <button
                        onClick={handleBack}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
                    >
                        Back
                    </button>

                    <button
                        className="bg-gradient-to-r from-red-400 to-red-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300 text-base font-medium"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <Menu showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        </>
    );
}

export default AdminNavbar;
