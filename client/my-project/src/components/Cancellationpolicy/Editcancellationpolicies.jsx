import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditPolicies = () => {
    const { policyId } = useParams();
    const navigate = useNavigate(); // Use useNavigate instead of useHistory
    const [policy, setPolicy] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await axios.get(`https://admin.yeahtrips.in/getcancellationpolicy/${policyId}`);
                setPolicy(response.data);
            } catch (error) {
                console.error('Error fetching policy:', error);
            }
        };

        fetchPolicy();
    }, [policyId]);

    const handleChange = (field, value) => {
        setPolicy({ ...policy, [field]: value });
    };

    const handleDateRangeChange = (index, field, value) => {
        const updatedDateRanges = policy.dateRanges.map((dateRange, i) => 
            i === index ? { ...dateRange, [field]: value } : dateRange
        );
        setPolicy({ ...policy, dateRanges: updatedDateRanges });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`https://admin.yeahtrips.in/updatecancellationpolicy/${policyId}`, policy);
            alert('Policy updated successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error updating policy:', error);
            alert('Failed to update policy');
        }
    };

    if (!policy) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-4">Edit Cancellation Policy</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="policyName">Policy Name</label>
                    <input
                        type="text"
                        id="policyName"
                        value={policy.policyName}
                        onChange={(e) => handleChange('policyName', e.target.value)}
                        placeholder="Policy Name"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="feeType">Fee Type</label>
                    <input
                        type="text"
                        id="feeType"
                        value={policy.feeType}
                        onChange={(e) => handleChange('feeType', e.target.value)}
                        placeholder="Fee Type"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <h3 className="text-lg font-semibold mb-2">Date Ranges</h3>
                {policy.dateRanges.map((dateRange, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700" htmlFor={`startDate-${index}`}>Start Date</label>
                            <input
                                type="number"
                                id={`startDate-${index}`}
                                value={dateRange.startDate}
                                onChange={(e) => handleDateRangeChange(index, 'startDate', e.target.value)}
                                placeholder="Start Date"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700" htmlFor={`endDate-${index}`}>End Date</label>
                            <input
                                type="number"
                                id={`endDate-${index}`}
                                value={dateRange.endDate}
                                onChange={(e) => handleDateRangeChange(index, 'endDate', e.target.value)}
                                placeholder="End Date"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700" htmlFor={`fee-${index}`}>Fee</label>
                            <input
                                type="text"
                                id={`fee-${index}`}
                                value={dateRange.fee}
                                onChange={(e) => handleDateRangeChange(index, 'fee', e.target.value)}
                                placeholder="Fee"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                ))}
                <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                    Update Policy
                </button>
            </form>
        </div>
    );
};

export default EditPolicies;
