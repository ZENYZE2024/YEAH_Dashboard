import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
const WhatsApp = () => {
    const [communityLink, setCommunityLink] = useState('');
    const [currentLinkId, setCurrentLinkId] = useState(null);

    useEffect(() => {
        const fetchCommunityLink = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getwhatsapp-links');
                if (response.data && response.data.length > 0) {
                    setCommunityLink(response.data[0].link || '');
                    setCurrentLinkId(response.data[0].id || null);
                }
            } catch (error) {
                console.error('Error fetching WhatsApp community link:', error);
            }
        };

        fetchCommunityLink();
    }, []);

    const handleSaveCommunityLink = async () => {
        if (!communityLink) {
            alert('Please enter a link.');
            return;
        }

        try {
            if (currentLinkId === null) {
                const response = await axios.post('https://admin.yeahtrips.in/whatsapp-links', { link: communityLink });
                setCommunityLink(response.data.link || '');
                setCurrentLinkId(response.data.id || null);
            } else {
                await axios.put(`https://admin.yeahtrips.in/updatewhatsapp-links/${currentLinkId}`, { link: communityLink });
            }
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
            setCommunityLink('');
            setCurrentLinkId(null);
        } catch (error) {
            console.error('Error deleting WhatsApp community link:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100">
            <div className="w-full">
                <AdminNavbar />
            </div>
            <div className="mt-10 bg-white p-8 rounded-lg shadow-md w-11/12 md:w-1/2 lg:w-1/3">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Manage WhatsApp Community Link</h1>
                <input
                    type="text"
                    value={communityLink}
                    onChange={(e) => setCommunityLink(e.target.value)}
                    placeholder="Enter WhatsApp community link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-800"
                />
                <div className="flex justify-between">
                    <button 
                        onClick={handleSaveCommunityLink} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                        Save Link
                    </button>
                    <button 
                        onClick={handleDeleteCommunityLink} 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                        Delete Link
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WhatsApp;
