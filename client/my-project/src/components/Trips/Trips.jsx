import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Trips() {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('published'); // Default view to 'published'
  const [searchTerm, setSearchTerm] = useState('');
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
        setError(error.response ? error.response.data : error.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  const handleEdit = (trip_id) => {
    navigate(`/${trip_id}`);
  };

  const handleDelete = async (trip_id) => {
    try {
      await axios.put(`https://admin.yeahtrips.in/deletetrips/${trip_id}`);
      setDatas((prevDatas) => prevDatas.filter((item) => item.trip_id !== trip_id));
    } catch (error) {
      setError(error.response ? error.response.data : error.message || 'Error deleting trip');
    }
  };

  const handleViewToggle = () => {
    setView(view === 'published' ? 'trash' : 'published');
  };



  // Helper function to parse dates
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split(' ');
    const monthMap = {
      'January': '01',
      'February': '02',
      'March': '03',
      'April': '04',
      'May': '05',
      'June': '06',
      'July': '07',
      'August': '08',
      'September': '09',
      'October': '10',
      'November': '11',
      'December': '12',
    };
    const formattedDate = `${year}-${monthMap[month]}-${day.replace(/\D/g, '')}`;
    return new Date(formattedDate);
  };

  const currentDate = new Date();
  const filteredData = datas.filter((trip) =>
    trip.trip_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingTrips = filteredData.filter((trip) => parseDate(trip.trip_start_date) >= currentDate);

  const Bookedseats = (datas.totalseatss) - (datas.seats)

  if (loading) return <p className="text-center text-lg text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-600">Error: {error}</p>;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen flex flex-col items-center py-8">
      
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-between items-center border-b border-gray-200">
        <button
          className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-300 text-base font-medium"
          onClick={handleViewToggle}
        >
          {view === 'published' ? 'View Trash' : 'View Published'}
        </button>
        <div className="bg-white w-[50vw] max-w-screen-xl p-6 rounded-lg shadow-lg mb-6 flex justify-center items-center">
          <input
            type="text"
            placeholder="Search trips by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
          />
        </div>

        <button
          className="bg-gradient-to-r from-purple-400 to-purple-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-purple-500 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-300 text-base font-medium"
          onClick={() => navigate('/pasttrips')}
        >
          View Past Trips
        </button>
      </div>

      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {view === 'published' ? 'Upcoming Trips' : 'Trash'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {upcomingTrips.length > 0 ? (
            upcomingTrips.map((item) => {
              const totalSeats = item.totalseats || 0;
              const seatsbooked = item.seats;
              const seatsleft = (totalSeats) - (seatsbooked)
              const percentageLeft = (seatsleft / totalSeats) * 100;

              let bgColor = 'bg-white';
              let seatsBgColor = 'bg-gray-300';
              let borderColor = 'border-gray-200';
              if (percentageLeft < 50) {
                bgColor = 'bg-red-200';
                seatsBgColor = 'bg-red-100';
                borderColor = 'border-red-300';
              } else if (percentageLeft < 75) {
                bgColor = 'bg-blue-200';
                seatsBgColor = 'bg-blue-100';
                borderColor = 'border-blue-300';
              } else {
                bgColor = 'bg-green-200';
                seatsBgColor = 'bg-green-100';
                borderColor = 'border-green-300';
              }

              return (
                <div
                  key={item.trip_id}
                  className={`relative rounded-lg overflow-hidden shadow-lg border ${borderColor} transition-transform transform hover:scale-105 hover:shadow-xl ${bgColor}`}
                  style={{ height: 'auto' }}
                >
                  <div className="relative flex flex-col justify-between p-6 text-gray-800 bg-white h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.trip_name}</h3>
                    <div className="flex flex-col gap-3 text-sm text-gray-700 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Starts From:</span>
                        <span>{item.trip_start_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Ends On:</span>
                        <span>{item.end_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Starts from:</span>
                        <span>{item.trip_start_point}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${seatsBgColor} p-3 rounded-md`}>
                        <span className="font-semibold text-gray-800">Seats Available:</span>
                        <span>{seatsleft}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${seatsBgColor} p-3 rounded-md`}>
                        <span className="font-semibold text-gray-800">Seats Booked:</span>
                        <span>{seatsbooked}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Created By:</span>
                        <span>{item.created_by}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">Created At:</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between space-x-2 mt-auto">
                      <button
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300 text-base font-medium"
                        onClick={() => handleEdit(item.trip_id)}
                      >
                        View
                      </button>
                      <button
                        className="bg-gradient-to-r from-red-400 to-red-600 text-white py-2 px-4 rounded-lg shadow-lg hover:from-red-500 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300 text-base font-medium"
                        onClick={() => handleDelete(item.trip_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-lg text-gray-600">
              {view === 'trash' ? 'No items in trash.' : 'No upcoming trips available.'}
            </p>)}
        </div>
      </div>
    </div>
  );
}

export default Trips;
