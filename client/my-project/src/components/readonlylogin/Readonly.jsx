import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Readonly() {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('published'); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `https://admin.yeahtrips.in/alltrips?status=${view}`;
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
    navigate(`/edittrips`, { state: { trip_id } });
  };

  const handleViewToggle = () => {
    setView(view === 'published' ? 'trash' : 'published');
  };

  const handleLogout = () => {
    // Remove token and role from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    // Navigate to home page and replace the history entry
    navigate('/', { replace: true });
  };

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-600">Error: {error}</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Read Only Trips</h1>
        <button
          className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {datas.map((item) => (
            <div
              key={item.trip_id}
              className="relative bg-white rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
              style={{ height: '400px' }}
            >
              <div className="relative flex flex-col justify-between p-6 text-gray-800 bg-white h-full">
                <div className="flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.trip_name}</h2>
                  <div className="flex flex-col gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Starts From:</span>
                      <span>{item.trip_start_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Ends On:</span>
                      <span>{item.end_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Starts from:</span>
                      <span>{item.trip_start_point}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between space-x-2 mt-auto">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
                    onClick={() => handleEdit(item.trip_id)}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Readonly;
