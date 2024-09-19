import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cancellationpolicy = () => {
    const [policies, setPolicies] = useState([
        {
            feeType: 'percentage',
            dateRanges: [{ startDate: '', endDate: '', fee: '' }]
        }
    ]);

    const [existingPolicies, setExistingPolicies] = useState([]);

    // Fetch existing policies when component mounts
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getcancellationpolicies');
                setExistingPolicies(response.data); // Assuming response data is an array of policies
            } catch (error) {
                console.error('Error fetching policies:', error);
            }
        };

        fetchPolicies();
    }, []);

    // Handle change in policy fields
    const handlePolicyChange = (index, field, value) => {
        const updatedPolicies = [...policies];
        updatedPolicies[index][field] = value;
        setPolicies(updatedPolicies);
    };

    // Handle change in date range fields
    const handleDateRangeChange = (policyIndex, rangeIndex, field, value) => {
        const updatedPolicies = [...policies];
        updatedPolicies[policyIndex].dateRanges[rangeIndex][field] = value;
        setPolicies(updatedPolicies);
    };

    // Add a new date range to a policy
    const handleAddDateRange = (policyIndex) => {
        const updatedPolicies = [...policies];
        updatedPolicies[policyIndex].dateRanges.push({ startDate: '', endDate: '', fee: '' });
        setPolicies(updatedPolicies);
    };

    // Remove a date range from a policy
    const handleRemoveDateRange = (policyIndex, rangeIndex) => {
        const updatedPolicies = [...policies];
        updatedPolicies[policyIndex].dateRanges = updatedPolicies[policyIndex].dateRanges.filter((_, i) => i !== rangeIndex);
        setPolicies(updatedPolicies);
    };

    // Add a new policy
    const handleAddPolicy = () => {
        setPolicies([...policies, { feeType: 'percentage', dateRanges: [{ startDate: '', endDate: '', fee: '' }] }]);
    };

    // Remove a policy
    const handleRemovePolicy = (index) => {
        setPolicies(policies.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input data
        if (policies.some(policy => policy.dateRanges.some(range => !range.startDate || !range.endDate || !range.fee))) {
            alert('Please fill in all fields for each policy');
            return;
        }

        try {
            const response = await axios.post('https://admin.yeahtrips.in/entercancellationpolicy', { policies });
            console.log(response.data);
            alert('Cancellation policies successfully submitted');
        } catch (error) {
            console.error('Error submitting cancellation policies:', error);
            alert('Failed to submit policies');
        }
    };

    // Handle deleting an existing policy
    const handleDeletePolicy = async (policyId) => {
        try {
            await axios.delete(`https://admin.yeahtrips.in/deletecancellationpolicy/${policyId}`);
            setExistingPolicies(existingPolicies.filter(policy => policy.id !== policyId));
            alert('Policy deleted successfully');
        } catch (error) {
            console.error('Error deleting policy:', error);
            alert('Failed to delete policy');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-8 bg-gray-100 shadow-xl rounded-lg mt-10">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Add Cancellation Policies
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {policies.map((policy, policyIndex) => (
                    <div key={policyIndex} className="p-4 bg-white border rounded-lg shadow-md space-y-4">
                        <div>
                            <label className="block text-gray-700 text-lg font-semibold mb-2">Fee Type</label>
                            <select
                                value={policy.feeType}
                                onChange={(e) => handlePolicyChange(policyIndex, 'feeType', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="amount">Amount</option>
                            </select>
                        </div>

                        {policy.dateRanges.map((range, rangeIndex) => (
                            <div key={rangeIndex} className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-lg font-semibold mb-2">Start Date</label>
                                    <input
                                        type="number"
                                        value={range.startDate}
                                        onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'startDate', e.target.value)}
                                        placeholder="Enter start date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-lg font-semibold mb-2">End Date</label>
                                    <input
                                        type="number"
                                        value={range.endDate}
                                        onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'endDate', e.target.value)}
                                        placeholder="Enter end date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-lg font-semibold mb-2">
                                        Cancellation Fee ({policy.feeType === 'percentage' ? 'Percentage' : 'Amount'})
                                    </label>
                                    <input
                                        type="number"
                                        value={range.fee}
                                        onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'fee', e.target.value)}
                                        placeholder="Enter fee"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                {policy.dateRanges.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDateRange(policyIndex, rangeIndex)}
                                        className="w-full bg-red-600 text-white py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
                                    >
                                        Remove Date Range
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => handleAddDateRange(policyIndex)}
                            className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                        >
                            Add Another Date Range
                        </button>

                        {policies.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemovePolicy(policyIndex)}
                                className="w-full bg-red-600 text-white py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
                            >
                                Remove Policy
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleAddPolicy}
                    className="w-full bg-green-600 text-white py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                >
                    Add Another Policy
                </button>

                <div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Submit Policies
                    </button>
                </div>
            </form>

            {/* Display existing policies */}
            <div className="mt-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-4">
                    Existing Cancellation Policies
                </h3>
                {existingPolicies.length === 0 ? (
                    <p className="text-gray-500 mt-4 text-lg italic">No policies found.</p>
                ) : (
                    existingPolicies.map((policy) => (
                        <div
                            key={policy.id}
                            className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-lg space-y-6 mt-6 hover:shadow-2xl transition-shadow duration-300"
                        >
                            <p className="text-xl font-semibold text-indigo-600">Policy ID: {policy.id}</p>
                            <p className="text-lg font-medium text-gray-700">
                                <span className="text-indigo-500">Fee Type:</span> {policy.feeType.charAt(0).toUpperCase() + policy.feeType.slice(1)}
                            </p>
                            <div className="space-y-4">
                                {policy.dateRanges.map((range, rangeIndex) => (
                                    <div
                                        key={rangeIndex}
                                        className="p-4 bg-indigo-50 border border-indigo-300 rounded-lg shadow-inner"
                                    >
                                        <p className="text-md text-gray-800">
                                            <span className="font-semibold text-indigo-600">Start Date:</span> {range.startDate}
                                        </p>
                                        <p className="text-md text-gray-800">
                                            <span className="font-semibold text-indigo-600">End Date:</span> {range.endDate}
                                        </p>
                                        <p className="text-md text-gray-800">
                                            <span className="font-semibold text-indigo-600">Fee:</span> {range.fee}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="w-full bg-red-500 text-white py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 font-bold text-lg"
                            >
                                Delete Policy
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default Cancellationpolicy;
