import axios from "axios";
import React, { useState, useEffect } from "react";
import AdminNavbar from "../Dashboardnavbar/Dashboardnavbar";
const AddCarousals = () => {
  const [carousals, setCarousals] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const fetchCarousals = async () => {
      try {
        const response = await axios.get('https://admin.yeahtrips.in/gettheinformationsincorousals');
        if (Array.isArray(response.data)) {
          setCarousals(response.data);
        } else {
          console.error("Fetched data is not an array:", response.data);
        }
      } catch (error) {
        console.error("Error fetching carousals:", error);
      }
    };

    fetchCarousals();
  }, []);



  const handleAddCarousal = async () => {
    if (title && author) {
      const newCarousal = { title, author };


      try {
        // POST request with axios
        const response = await axios.post('https://admin.yeahtrips.in/carousaldatasdetailsinformation', newCarousal);
       
        if (response.status === 201) {
          setCarousals([...carousals, response.data]);
          setTitle(""); // Clear title input
          setAuthor(""); // Clear author input
        } else {
          console.error("Failed to add carousal", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };


  const handleDeleteCarousal = async (id) => {
    try {
      // Make the DELETE request with axios
      const response = await axios.delete(`https://admin.yeahtrips.in/carousaldatasdelete/${id}`);

      // Check if the request was successful (status code 200-299)
      if (response.status >= 200 && response.status < 300) {
        // Filter out the deleted carousal from the list
        setCarousals(carousals.filter(carousal => carousal.id !== id));
      } else {
        console.error("Failed to delete carousal", response.statusText);
      }
    } catch (error) {
      // Log any errors that occurred during the request
      console.error("Error:", error);
    }
  };


  return (
    <div>
      <div>
        <AdminNavbar />
      </div>
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-md mx-auto mt-6">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Add Carousals</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleAddCarousal}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Add Carousal
        </button>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Carousals List</h3>
          {carousals.length === 0 ? (
            <p className="text-gray-600">No carousals added yet.</p>
          ) : (
            <ul className="space-y-4">
              {carousals.map((carousal) => (
                <li key={carousal.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-300">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{carousal.title}</p>
                    <p className="text-gray-600">{carousal.author}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCarousal(carousal.id)}
                    className="text-red-600 hover:text-red-700 font-medium transition duration-200"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCarousals;
