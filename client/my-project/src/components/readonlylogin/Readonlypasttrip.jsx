import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './images/logo.svg'

function Readonlypastrips() {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('draft');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 15; // Number of trips per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `https://admin.yeahtrips.in/alltrips`;
        const response = await axios.get(url);
        setDatas(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response ? error.response.data : error.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  const handleEdit = (trip_id) => {
    navigate(`/${trip_id}`);
  };
  const handleLogoClick=()=>{
    navigate('/dashboardusersread')
    };
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  // Helper function to convert date string to a proper Date object
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split(' ');
    return new Date(`${month} ${day.replace(/\D/g, '')}, ${year}`);
  };

  // Filter only past trips
  const now = new Date();
  const pastTrips = datas.filter((trip) => parseDate(trip.trip_start_date) < now);

  // Filter past trips based on search query
  const filteredTrips = pastTrips.filter((trip) =>
    trip.trip_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-600">Error: {error}</p>;

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
      <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Past Trips</h1>
        <button
          className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button 
          onClick={handleBack} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
        >
          Back
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6">
        <input
          type="text"
          placeholder="Search by trip name..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Past Trips */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Past Trips</h2>
        <table className="table-auto w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Trip Name</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Start Point</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTrips.map((item) => (
              <tr key={item.trip_id}>
                <td className="border px-4 py-2">{item.trip_name}</td>
                <td className="border px-4 py-2">{item.trip_start_date}</td>
                <td className="border px-4 py-2">{item.end_date}</td>
                <td className="border px-4 py-2">{item.trip_start_point}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-1 px-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                    onClick={() => handleEdit(item.trip_id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Readonlypastrips;
