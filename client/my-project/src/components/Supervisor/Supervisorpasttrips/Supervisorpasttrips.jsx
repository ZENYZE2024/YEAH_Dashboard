import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Supervisorpasttrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const handleAddTripsClick = () => {
    navigate('/addtrips');
  };

  const parseTripDate = (dateString) => {
    const normalizedDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
    return new Date(Date.parse(normalizedDate));
  };

  const currentDate = new Date();
  const pastTrips = trips.filter(trip => parseTripDate(trip.trip_start_date) < currentDate);

  // Filter trips based on the search term
  const filteredTrips = pastTrips.filter(trip =>
    trip.trip_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Supervised Past Trips</h1>
        <div className="flex space-x-4">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            onClick={handleAddTripsClick}
          >
            Add Trips
          </button>
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
      </div>

      {/* Search input */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search trips by name"
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Past Trips Section */}
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Past Trips</h2>
        {filteredTrips.length === 0 ? (
          <p className="text-center text-lg text-gray-600">No past trips found</p>
        ) : (
          <table className="table-auto w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Trip Name</th>
                <th className="px-4 py-2">Start Date</th>
                <th className="px-4 py-2">End Date</th>
                <th className="px-4 py-2">Start Point</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.trip_id} className="border-t">
                  <td className="px-4 py-2">{trip.trip_name}</td>
                  <td className="px-4 py-2">{trip.trip_start_date}</td>
                  <td className="px-4 py-2">{trip.end_date}</td>
                  <td className="px-4 py-2">{trip.trip_start_point}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Supervisorpasttrips;