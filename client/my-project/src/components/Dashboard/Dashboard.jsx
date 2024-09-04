import React from "react";
import Navbar from "../navbar/navbar";
import Alltrips from "../Trips/Trips";
import { useNavigate } from 'react-router-dom';

const Dashhboard = () => {
  const navigate = useNavigate();

  const handleAddTripsClick = () => {
    navigate('/addtrips');
  };

  const handleUserManagementClick = () => {
    navigate('/usersmanagement');
  };

  const handleAddCarousalsClick = () => {
    navigate('/addcarousals'); 
  };

  const handleAddReviewClick = () => {
    navigate('/addreview');
  };

  return (
    <div className="flex bg-gray-100">
      <div className="w-64 bg-gray-800 text-white p-5">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <ul>
          <li>
            <button
              onClick={handleAddTripsClick}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              Add Trips
            </button>
          </li>
          <li>
            <button
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              Cancellation Policy
            </button>
          </li>
          <li>
            <button
              onClick={handleUserManagementClick}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              User Management
            </button>
          </li>
          <li>
            <button
              onClick={handleAddCarousalsClick}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              Add Carousals
            </button>
          </li>
          <li>
            <button
              onClick={handleAddReviewClick}
              className="w-full text-left py-2 px-4 rounded hover:bg-gray-700"
            >
              Add Review
            </button>
          </li>
        </ul>
      </div>

      <div className="flex-1 p-6">
        <Navbar />
        <Alltrips />
      </div>
    </div>
  );
};

export default Dashhboard;
