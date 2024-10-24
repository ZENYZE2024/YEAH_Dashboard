import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './images/logo.svg';


function UserDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTermFuture, setSearchTermFuture] = useState('');
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

        // Ensure trips is always an array
        setTrips(Array.isArray(response.data.trips) ? response.data.trips : []);
      } catch (error) {
        console.error('Error fetching trips:', error);
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
  const handleLogoClick=()=>{
    navigate('/userdashboard')
    };
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const formatDate = (dateStr) => {
    const dateParts = dateStr.split(' ');
    const day = dateParts[0].replace(/[^0-9]/g, '');
    const month = new Date(Date.parse(dateParts[1] + " 1, 2021")).getMonth() + 1;
    const year = dateParts[2];
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  };

  const currentDate = new Date();

  // Ensure trips is an array before applying .filter
  const futureTrips = Array.isArray(trips) ? trips.filter(trip => new Date(formatDate(trip.trip_start_date)) >= currentDate) : [];

  const filteredFutureTrips = futureTrips.filter(trip =>
    trip.trip_name.toLowerCase().includes(searchTermFuture.toLowerCase())
  );

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
      <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Upcoming Trips</h1>
        <button
          className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Trips</h2>
        <input
          type="text"
          placeholder="Search Upcoming Trips"
          value={searchTermFuture}
          onChange={(e) => setSearchTermFuture(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded-lg"
        />
        {filteredFutureTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredFutureTrips.map((trip) => (
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
        ) : (
          <p className="text-center text-lg text-gray-600">No trips assigned</p>
        )}
      </div>


      <button
        className="bg-gradient-to-r from-green-500 to-green-700 text-white py-2 px-6 rounded-lg shadow-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300"
        onClick={() => navigate('/userpasttrips')}
      >
        View Past Trips
      </button>
    </div>
  );
}

export default UserDashboard;
