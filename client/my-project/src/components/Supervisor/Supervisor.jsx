import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Supervisor() {
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State to hold the search query
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const userId = getUserIdFromToken();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        const response = await axios.get('https://admin.yeahtrips.in/supervisordashboard', {
          params: { user_id: userId }
        });
        setTrips(response.data);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

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

  const handleEdit = (trip_id) => {
    navigate(`/${trip_id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const handleAddTripsClick = () => {
    navigate('/addtrips');
  };

  const handlePastTripsClick = () => {
    navigate('/supervisorpasttrips');
  };

  const parseTripDate = (dateString) => {
    const normalizedDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1'); // Remove the suffix
    return new Date(Date.parse(normalizedDate));
  };

  const currentDate = new Date();
  const upcomingTrips = trips.filter(trip => parseTripDate(trip.trip_start_date) >= currentDate);

  const filteredTrips = upcomingTrips.filter((trip) =>
    trip.trip_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Supervised Trips</h1>
        <div className="flex space-x-4">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            onClick={handleAddTripsClick}
          >
            Add Trips
          </button>
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            onClick={handlePastTripsClick}
          >
            Past Trips
          </button>
          <button
            className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6">
        <input
          type="text"
          placeholder="Search by trip name"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Upcoming Trips Section */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Trips</h2>
        {filteredTrips.length === 0 ? (
          <p className="text-center text-lg text-gray-600">No trips found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip.trip_id}
                className="relative bg-white rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
                style={{ height: '400px' }}
              >
                <div className="relative flex flex-col justify-between p-6 text-gray-800 bg-white h-full">
                  <div className="flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{trip.trip_name}</h2>
                    <div className="flex flex-col gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Starts From:</span>
                        <span>{trip.trip_start_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Ends On:</span>
                        <span>{trip.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Starts from:</span>
                        <span>{trip.trip_start_point}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between space-x-2 mt-auto">
                    <button
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                      onClick={() => handleEdit(trip.trip_id)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Supervisor;
