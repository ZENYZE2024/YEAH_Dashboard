import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function Alltrips() {
  const [datas, setDatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get('https://admin.yeahtrips.in/alltrips');
        console.log(response.data)
        setDatas(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response ? error.response.data : error.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (trip_id) => {
    navigate(`/edittrips`, { state: { trip_id } });
  }

  const handleDelete=async (trip_id)=>{
    try {
      const response =await axios.delete(`https://admin.yeahtrips.in/deletetrips/${trip_id}`);

      setDatas((prevDatas) => prevDatas.filter((item) => item.trip_id !== trip_id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError(error.response ? error.response.data : error.message || 'Error deleting trip');
    }
  }

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gradient-to-br from-[#ffede8] via-[#FFFFFF] to-[#FFFFFF] min-h-screen flex flex-col items-center py-8">
      <div className="bg-white w-full max-w-screen-xl p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {datas.map((item) => (
            <div
              key={item.trip_id}
              className="relative bg-white rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105"
            >
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={`https://betayeah.yeah.in${item.file_path}`}
                  alt={item.trip_name}
                  className="object-cover"
                  style={{ width: '100%', height: '200px' }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
              </div>
              <div className="relative flex flex-col justify-end p-4 text-white bg-gradient-to-t from-black to-transparent">
                <h2 className="text-sm font-bold mb-1 break-words">{item.trip_name}</h2>
                <div className="flex flex-col gap-1 text-xs break-words mb-3">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Starts From:</span>
                    <span>{item.trip_start_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Ends On:</span>
                    <span>{item.end_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Starts from:</span>
                    <span>{item.trip_start_point}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2 space-x-2">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"  onClick={() => handleEdit(item.trip_id)} >
                 View
                  </button>
                  <button className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition duration-300" onClick={()=>handleDelete(item.trip_id)}>
                    Delete
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

export default Alltrips;
