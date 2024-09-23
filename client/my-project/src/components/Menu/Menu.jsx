import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Menu = ({ showSidebar, setShowSidebar }) => {
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
                    setCurrentLink(response.data[0].link || '');
                    setCommunityLink(response.data[0].link || '');
                    setCurrentLinkId(response.data[0].id || null);
                } else {
                    setCurrentLink('');
                    setCommunityLink('');
                    setCurrentLinkId(null);
                }
            } catch (error) {
                console.error('Error fetching WhatsApp community link:', error);
            }
        };

        fetchCommunityLink();
    }, []);

    const handleUserManagementClick = () => {
        setShowSidebar(false);
        navigate('/usersmanagement');
    };
    const handleAddCarousalsClick = () => {
        setShowSidebar(false);
        navigate('/addcarousals');
    };
    const handleAddReviewClick = () => {
        setShowSidebar(false);
        navigate('/addreview');
    };
    const handleCancellationPolicyClick = () => {
        setShowSidebar(false);
        navigate('/cancellationpolicy');
    };

    const handleCreateDiscountCouponClick = () => {
        setShowSidebar(false);
        navigate('/discountcoupon');  // Navigating to the discount coupon page
    };

    const handleAddCommunityLinkClick = () => setShowCommunityLinkInput(!showCommunityLinkInput);

    const handleSaveCommunityLink = async () => {
        if (!communityLink) {
            alert('Please enter a link.');
            return;
        }

        try {
            if (currentLinkId === null) {
                const response = await axios.post('https://admin.yeahtrips.in/whatsapp-links', { link: communityLink });
                setCurrentLink(response.data.link || '');
                setCommunityLink(response.data.link || '');
                setCurrentLinkId(response.data.id || null);
            } else {
                await axios.put(`https://admin.yeahtrips.in/updatewhatsapp-links/${currentLinkId}`, { link: communityLink });
                setCurrentLink(communityLink);
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
            setCurrentLink('');
            setCommunityLink('');
            setCurrentLinkId(null);
            setShowCommunityLinkInput(false);
        } catch (error) {
            console.error('Error deleting WhatsApp community link:', error);
        }
    };

    return (
        <>
            {showSidebar && (
                <div className="w-64 bg-white shadow-lg h-full fixed left-0 top-0 p-6 z-10">
                    <ul className="space-y-4">
                        <li>
                            <button onClick={handleUserManagementClick} className="w-full text-left py-3 border-2 border-teal-600 rounded-lg text-teal-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                User Management
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAddCarousalsClick} className="w-full text-left py-3 border-2 border-orange-600 rounded-lg text-orange-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Add Carousals
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAddReviewClick} className="w-full text-left py-3 border-2 border-red-600 rounded-lg text-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Add Review
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAddCommunityLinkClick} className="w-full text-left py-3 border-2 border-green-600 rounded-lg text-green-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
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
                                        <button onClick={handleSaveCommunityLink} className="w-1/2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 duration-300">
                                            Save Link
                                        </button>
                                        <button onClick={handleDeleteCommunityLink} className="w-1/2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-transform transform hover:scale-105 duration-300">
                                            Delete Link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                        <li>
                            <button onClick={handleCreateDiscountCouponClick} className="w-full text-left py-3 border-2 border-yellow-600 rounded-lg text-yellow-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Create Discount Coupon
                            </button>
                        </li>
                        <li>
                            <button onClick={handleCancellationPolicyClick} className="w-full text-left py-3 border-2 border-green-600 rounded-lg text-green-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Cancellation Policy
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Menu;
