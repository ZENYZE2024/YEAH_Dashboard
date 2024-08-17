import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Edittrips() {
  const [tripDetails, setTripDetails] = useState(null);
  const [tripItinerary, setTripItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsResponse, itineraryResponse] = await Promise.all([
          axios.get("https://admin.yeahtrips.in/edittrips", {
            params: { trip_id: location.state.trip_id },
          }),
          axios.get("https://admin.yeahtrips.in/tripitenary", {
            params: { trip_id: location.state.trip_id },
          })
        ]);

        setTripDetails(detailsResponse.data[0]); 
        setTripItinerary(itineraryResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trip details or itinerary:", error);
        setError(
          error.response ? error.response.data : error.message || "Error fetching data"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state.trip_id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditItineraryToggle = () => {
    setIsEditingItinerary(!isEditingItinerary);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripDetails({
      ...tripDetails,
      [name]: value,
    });
  };

  const handleItineraryChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItinerary = [...tripItinerary];
    updatedItinerary[index] = {
      ...updatedItinerary[index],
      [name]: value,
    };
    setTripItinerary(updatedItinerary);
  };

  const handleSave = async () => {
    try {
      await axios.put("https://admin.yeahtrips.in/updatetrip", tripDetails); 
      setIsEditing(false);
      alert('Trip details updated successfully!');
    } catch (error) {
      console.error("Error saving trip details:", error);
      alert('Failed to update trip details.');
    }
  };

  const handleSaveItinerary = async () => {
    try {
      await axios.put("https://admin.yeahtrips.in/updatetinerary", tripItinerary); 
      setIsEditingItinerary(false);
      alert('Trip itinerary updated successfully!');
    } catch (error) {
      console.error("Error saving trip itinerary:", error);
      alert('Failed to update trip itinerary.');
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;

  const imageUrl = tripDetails?.file_path ? `http://betayeah.yeahtrips.in${tripDetails.file_path.replace(/\\/g, '/')}` : '';

//   const formatDate = (date) => {
//     const options = { day: 'numeric', month: 'long', year: 'numeric' };
//     return new Date(date).toLocaleDateString(undefined, options);
//   };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
      {tripDetails && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-2">
            {isEditing ? (
              <input
                type="text"
                name="trip_name"
                value={tripDetails.trip_name}
                onChange={handleInputChange}
                className="border rounded w-full p-2"
              />
            ) : (
              tripDetails.trip_name
            )}
          </h1>

          {imageUrl && (
            <div className="mb-6">
              {isEditing ? (
                <input
                  type="text"
                  name="file_path"
                  value={tripDetails.file_path}
                  onChange={handleInputChange}
                  className="border rounded w-full p-2 mb-2"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Trip"
                  className="w-full h-auto max-h-80 object-cover rounded"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              {renderDetail("Trip Code", "trip_code", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Slug", "slug", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Cost", "cost", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Seats Available", "seats", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Start Date", "trip_start_date", tripDetails, isEditing, handleInputChange)}
              {renderDetail("End Date", "end_date", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Start Point", "trip_start_point", tripDetails, isEditing, handleInputChange)}
              {renderDetail("End Point", "trip_end_point", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Destination", "destination", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Duration", "trip_duration", tripDetails, isEditing, handleInputChange)}
            </div>
            <div className="space-y-2">
              {renderDetail("Traveller Type", "traveller_type", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Tags", "TAG_ID", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Status", "status", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Link", "link", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Profile Mode", "profile_mode", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Inclusion", "inclusion", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Exclusion", "exclusion", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Points to Note", "points_to_note", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Trip Type", "trip_type", tripDetails, isEditing, handleInputChange)}
              {renderDetail("Seat Type", "seat_type", tripDetails, isEditing, handleInputChange)}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
              >
                Save
              </button>
            ) : null}
            <button
              onClick={handleEditToggle}
              className={`${
                isEditing ? "bg-red-500" : "bg-blue-500"
              } text-white px-4 py-2 rounded shadow hover:bg-opacity-75`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <hr className="my-8" />

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Itinerary</h2>

          <div className="space-y-4">
            {tripItinerary.map((item, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
                {isEditingItinerary ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-gray-600">Date:</label>
                      <input
                        type="text"
                        name="DATE"
                        value={item.DATE || ''}
                        onChange={(e) => handleItineraryChange(index, e)}
                        className="border rounded w-32 p-2"
                        // placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <input
                      type="text"
                      name="DAY_TITLE"
                      value={item.DAY_TITLE}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="border rounded w-full p-2"
                      placeholder="Day Title"
                    />
                    <textarea
                      name="DAY_DESCRIPTION"
                      value={item.DAY_DESCRIPTION}
                      onChange={(e) => handleItineraryChange(index, e)}
                      className="border rounded w-full p-2"
                      placeholder="Day Description"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-bold">Date: {item.DATE}</p>
                    <p className="text-lg font-semibold">{item.DAY_TITLE}</p>
                    <p>{item.DAY_DESCRIPTION}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            {isEditingItinerary ? (
              <button
                onClick={handleSaveItinerary}
                className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
              >
                Save
              </button>
            ) : null}
            <button
              onClick={handleEditItineraryToggle}
              className={`${
                isEditingItinerary ? "bg-red-500" : "bg-blue-500"
              } text-white px-4 py-2 rounded shadow hover:bg-opacity-75`}
            >
              {isEditingItinerary ? "Cancel" : "Edit Itinerary"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function renderDetail(label, name, details, isEditing, handleChange) {
  return (
    <div className="mb-2">
      <label className="block text-gray-700 font-semibold">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={details[name]}
          onChange={handleChange}
          className="border rounded w-full p-2"
        />
      ) : (
        <p>{details[name]}</p>
      )}
    </div>
  );
}

export default Edittrips;
