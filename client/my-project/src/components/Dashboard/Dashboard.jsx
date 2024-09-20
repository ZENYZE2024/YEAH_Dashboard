import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa'; 
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
import Alltrips from '../Trips/Trips';
import Menu from '../Menu/Menu'; 
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);


  return (
    <div className="min-h-screen bg-gray-100 flex">

      <div className={`flex-1 p-6 bg-white shadow-lg rounded-lg ${showSidebar ? 'ml-64' : ''}`}>
        <AdminNavbar />

        <div className="mt-6 flex justify-between items-center mb-6">
          

          <h1 className="text-3xl font-extrabold text-center flex-grow ml-4">Dashboard</h1>

          
        </div>

        <Alltrips />
      </div>
    </div>
  );
};

export default Dashboard;
