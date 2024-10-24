import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
import axios from 'axios';

const CouponForm = () => {
    const [coupons, setCoupons] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get('https://admin.yeahtrips.in/getthecoupondetails');
            setCoupons(response.data.coupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            alert('Failed to fetch coupons.');
        }
    };

    const handleEdit = (coupon) => {
        coupon.isEditing = true;
        setCoupons([...coupons]);
    };

    const handleSave = async (coupon) => {
        const { coupon_id, coupon_code, discount_type, min_amount, max_amount, expiry_date, emails, discount_value } = coupon;
        const couponData = {
            couponCode: coupon_code,
            discountValue: discount_value,
            discountTypes: {
                percentage: discount_type === 'percentage',
                amount: discount_type === 'amount',
            },
            range: {
                min: min_amount,
                max: max_amount,
            },
            expiryDate: expiry_date,
            isActive: coupon.is_active ? 1 : 0,
            emails: emails ? emails.split(',') : [],
        };

        try {
            await axios.put(`https://admin.yeahtrips.in/discountcoupons/${coupon_id}`, couponData);
            alert('Coupon updated successfully!');
            fetchCoupons();

        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('An error occurred while saving the coupon. Please try again.');
        }
    };

    const handleChange = (coupon, field, value) => {
        coupon[field] = value;
        setCoupons([...coupons]);
    };

    const handleAddCoupon = () => {
        navigate('/add-coupon');
    };

    const toggleActive = (coupon) => {
        coupon.is_active = !coupon.is_active; // Toggle the active state
        setCoupons([...coupons]);
    };

    return (
        <div>
            <AdminNavbar />
            <div className="max-w-lg mx-auto p-8 bg-white border border-gray-300 rounded-lg shadow-lg mt-10">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Manage Discount Coupons</h2>
                <button
                    onClick={handleAddCoupon}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Coupon
                </button>
                <h2 className="text-2xl font-bold text-center text-gray-800 mt-8 mb-4">Coupons List</h2>
                {coupons.length === 0 ? (
                    <p className="text-center text-gray-600">No existing coupons.</p>
                ) : (
                    <ul className="space-y-4">
                        {coupons.map((coupon) => (
                            <li key={coupon.coupon_id} className="border border-gray-300 rounded-lg p-4">
                                {coupon.isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            value={coupon.coupon_code}
                                            onChange={(e) => handleChange(coupon, 'coupon_code', e.target.value)}
                                            className="border p-1 mr-2"
                                        />
                                        <select
                                            value={coupon.discount_type}
                                            onChange={(e) => handleChange(coupon, 'discount_type', e.target.value)}
                                            className="border p-1 mr-2"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="amount">Amount</option>
                                        </select>

                                        <div>
                                            <label htmlFor="min_amount">Disscount Value</label>
                                            <input
                                                type="number"
                                                value={coupon.discount_value}
                                                onChange={(e) => handleChange(coupon, 'discount_value', e.target.value)}
                                                placeholder="Min Amount"
                                                className="border p-1 mr-2"
                                            />
                                        </div>


                                        <div>
                                            <label htmlFor="min_amount">Min Amount</label>
                                            <input
                                                type="number"
                                                value={coupon.min_amount}
                                                onChange={(e) => handleChange(coupon, 'min_amount', e.target.value)}
                                                placeholder="Min Amount"
                                                className="border p-1 mr-2"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="max_amount">Max Amount</label>
                                            <input
                                                type="number"
                                                value={coupon.max_amount}
                                                onChange={(e) => handleChange(coupon, 'max_amount', e.target.value)}
                                                placeholder="Max Amount"
                                                className="border p-1 mr-2"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="date">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={coupon.expiry_date.split('T')[0]}
                                                onChange={(e) => handleChange(coupon, 'expiry_date', e.target.value)}
                                                className="border p-1 mr-2"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email">E-mails</label>
                                            <input
                                                type="text"
                                                value={coupon.emails || ''}
                                                onChange={(e) => handleChange(coupon, 'emails', e.target.value)}
                                                placeholder="Emails (comma separated)"
                                                className="border p-1 mr-2"
                                            />
                                        </div>

                                        <div className="flex items-center">
                                            <label className="mr-2">Active:</label>
                                            <input
                                                type="checkbox"
                                                checked={coupon.is_active}
                                                onChange={() => toggleActive(coupon)}
                                                className="mr-2"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSave(coupon)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => { coupon.isEditing = false; setCoupons([...coupons]); }}
                                            className="text-red-600 hover:underline ml-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p><strong>Coupon Code:</strong> {coupon.coupon_code}</p>
                                        <p><strong>Discount Value:</strong> {coupon.discount_value} {coupon.discount_type === 'percentage' ? '%' : 'Rs.'}</p>
                                        <p><strong>Min Amount:</strong> Rs. {coupon.min_amount}</p>
                                        <p><strong>Max Amount:</strong> Rs. {coupon.max_amount}</p>
                                        <p><strong>Expiry Date:</strong> {new Date(coupon.expiry_date).toLocaleDateString()}</p>
                                        <p><strong>Active:</strong> {coupon.is_active ? 'Yes' : 'No'}</p>

                                        {/* Check if emails exist and are not empty */}
                                        {coupon.emails && coupon.emails.trim() !== '' ? (
                                            <div>
                                                <p><strong>Emails:</strong></p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {coupon.emails.split(',').map((email, index) => (
                                                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                                            {email.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p><strong>Emails:</strong> No emails provided</p>
                                        )}

                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="mt-4 text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CouponForm;
