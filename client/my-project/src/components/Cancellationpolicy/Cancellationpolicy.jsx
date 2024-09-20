import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

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
                setExistingPolicies(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching policies:', error);
            }
        };

        fetchPolicies();
    }, []);

    // Handle changes for fee type, startDate, endDate, and fee
    const handlePolicyChange = (index, field, value) => {
        const updatedPolicies = [...policies];
        updatedPolicies[index][field] = value;
        setPolicies(updatedPolicies);
    };

    // Handle changes for date ranges within a policy
    const handleDateRangeChange = (policyIndex, rangeIndex, field, value) => {
        const updatedPolicies = [...policies];
        updatedPolicies[policyIndex].dateRanges[rangeIndex][field] = value;
        setPolicies(updatedPolicies);
    };

    // Add a new date range to a specific policy
    const handleAddDateRange = (policyIndex) => {
        const updatedPolicies = [...policies];
        const lastRange = updatedPolicies[policyIndex].dateRanges[updatedPolicies[policyIndex].dateRanges.length - 1];
        const newStartDate = lastRange.endDate ? parseInt(lastRange.endDate) - 1 : '';
        updatedPolicies[policyIndex].dateRanges.push({ startDate: newStartDate, endDate: '', fee: '' });
        setPolicies(updatedPolicies);
    };

    // Remove a date range from a specific policy
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

    // Submit the policies and ensure validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that all fields except the first startDate are filled
        const isValid = policies.every((policy, policyIndex) =>
            policy.dateRanges.every((range, rangeIndex) =>
                (policyIndex === 0 && rangeIndex === 0 ? true : range.startDate && range.endDate && range.fee)
            )
        );

        if (!isValid) {
            alert('Please fill in all fields for each policy except for the start date of the first range.');
            return;
        }

        // Submit policies
        try {
            const response = await axios.post('https://admin.yeahtrips.in/entercancellationpolicy', { policies });
            console.log(response.data);
            alert('Cancellation policies successfully submitted');
        } catch (error) {
            console.error('Error submitting cancellation policies:', error);
            alert('Failed to submit policies');
        }
    };

    // Delete an existing policy
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
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="max-w-6xl mx-auto p-8 bg-gray-100 shadow-2xl rounded-lg mt-10">
                <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
                    Add Cancellation Policies
                </h2>
                <form onSubmit={handleSubmit}>
                    <table className=" w-full bg-white rounded-lg overflow-hidden shadow-md border-collapse">
                        <thead>
                            <tr className="bg-blue-500 text-white">
                                <th className="py-4 px-6 text-left">Fee Type</th>
                                <th className="py-4 px-6 text-left">Start Date</th>
                                <th className="py-4 px-6 text-left">End Date</th>
                                <th className="py-4 px-6 text-left">Fee</th>
                                <th className="py-4 px-6 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map((policy, policyIndex) => (
                                <React.Fragment key={policyIndex}>
                                    {policy.dateRanges.map((range, rangeIndex) => (
                                        <tr key={rangeIndex} className="border-b">
                                            {rangeIndex === 0 && (
                                                <td rowSpan={policy.dateRanges.length} className="py-4 px-6">
                                                    <select
                                                        value={policy.feeType}
                                                        onChange={(e) => handlePolicyChange(policyIndex, 'feeType', e.target.value)}
                                                        className="px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="percentage">Percentage</option>
                                                        <option value="amount">Amount</option>
                                                    </select>
                                                </td>
                                            )}
                                            <td className="py-4 px-6">
                                                <input
                                                    type="number"
                                                    value={range.startDate}
                                                    onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'startDate', e.target.value)}
                                                    className="max-w-lg px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    readOnly={rangeIndex > 0} // Only the first row allows an empty start date
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <input
                                                    type="number"
                                                    value={range.endDate}
                                                    onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'endDate', e.target.value)}
                                                    className="max-w-lg px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <input
                                                    type="number"
                                                    value={range.fee}
                                                    onChange={(e) => handleDateRangeChange(policyIndex, rangeIndex, 'fee', e.target.value)}
                                                    className="max-w-lg px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                {policy.dateRanges.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDateRange(policyIndex, rangeIndex)}
                                                        className="text-red-500 hover:text-red-700 font-semibold"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={5} className="py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleAddDateRange(policyIndex)}
                                                className={`font-semibold ${policy.dateRanges[policy.dateRanges.length - 1].endDate === '0'
                                                    ? 'text-gray-500 cursor-not-allowed'
                                                    : 'text-green-500 hover:text-green-700'
                                                    }`}
                                                disabled={policy.dateRanges[policy.dateRanges.length - 1].endDate === '0'}
                                            >
                                                + Add Date Range
                                            </button>
                                        </td>
                                    </tr>

                                </React.Fragment>
                            ))}
                            <tr>
                                <td colSpan={5} className="py-4 text-right">
                                    <button
                                        type="button"
                                        onClick={handleAddPolicy}
                                        className="text-blue-500 hover:text-blue-700 font-semibold"
                                    >
                                        + Add Another Policy
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-500 transition duration-300"
                        >
                            Submit Policies
                        </button>
                    </div>
                </form>

                <div className="mt-10 ">
                    <h3 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-4">
                        Existing Cancellation Policies
                    </h3>
                    {existingPolicies.length === 0 ? (
                        <p className="text-gray-500 mt-6">No existing policies found.</p>
                    ) : (
                        <table className="bg-white rounded-lg overflow-hidden shadow-md border-collapse w-full">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="py-4 px-6">Policy ID</th>
                                    <th className="py-4 px-6">Fee Type</th>
                                    <th className="py-4 px-6">Date Ranges</th>
                                    <th className="py-4 px-6">Fees</th>
                                    <th className="py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {existingPolicies.map((policy) => (
                                    <tr key={policy.id} className="border-b">
                                        <td className="py-4 px-6">{policy.id}</td>
                                        <td className="py-4 px-6">{policy.feeType}</td>
                                        <td className="py-4 px-6">
                                            {policy.dateRanges.map((range, index) => (
                                                <div key={index}>
                                                    {range.startDate} - {range.endDate}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-4 px-6">
                                            {policy.dateRanges.map((range, index) => (
                                                <div key={index}>
                                                    {range.fee}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePolicy(policy.id)}
                                                className="text-red-500 hover:text-red-700 font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>

    );
};

export default Cancellationpolicy;
