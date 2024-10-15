import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserpasttripsDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTermPast, setSearchTermPast] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 15; // Number of trips per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          throw new Error('User not authenticated');
        }
  
        const response = await axios.get('https://admin.yeahtrips.in/userdashboard', {
          params: { user_id: userId }
        });
  
        console.log(response.data);
  
        // Ensure the response is an array or properly handle if it's not
        if (Array.isArray(response.data.trips)) {
          setTrips(response.data.trips);
        } else {
          console.error('Unexpected data format:', response.data);
          setTrips([]); // Set empty array to avoid future errors
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        setTrips([]); // Set empty array to handle error case
      } finally {
        setLoading(false);
      }
    };
  
    fetchTrips();
  }, []);
  

  const handleBack = () => {
    window.history.back();
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  const formatDate = (dateStr) => {
    const dateParts = dateStr.split(' ');
    const day = dateParts[0].replace(/[^0-9]/g, '');
    const month = new Date(Date.parse(dateParts[1] + " 1, 2021")).getMonth() + 1;
    const year = dateParts[2];
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  };

  const currentDate = new Date();
  const pastTrips = trips.filter(trip => new Date(formatDate(trip.trip_start_date)) < currentDate);

  const filteredPastTrips = pastTrips.filter(trip =>
    trip.trip_name.toLowerCase().includes(searchTermPast.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredPastTrips.slice(indexOfFirstTrip, indexOfLastTrip);

  const totalPages = Math.ceil(filteredPastTrips.length / tripsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Past Trips</h1>
        <button
          className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('role');
            navigate('/', { replace: true });
          }}
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

      {/* Past Trips */}
      {currentTrips.length > 0 ? (
          <>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Trip Name</th>
                  <th className="py-2 px-4 border-b text-left">Start Date</th>
                  <th className="py-2 px-4 border-b text-left">End Date</th>
                  <th className="py-2 px-4 border-b text-left">Start Point</th>
                </tr>
              </thead>
              <tbody>
                {currentTrips.map((trip) => (
                  <tr key={trip.trip_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{trip.trip_name}</td>
                    <td className="py-2 px-4 border-b">{trip.trip_start_date}</td>
                    <td className="py-2 px-4 border-b">{trip.end_date}</td>
                    <td className="py-2 px-4 border-b">{trip.trip_start_point}</td>
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
          </>
        ) : (
          <p className="text-center text-lg text-gray-600">No past trips assigned.</p>
        )}
      </div>
    
  );
}

export default UserpasttripsDashboard;
