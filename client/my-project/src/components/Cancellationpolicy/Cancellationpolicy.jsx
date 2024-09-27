import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
import { Link } from 'react-router-dom';

const Cancellationpolicy = () => {
    const [policies, setPolicies] = useState([
        {
            policyName: '',  // Add policyName field
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

    // Handle changes for fee type, policyName, startDate, endDate, and fee
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
        setPolicies([...policies, { policyName: '', feeType: 'percentage', dateRanges: [{ startDate: '', endDate: '', fee: '' }] }]);
    };

    // Remove a policy
    const handleRemovePolicy = (index) => {
        setPolicies(policies.filter((_, i) => i !== index));
    };

    // Submit the policies and ensure validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that all fields except the first startDate are filled and policyName is provided
        const isValid = policies.every((policy, policyIndex) =>
            policy.policyName &&
            policy.dateRanges.every((range, rangeIndex) =>
                (policyIndex === 0 && rangeIndex === 0 ? true : range.startDate && range.endDate && range.fee)
            )
        );

        if (!isValid) {
            alert('Please fill in all fields for each policy and ensure each policy has a unique name.');
            return;
        }

        // Submit policies
        try {
            const response = await axios.post('https://admin.yeahtrips.in/entercancellationpolicy', { policies });
            console.log(response.data);
            alert('Cancellation policies successfully submitted');
            window.location.reload();

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
            window.location.reload()

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
                                <th className="py-4 px-6 text-left">Policy Name</th>
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
                                                <>
                                                    <td rowSpan={policy.dateRanges.length} className="py-4 px-6">
                                                        <input
                                                            type="text"
                                                            value={policy.policyName}
                                                            onChange={(e) => handlePolicyChange(policyIndex, 'policyName', e.target.value)}
                                                            placeholder="Enter Policy Name"
                                                            className="custom-width px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>

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
                                                </>
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
                                        <td colSpan={6} className="py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleAddDateRange(policyIndex)}
                                                className={`font-semibold ${policy.dateRanges[policy.dateRanges.length - 1].endDate === '0'
                                                    ? 'text-gray-500 cursor-not-allowed'
                                                    : 'text-blue-500 hover:text-blue-700'
                                                    }`}
                                                disabled={policy.dateRanges[policy.dateRanges.length - 1].endDate === '0'}
                                            >
                                                + Add Date Range
                                            </button>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleAddPolicy}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
                        >
                            + Add Policy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                        >
                            Submit
                        </button>
                    </div>
                </form>

                <h2 className="text-4xl font-bold mb-8 mt-16 text-center text-gray-800">
                    Existing Policies
                </h2>
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md border-collapse">
                    <thead>
                        <tr className="bg-blue-500 text-white">
                            <th className="py-4 px-6 text-left">Policy Name</th>
                            <th className="py-4 px-6 text-left">Start Date</th>
                            <th className="py-4 px-6 text-left">End Date</th>
                            <th className="py-4 px-6 text-left">Fee</th>
                            <th className="py-4 px-6 text-left">Fee Type</th>
                            <th className="py-4 px-6 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {existingPolicies.map((policy) => (
                            policy.dateRanges.map((range, index) => (
                                <tr key={`${policy.id}-${index}`} className="border-b">
                                    {index === 0 && (
                                        <>
                                            <td rowSpan={policy.dateRanges.length} className="py-4 px-6">
                                                {policy.policyName}
                                            </td>
                                        </>
                                    )}
                                    <td className="py-4 px-6">{range.startDate}</td>
                                    <td className="py-4 px-6">{range.endDate}</td>
                                    <td className="py-4 px-6">{range.fee}</td>
                                    {index === 0 && (
                        <>
                            <td rowSpan={policy.dateRanges.length} className="py-4 px-6">{policy.feeType}</td>
                            <td rowSpan={policy.dateRanges.length} className="py-4 px-6 flex space-x-2">
                                <Link to={`/editpolicies/${policy.id}`}>
                                    <button className="text-blue-500 hover:text-blue-700 font-semibold">
                                        Edit
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDeletePolicy(policy.id)}
                                    className="text-red-500 hover:text-red-700 font-semibold"
                                >
                                    Delete
                                </button>
                            </td>
                        </>
                    )}
                                </tr>
                            ))
                        ))}
                    </tbody>
                </table>


            </div>
        </div>
    );
};

export default Cancellationpolicy;