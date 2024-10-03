import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditCancellationPolicy = () => {
    const { tripId } = useParams(); // Get tripId from the route params
    const navigate = useNavigate(); // For navigating back after save/cancel
    const [allPolicies, setAllPolicies] = useState([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    useEffect(() => {
        // Fetch all available policies when the component is mounted
        const fetchAllPolicies = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getcancellationpolicies');
                setAllPolicies(response.data);
            } catch (error) {
                console.error('Error fetching all policies:', error);
            }
        };

        fetchAllPolicies();
    }, []);

    // Handle Checkbox Change
    const handleCheckboxChange = (policyId) => {
        setSelectedPolicyId(policyId);
    };

    // Handle Save Policies
    const handleSave = async () => {
        const tripid = tripId;

        try {
            const dataToSend = {
                trip_id: tripId,
                policy_id: selectedPolicyId, // Single selected policy_id
            };

            // Send the data to the backend
            await axios.put(`https://admin.yeahtrips.in/update-cancellation-policy/${tripId}`, dataToSend);

            navigate(`/${tripid}`);
        } catch (error) {
            console.error('Error saving policies:', error);
        }
    };

    // Filter policies based on the search term
    const filteredPolicies = allPolicies.filter(policy => 
        policy.policyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold">Select a Policy to Include:</h3>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Policies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded-md mb-4 w-full"
            />

            <div className="flex flex-col">
                {filteredPolicies.map(policy => (
                    <div key={policy.id} className="border p-4 mb-2 rounded-md">
                        <h4 className="font-bold">{policy.policyName}</h4>
                        <p><strong>Fee Type:</strong> {policy.feeType}</p>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                checked={selectedPolicyId === policy.id}
                                onChange={() => handleCheckboxChange(policy.id)}
                                className="mr-2"
                            />
                            <span>Available Dates:</span>
                        </div>
                        <div className="ml-6">
                            {policy.dateRanges.map((range, index) => (
                                <div key={index} className="flex mt-1">
                                    <span>
                                        Start Date: {range.startDate}, End Date: {range.endDate}, Fee: {range.fee}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                >
                    Save Policy
                </button>
                <button
                    onClick={() => navigate('/cancellation-policy')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditCancellationPolicy;
