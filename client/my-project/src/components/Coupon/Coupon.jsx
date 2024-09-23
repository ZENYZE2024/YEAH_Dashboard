import React, { useState } from 'react';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
import axios from 'axios';

const AddCouponForm = () => {
    const [couponCode, setCouponCode] = useState('');
    const [isPercentage, setIsPercentage] = useState(false);
    const [isAmount, setIsAmount] = useState(false);
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [emails, setEmails] = useState('');  // Now a single string for comma-separated emails
    const [expiryDate, setExpiryDate] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleCheckboxChange = (type) => {
        if (type === 'percentage') {
            setIsPercentage(!isPercentage);
        } else if (type === 'amount') {
            setIsAmount(!isAmount);
        }
    };

    const handleMinAmountChange = (e) => setMinAmount(e.target.value);
    const handleMaxAmountChange = (e) => setMaxAmount(e.target.value);
    const handleExpiryDateChange = (e) => setExpiryDate(e.target.value);
    const handleActivationChange = () => setIsActive(!isActive);

    const handleEmailChange = (e) => {
        setEmails(e.target.value);  // Store emails as a comma-separated string
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isPercentage && !isAmount) {
            alert('Please select at least one discount type.');
            return;
        }

        if (minAmount === '' || maxAmount === '') {
            alert('Please enter both minimum and maximum amounts.');
            return;
        }

        // Split the emails string by commas and trim whitespace
        const emailList = emails.split(',').map(email => email.trim());

        // Only validate emails if at least one email is provided
        if (emailList.length > 0) {
            const validEmails = emailList.every((email) => email === '' || (email.endsWith('@gmail.com') && email.length > 0));
            if (!validEmails) {
                alert('Please enter valid Gmail addresses.');
                return;
            }
        }

        const couponData = {
            couponCode,
            discountTypes: {
                percentage: isPercentage,
                amount: isAmount,
            },
            range: {
                min: minAmount,
                max: maxAmount,
            },
            expiryDate,
            isActive,
            emails: emailList.filter((email) => email), // Only include non-empty emails
        };

        try {
            const response = await axios.post('https://admin.yeahtrips.in/discountcoupons', couponData);
            console.log('Coupon Created:', response.data);

            alert('Coupon created successfully!');
        } catch (error) {
            console.error('Error creating coupon:', error);
            alert('An error occurred while creating the coupon. Please try again.');
        }
    };

    return (
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="max-w-lg mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg mt-10">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Discount Coupon</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
                            Coupon Code:
                        </label>
                        <input
                            type="text"
                            id="couponCode"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            placeholder="Enter coupon code"
                        />
                    </div>

                    <fieldset className="mb-6">
                        <legend className="text-lg font-semibold text-gray-800 mb-2">Discount Type:</legend>
                        <label className="inline-flex items-center mr-4">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-green-600"
                                checked={isPercentage}
                                onChange={() => handleCheckboxChange('percentage')}
                            />
                            <span className="ml-2 text-gray-700">Percentage</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-green-600"
                                checked={isAmount}
                                onChange={() => handleCheckboxChange('amount')}
                            />
                            <span className="ml-2 text-gray-700">Amount</span>
                        </label>
                    </fieldset>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Amount:
                            </label>
                            <input
                                type="number"
                                id="minAmount"
                                value={minAmount}
                                onChange={handleMinAmountChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                                placeholder="Min amount"
                            />
                        </div>
                        <div>
                            <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Amount:
                            </label>
                            <input
                                type="number"
                                id="maxAmount"
                                value={maxAmount}
                                onChange={handleMaxAmountChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                                placeholder="Max amount"
                            />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="mb-6">
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date:
                        </label>
                        <input
                            type="date"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                        />
                    </div>

                    {/* Activation Status */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Activation Status:</label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-green-600"
                                checked={isActive}
                                onChange={handleActivationChange}
                            />
                            <span className="ml-2 text-gray-700">{isActive ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>

                    {/* Email Field for Comma-Separated Values */}
                    <div className="mb-6">
                        <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
                            User Gmail(s) (comma separated):
                        </label>
                        <textarea
                            id="emails"
                            value={emails}
                            onChange={handleEmailChange}
                            className="w-full h-24 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                            placeholder="Enter Gmail addresses separated by commas"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none transition duration-200"
                    >
                        Create Coupon
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCouponForm;
