import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

const CommunityMembers = () => {
    const [communityMembers, setCommunityMembers] = useState([]);
    const [racampMembers, setRacampMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPageCommunity, setCurrentPageCommunity] = useState(1);
    const [currentPageRacamp, setCurrentPageRacamp] = useState(1);
    const membersPerPage = 10;

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Fetch data from both endpoints
                const [communityResponse, racampResponse] = await Promise.all([
                    axios.get('https://admin.yeahtrips.in/communitygroupmembers'),
                    axios.get('https://admin.yeahtrips.in/letsgoforracampcommunitygroupmembers'),
                ]);

                setCommunityMembers(communityResponse.data);
                setRacampMembers(racampResponse.data);
            } catch (err) {
                setError('Error fetching community members');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Pagination logic for community group members
    const indexOfLastCommunityMember = currentPageCommunity * membersPerPage;
    const indexOfFirstCommunityMember = indexOfLastCommunityMember - membersPerPage;
    const currentCommunityMembers = communityMembers.slice(indexOfFirstCommunityMember, indexOfLastCommunityMember);

    // Pagination logic for RaCamp group members
    const indexOfLastRacampMember = currentPageRacamp * membersPerPage;
    const indexOfFirstRacampMember = indexOfLastRacampMember - membersPerPage;
    const currentRacampMembers = racampMembers.slice(indexOfFirstRacampMember, indexOfLastRacampMember);

    const paginateCommunity = (pageNumber) => setCurrentPageCommunity(pageNumber);
    const paginateRacamp = (pageNumber) => setCurrentPageRacamp(pageNumber);

    if (loading) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    const totalPagesCommunity = Math.ceil(communityMembers.length / membersPerPage);
    const totalPagesRacamp = Math.ceil(racampMembers.length / membersPerPage);

    return (
        <div>
            <AdminNavbar />
            <div className="p-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-4"> Yeah Community Group Members</h2>

                <table className="min-w-full border border-gray-300 mb-8">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Name</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Phone Number</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCommunityMembers.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="border-b border-gray-300 px-4 py-2">{member.id}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.name}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.phoneNumber}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-center mt-4">
                    <ul className="inline-flex -space-x-px">
                        {Array.from({ length: totalPagesCommunity }, (_, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => paginateCommunity(index + 1)}
                                    className={`px-3 py-2 border border-gray-300 hover:bg-gray-200 ${
                                        currentPageCommunity === index + 1 ? 'bg-gray-300' : ''
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Table for RaCamp Group Members */}
                <h2 className="text-2xl font-bold text-center mb-4 mt-8">Letsgoforacamp Community Members</h2>
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">ID</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Name</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Phone Number</th>
                            <th className="border-b border-gray-300 px-4 py-2 text-left">Age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRacampMembers.map(member => (
                            <tr key={member.id} className="hover:bg-gray-50">
                                <td className="border-b border-gray-300 px-4 py-2">{member.id}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.name}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.phoneNumber}</td>
                                <td className="border-b border-gray-300 px-4 py-2">{member.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-center mt-4">
                    <ul className="inline-flex -space-x-px">
                        {Array.from({ length: totalPagesRacamp }, (_, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => paginateRacamp(index + 1)}
                                    className={`px-3 py-2 border border-gray-300 hover:bg-gray-200 ${
                                        currentPageRacamp === index + 1 ? 'bg-gray-300' : ''
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityMembers;
