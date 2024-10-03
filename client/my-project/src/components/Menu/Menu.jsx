import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';  // Import FontAwesome close icon

const Menu = ({ showSidebar, setShowSidebar }) => {
    const navigate = useNavigate();

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
        navigate('/discountcoupon');  // Navigate to the discount coupon page
    };

    const handleDashboardClick = () => {
        setShowSidebar(false);
        navigate('/dashboard');
    };

    const handlePerfectMomentsClick = () => {
        setShowSidebar(false);
        navigate('/perfectmoments');  // Navigate to the Perfect Moments page
    };

    const handleBlogsClick = () => {
        setShowSidebar(false);
        navigate('/createblog');  
    };

    const handleCommunityMembersClick = () => {
        setShowSidebar(false);
        navigate('/communitymembers');  // Navigate to the Community Members page
    };

    const handleAddCommunityLinkClick = () => {
        setShowSidebar(false);
        navigate('/whatsapp');  // Navigate to WhatsApp component
    };

    return (
        <>
            {showSidebar && (
                <div className="w-64 bg-white shadow-lg h-full fixed left-0 top-0 p-6 z-10 overflow-y-auto" style={{ maxHeight: '100vh' }}>
                    {/* Close icon */}
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setShowSidebar(false)} className="text-gray-600 hover:text-gray-900 transition-colors">
                            <FaTimes size={24} /> {/* FontAwesome close icon */}
                        </button>
                    </div>
                    
                    <ul className="space-y-4">
                        <li>
                            <button onClick={handleUserManagementClick} className="w-full text-left py-3 border-2 border-teal-600 rounded-lg text-teal-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                User Management
                            </button>
                        </li>

                        <li>
                            <button onClick={handleDashboardClick} className="w-full text-left py-3 border-2 border-red-600 rounded-lg text-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Dashboard
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
                            <button onClick={handleCommunityMembersClick} className="w-full text-left py-3 border-2 border-purple-600 rounded-lg text-purple-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Community Members
                            </button>
                        </li>
                        <li>
                            <button onClick={handleAddCommunityLinkClick} className="w-full text-left py-3 border-2 border-green-600 rounded-lg text-green-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Add WhatsApp Community Link
                            </button>
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
                        <li>
                            <button onClick={handlePerfectMomentsClick} className="w-full text-left py-3 border-2 border-purple-600 rounded-lg text-purple-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Perfect Moments
                            </button>
                        </li>
                        <li>
                            <button onClick={handleBlogsClick} className="w-full text-left py-3 border-2 border-blue-600 rounded-lg text-blue-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                                Blogs
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
};

export default Menu;
