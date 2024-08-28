import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Supervisor() {
  const [trips, setTrips] = useState([]);
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
      return payload.userId; // Adjust if your token uses a different key
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  };

  const handleEdit = (trip_id) => {
    navigate(`/edittrips`, { state: { trip_id } });
  };

  const handleLogout = () => {
    // Remove token and role from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    // Navigate to home page and replace the history entry
    navigate('/', { replace: true });
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Supervised Trips</h1>
        <button
          className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg">
        {error ? (
          <p className="text-center text-lg text-gray-600">No trips assigned</p>
        ) : (
          <>
            {trips.length === 0 ? (
              <p className="text-center text-lg text-gray-600">No trips assigned</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {trips.map((trip) => (
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
          </>
        )}
      </div>
    </div>
  );
}

export default Supervisor;
