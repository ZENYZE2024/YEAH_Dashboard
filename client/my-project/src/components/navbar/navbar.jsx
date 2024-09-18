import React from "react";
import logo from './images/logo.svg';

function Navbar() {
    // Function to navigate back
    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
            <div className="flex items-center">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
            </div>
            <button 
                onClick={handleBack} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
            >
                Back
            </button>
        </div>
    );
}

export default Navbar;
