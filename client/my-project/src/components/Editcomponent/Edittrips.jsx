import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function Edittrips() {
  const [tripDetails, setTripDetails] = useState(null);
  const [tripItinerary, setTripItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [role, setRole] = useState(""); 
  useEffect(() => {
    const fetchData = async () => {

      const storedRole = localStorage.getItem('role');
        setRole(storedRole);
      try {
        const [detailsResponse, itineraryResponse,bookings] = await Promise.all([
          axios.get("https://admin.yeahtrips.in/edittrips", {
            params: { trip_id: location.state.trip_id },
          }),
          axios.get("https://admin.yeahtrips.in/tripitenary", {
            params: { trip_id: location.state.trip_id },
          }),
          axios.get("https://admin.yeahtrips.in/getbookingdetails",{
            params: { trip_id: location.state.trip_id },

          })
        ]);

        setTripDetails(detailsResponse.data[0]);
        setTripItinerary(itineraryResponse.data);
        setBookings(bookings.data)
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

 

  const convertToVCF = (data) => {
    let vcfString = "";
    data.forEach((contact) => {
      vcfString += "BEGIN:VCARD\n";
      vcfString += "VERSION:3.0\n";
      vcfString += `Full Name: ${contact.fullname}\n`;
      vcfString += `Age: ${contact.age}\n`;
      vcfString += `Booking ID: ${contact.booking_id}\n`;
      vcfString += `City: ${contact.city}\n`;
      vcfString += `Email: ${contact.email}\n`;
      vcfString += `Member State: ${contact.member_state}\n`;
      vcfString += `Order ID: ${contact.order_id}\n`;
      vcfString += `Phone Number: ${contact.phonenumber}\n`;
      vcfString += `Trip ID: ${contact.trip_id}\n`;
      vcfString += `WhatsApp Number: ${contact.whatsappnumber}\n`;
      vcfString += "END:VCARD\n";
    });
    return vcfString;
  };

  // Function to convert table data to CSV format
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `${value}`)
        .join(",")
    );
    return headers + rows.join("\n");
  };

  // Function to convert table data to Excel format
  const convertToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  };

  // Handle download based on selected format
  const handleDownload = (format) => {
    if (format === "VCF") {
      const vcfData = convertToVCF(bookings);
      const blob = new Blob([vcfData], { type: "text/vcard" });
      saveAs(blob, "contacts.vcf");
    } else if (format === "CSV") {
      const csvData = convertToCSV(bookings);
      const blob = new Blob([csvData], { type: "text/csv" });
      saveAs(blob, "contacts.csv");
    } else if (format === "Excel") {
      const excelData = convertToExcel(bookings);
      const blob = new Blob([excelData], { type: "application/octet-stream" });
      saveAs(blob, "contacts.xlsx");
    }
  };

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

  const imageUrl = tripDetails?.file_path ? `https://betayeah.yeahtrips.in{tripDetails.file_path.replace(/\\/g, '/')}` : '';



  return (
    <div>
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
              {role !== 'Read-Only' && role !== 'User' && (
              <button
                onClick={handleEditToggle}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {isEditing ? "Cancel Edit" : "Edit"}
              </button>
            )}

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
             {role !== 'Read-Only' && role !== 'User'&&(
               <button
               onClick={handleEditItineraryToggle}
               className={`${isEditingItinerary ? "bg-red-500" : "bg-blue-500"
                 } text-white px-4 py-2 rounded shadow hover:bg-opacity-75`}
             >
               {isEditingItinerary ? "Cancel" : "Edit Itinerary"}
             </button>
             )}
            </div>
          </>
        )}


      </div>

      <div>
        <div>
          <h1 className="text-center font-extrabold  max-w-4xl mx-auto mt-8 text-2xl">BOOKINGS</h1>
          <div className="ml-8">
            <label htmlFor="download-format" className="text-blue-700  ">Download as: </label>
            <select
              id="download-format"
              onChange={(e) => handleDownload(e.target.value)}
              className="border  border-2 border-gray-400"
            >
              <option value="">Select format</option>
              <option value="VCF">VCF</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
            </select>
          </div>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whatsapp Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((item) => (
                <tr key={item.trip_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.booking_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.order_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.fullname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.age}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.phonenumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.whatsappnumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.member_state}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
      <h1 className="text-center font-extrabold  max-w-4xl mx-auto mt-8 text-2xl">CANCELATIONS</h1>

      </div>
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


{/* <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Itinerary</h2>

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
    className={`${isEditingItinerary ? "bg-red-500" : "bg-blue-500"
      } text-white px-4 py-2 rounded shadow hover:bg-opacity-75`}
  >
    {isEditingItinerary ? "Cancel" : "Edit Itinerary"}
  </button>
</div>
</>
)}


</div> */}