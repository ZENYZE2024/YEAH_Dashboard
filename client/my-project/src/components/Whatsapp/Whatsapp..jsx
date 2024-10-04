import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

const WhatsApp = () => {
    const [links, setLinks] = useState({
        letsGoForACampLink: '',
        yeahCommunityLink: ''
    });
    const [linkIds, setLinkIds] = useState({
        letsGoForACampId: null,
        yeahCommunityId: null
    });

    useEffect(() => {
        const fetchCommunityLinks = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getwhatsapp-links');
                
                if (response.data && response.data.length > 0) {
                    console.log('Fetched data:', response.data); // Debugging

                    // Find the links for letsgoforacamp and yeahcommunity
                    const letsGoLink = response.data.find(link => link.name.toLowerCase() === 'letsgoforacamp') || {};
                    const yeahLink = response.data.find(link => link.name.toLowerCase() === 'yeahcommunity') || {};

                    console.log('letsGoLink:', letsGoLink); // Debugging
                    console.log('yeahLink:', yeahLink); // Debugging

                    // Update the state with the fetched links
                    setLinks({
                        letsGoForACampLink: letsGoLink.link || '',
                        yeahCommunityLink: yeahLink.link || ''
                    });

                    setLinkIds({
                        letsGoForACampId: letsGoLink.id || null,
                        yeahCommunityId: yeahLink.id || null
                    });
                }
            } catch (error) {
                console.error('Error fetching WhatsApp community links:', error);
            }
        };

        fetchCommunityLinks();
    }, []);

    const handleSaveCommunityLink = async (linkName) => {
        const link = links[`${linkName}Link`];
        const linkId = linkIds[`${linkName}Id`];

        if (!link) {
            alert(`Please enter a ${linkName} link.`);
            return;
        }

        try {
            if (linkId === null) {
                const response = await axios.post('https://admin.yeahtrips.in/whatsapp-links', {
                    link,
                    name: linkName
                });
                setLinks(prevState => ({ ...prevState, [`${linkName}Link`]: response.data.link || '' }));
                setLinkIds(prevState => ({ ...prevState, [`${linkName}Id`]: response.data.id || null }));
            } else {
                await axios.put(`https://admin.yeahtrips.in/updatewhatsapp-links/${linkId}`, {
                    link,
                    name: linkName
                });
            }
        } catch (error) {
            console.error(`Error saving ${linkName} community link:`, error);
        }
    };

    const handleDeleteCommunityLink = async (linkName) => {
        const linkId = linkIds[`${linkName}Id`];

        if (linkId === null) {
            alert(`No ${linkName} link to delete.`);
            return;
        }

        try {
            await axios.delete(`https://admin.yeahtrips.in/whatsapp-links/${linkId}`);
            setLinks(prevState => ({ ...prevState, [`${linkName}Link`]: '' }));
            setLinkIds(prevState => ({ ...prevState, [`${linkName}Id`]: null }));
        } catch (error) {
            console.error(`Error deleting ${linkName} community link:`, error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100">
            <div className="w-full">
                <AdminNavbar />
            </div>
            <div className="mt-10 bg-white p-8 rounded-lg shadow-md w-11/12 md:w-1/2 lg:w-1/3">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Manage WhatsApp Community Links</h1>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">LetsGoForACamp Community Link</h2>
                    <input
                        type="text"
                        value={links.letsGoForACampLink}
                        onChange={(e) => setLinks({ ...links, letsGoForACampLink: e.target.value })}
                        placeholder="Enter LetsGoForACamp WhatsApp link"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-800"
                    />
                    <div className="flex justify-between">
                        <button 
                            onClick={() => handleSaveCommunityLink('letsGoForACamp')} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                            Save Link
                        </button>
                        <button 
                            onClick={() => handleDeleteCommunityLink('letsGoForACamp')} 
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                            Delete Link
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-2">Yeah Community Link</h2>
                    <input
                        type="text"
                        value={links.yeahCommunityLink}
                        onChange={(e) => setLinks({ ...links, yeahCommunityLink: e.target.value })}
                        placeholder="Enter Yeah WhatsApp link"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-800"
                    />
                    <div className="flex justify-between">
                        <button 
                            onClick={() => handleSaveCommunityLink('yeahCommunity')} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                            Save Link
                        </button>
                        <button 
                            onClick={() => handleDeleteCommunityLink('yeahCommunity')} 
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all">
                            Delete Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsApp;
