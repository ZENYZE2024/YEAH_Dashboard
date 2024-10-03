import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

const CommunityMembers = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 10; 
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/communitygroupmembers');
                setMembers(response.data);
            } catch (err) {
                setError('Error fetching community members');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">{error}</div>;
    }

    const totalPages = Math.ceil(members.length / membersPerPage);

    return (
        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="p-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-4">Community Group Members</h2>
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
                        {currentMembers.map(member => (
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
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => paginate(index + 1)}
                                    className={`px-3 py-2 border border-gray-300 hover:bg-gray-200 ${
                                        currentPage === index + 1 ? 'bg-gray-300' : ''
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
