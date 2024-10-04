import React from "react";
import { useNavigate } from "react-router-dom";
import logo from './images/logo.svg';

function Navbar() {
    const navigate = useNavigate(); 

    const handleBack = () => {
        window.history.back();
    };

    const handleLogoClick = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md">
            <div className="flex items-center"  onClick={handleLogoClick} >
                <img 
                    src={logo} 
                    alt="Logo" 
                    className="h-10 w-auto cursor-pointer" 
                   
                />
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

