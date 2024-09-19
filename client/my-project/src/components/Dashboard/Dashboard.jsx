import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/navbar';
import Alltrips from '../Trips/Trips';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showCommunityLinkInput, setShowCommunityLinkInput] = useState(false);
  const [communityLink, setCommunityLink] = useState('');
  const [currentLink, setCurrentLink] = useState('');
  const [currentLinkId, setCurrentLinkId] = useState(null);

  useEffect(() => {
    const fetchCommunityLink = async () => {
      try {
        const response = await axios.get('https://admin.yeahtrips.in/getwhatsapp-links');
        if (response.data && response.data.length > 0) {
          setCurrentLink(response.data[0].link || ''); // Update based on your response structure
          setCommunityLink(response.data[0].link || ''); // Initialize input field with current link
          setCurrentLinkId(response.data[0].id || null); // Store the ID
        } else {
          setCurrentLink('');
          setCommunityLink(''); // Clear the input if no data
          setCurrentLinkId(null);
        }
      } catch (error) {
        console.error('Error fetching WhatsApp community link:', error);
      }
    };

    fetchCommunityLink();
  }, []);

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

  const handleCancellationPolicyClick = () => {
    navigate('/cancellationpolicy'); 
  };

  const handleAddCommunityLinkClick = () => {
    setShowCommunityLinkInput(!showCommunityLinkInput);
  };

  const handleSaveCommunityLink = async () => {
    if (!communityLink) {
      alert('Please enter a link.');
      return;
    }

    try {
      if (currentLinkId === null) {
        // POST request if there's no existing link
        const response = await axios.post('https://admin.yeahtrips.in/whatsapp-links', { link: communityLink });
        console.log("Saved WhatsApp Community Link:", response.data);
        setCurrentLink(response.data.link || ''); // Update with the new link
        setCommunityLink(response.data.link || ''); // Keep input field updated
        setCurrentLinkId(response.data.id || null); // Update the ID for future edits
      } else {
        // PUT request if there's an existing link
        const response = await axios.put(`https://admin.yeahtrips.in/updatewhatsapp-links/${currentLinkId}`, { link: communityLink });
        console.log("Updated WhatsApp Community Link:", response.data);
        setCurrentLink(response.data.link || ''); // Update with the new link
      }
      setShowCommunityLinkInput(false);
    } catch (error) {
      console.error('Error saving WhatsApp community link:', error);
    }
  };

  const handleDeleteCommunityLink = async () => {
    if (currentLinkId === null) {
      alert('No link to delete.');
      return;
    }

    try {
      await axios.delete(`https://admin.yeahtrips.in/whatsapp-links/${currentLinkId}`);
      console.log("Deleted WhatsApp Community Link");
      setCurrentLink('');
      setCommunityLink('');
      setCurrentLinkId(null); // Reset the ID
      setShowCommunityLinkInput(false);
    } catch (error) {
      console.error('Error deleting WhatsApp community link:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white text-gray-800 p-6 shadow-lg border-r border-gray-200">
        <h1 className="text-3xl font-extrabold mb-8 text-center">Dashboard</h1>
        <ul className="space-y-4">
          <li>
            <button
              onClick={handleAddTripsClick}
              className="w-full text-left py-3 px-5 border-2 border-indigo-600 rounded-lg text-indigo-600 font-semibold shadow-md hover:shadow-lg hover:border-indigo-700 hover:text-indigo-700 transition-all duration-300"
            >
              Add Trips
            </button>
          </li>
          <li>
            <button
              onClick={handleUserManagementClick}
              className="w-full text-left py-3 px-5 border-2 border-teal-600 rounded-lg text-teal-600 font-semibold shadow-md hover:shadow-lg hover:border-teal-700 hover:text-teal-700 transition-all duration-300"
            >
              User Management
            </button>
          </li>
          <li>
            <button
              onClick={handleAddCarousalsClick}
              className="w-full text-left py-3 px-5 border-2 border-orange-600 rounded-lg text-orange-600 font-semibold shadow-md hover:shadow-lg hover:border-orange-700 hover:text-orange-700 transition-all duration-300"
            >
              Add Carousals
            </button>
          </li>
          <li>
            <button
              onClick={handleAddReviewClick}
              className="w-full text-left py-3 px-5 border-2 border-red-600 rounded-lg text-red-600 font-semibold shadow-md hover:shadow-lg hover:border-red-700 hover:text-red-700 transition-all duration-300"
            >
              Add Review
            </button>
          </li>
          <li>
            <button
              onClick={handleAddCommunityLinkClick}
              className="w-full text-left py-3 px-5 border-2 border-green-600 rounded-lg text-green-600 font-semibold shadow-md hover:shadow-lg hover:border-green-700 hover:text-green-700 transition-all duration-300"
            >
              Add WhatsApp Community Link
            </button>
            {showCommunityLinkInput && (
              <div className="mt-4 p-4 bg-gray-100 border rounded-lg shadow-inner">
                <input
                  type="text"
                  value={communityLink}
                  onChange={(e) => setCommunityLink(e.target.value)}
                  placeholder="Enter WhatsApp community link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveCommunityLink}
                    className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 duration-300"
                  >
                    Save Link
                  </button>
                  <button
                    onClick={handleDeleteCommunityLink}
                    className="w-1/2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-transform transform hover:scale-105 duration-300"
                  >
                    Delete Link
                  </button>
                </div>
              </div>
            )}
          </li>

          <li>
            <button
              onClick={handleCancellationPolicyClick}
              className="w-full text-left py-3 px-5 border-2 border-green-600 rounded-lg text-green-600 font-semibold shadow-md hover:shadow-lg hover:border-green-700 hover:text-green-700 transition-all duration-300"
            >
              Cancellation Policy
            </button>
          </li>

        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white shadow-lg rounded-lg">
        <Navbar />
        <Alltrips />
      </div>
    </div>
  );
};

export default Dashboard;
