import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';
function Pasttrips() {
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://admin.yeahtrips.in/alltrips');
                console.log('Fetched data:', response.data);
                setDatas(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.response ? error.response.data : error.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (trip_id) => {
        navigate(`/${trip_id}`);
    };

    if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-lg text-red-600">Error: {error}</p>;

    const filteredData = datas.filter((trip) =>
        trip.trip_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (

        <div>
            <div>
                <AdminNavbar />
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen flex flex-col items-center py-8">
                <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Trips</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search trips by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-lg py-2 px-4 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                        />
                    </div>
                    {filteredData.length > 0 ? (
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border-b border-gray-300 p-4 text-left">Trip Name</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Start Date</th>
                                    <th className="border-b border-gray-300 p-4 text-left">End Date</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Start Point</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Seats Available</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Created By</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Created At</th>
                                    <th className="border-b border-gray-300 p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.trip_id}>
                                        <td className="border-b border-gray-200 p-4">{item.trip_name}</td>
                                        <td className="border-b border-gray-200 p-4">{item.trip_start_date}</td>
                                        <td className="border-b border-gray-200 p-4">{item.end_date}</td>
                                        <td className="border-b border-gray-200 p-4">{item.trip_start_point}</td>
                                        <td className="border-b border-gray-200 p-4">{item.seats}</td>
                                        <td className="border-b border-gray-200 p-4">{item.created_by}</td>
                                        <td className="border-b border-gray-200 p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td className="border-b border-gray-200 p-4">
                                            <button
                                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 text-base font-medium"
                                                onClick={() => handleEdit(item.trip_id)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-lg text-gray-600">No past trips available.</p>
                    )}
                </div>
            </div>
        </div>

    );
}

export default Pasttrips;