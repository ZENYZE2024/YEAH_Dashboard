import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { format } from 'date-fns';
import * as XLSX from "xlsx";
import AdminNavbar from "../Dashboardnavbar/Dashboardnavbar";
function Edittrips() {
  const { trip_id } = useParams();
  const [tripDetails, setTripDetails] = useState(null);
  const [tripItinerary, setTripItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const [role, setRole] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const [editedPolicy, setEditedPolicy] = useState(null);
  const [cancellationPolicies, setCancellationPolicies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {

      console.log(trip_id)
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      try {
        const [detailsResponse, itineraryResponse, bookingsResponse, cancellationsresponse, coordinatorsResponse, cancellationPoliciesResponse] = await Promise.all([
          axios.get(`https://admin.yeahtrips.in/editdetailstrips/${trip_id}`),

          axios.get(`https://admin.yeahtrips.in/tripitenary/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/getbookingdetails/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/cancellations/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/getcoordinatordetails/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/cancellationpolicies/${trip_id}`)
        ]);

        setTripDetails(detailsResponse.data[0]);
        setTripItinerary(Array.isArray(itineraryResponse.data) ? itineraryResponse.data : []);
        setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
        setCancellations(Array.isArray(cancellationsresponse.data) ? cancellationsresponse.data : []);
        setCoordinators(Array.isArray(coordinatorsResponse.data) ? coordinatorsResponse.data : []);
        setCancellationPolicies(Array.isArray(cancellationPoliciesResponse.data) ? cancellationPoliciesResponse.data : []);

        console.log("Trip Details:", detailsResponse.data);
        console.log("Trip Itinerary:", itineraryResponse.data);
        console.log("Bookings:", bookings);
        console.log("cancellation", cancellations);
        console.log("Coordinators:", coordinatorsResponse.data);

      } catch (error) {
        console.error("Error fetching trip details or itinerary:", error);
        setError(error.response?.data || error.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
    };
  }, [trip_id]);

  const [isEditingcordinators, setIsEditingcordinators] = useState(false);
  const [editedCoordinator, setEditedCoordinator] = useState({});

  const handleEditcordinatorClick = (index) => {
    setIsEditingcordinators(index);  // Set the index of the coordinator being edited
    setEditedCoordinator(coordinators[index]);  // Initialize with current values
  };

  const handleInputcordinatorChange = (e) => {
    const { name, value } = e.target;
    setEditedCoordinator((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSaveChanges = async (coordinatorId) => {
    setLoading(true); // Start loading

    try {
      // Create a FormData object
      const formData = new FormData();

      // Append other fields
      formData.append('name', editedCoordinator.name);
      formData.append('role', editedCoordinator.role);
      formData.append('email', editedCoordinator.email);
      formData.append('link', editedCoordinator.link);
      formData.append('profile_mode', editedCoordinator.profile_mode);

      // Append the image file if available
      if (selectedImage) { // Ensure selectedImage is the file object
        formData.append('image', selectedImage);
      }

      // Debugging: Check the FormData contents (optional)
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Sending the PUT request to update the coordinator
      const response = await axios.put(`https://admin.yeahtrips.in/update-coordinator/${trip_id}/${coordinatorId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Debugging: Log response data
      console.log('Response:', response.data);

      // Handle successful update
      alert('Coordinator updated successfully');

      // Refresh the page to reflect the latest data
      window.location.reload();

    } catch (err) {
      console.error('Error updating coordinator:', err);
      setError('Failed to update coordinator');
    } finally {
      setLoading(false); // Stop loading
    }
  };



  // Example function to update local state


  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const [isEditingcancellationpolicy, setIsEditingcancellationpolicy] = useState(false);
  const handleEditPolicyClick = (index) => {
    setIsEditingcancellationpolicy(index);
    setEditedPolicy({ ...cancellationPolicies[index] });
  };

  const handleInputPolicyChange = (event) => {
    const { name, value } = event.target;
    setEditedPolicy(prevState => ({ ...prevState, [name]: value }));
  };


  const handleSavePolicyChanges = async (policyId) => {
    setLoading(true);
    setError(null);

    try {
      // Debugging: Check the values before sending the request
      console.log('Saving policy changes:', {
        policy_startdate: editedPolicy.policy_startdate,
        policy_endDate: editedPolicy.policy_endDate,
        fee: editedPolicy.fee,
        cancellationType: editedPolicy.cancellationType,
      });

      const response = await axios.put(`https://admin.yeahtrips.in/update-cancellation-policy/${policyId}`, {
        trip_id,
        policy_startdate: editedPolicy.policy_startdate,
        policy_endDate: editedPolicy.policy_endDate,
        fee: editedPolicy.fee,
        cancellationType: editedPolicy.cancellationType,
      });

      console.log('Response:', response.data); // Debugging: Log response data

      // Handle successful update
      alert('Cancellation policy updated successfully');
      window.location.reload();
    } catch (err) {
      console.error('Error updating cancellation policy:', err);
      setError('Failed to update cancellation policy');
    } finally {
      setLoading(false);
    }
  };




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

  const handleDownload = (format, isCancellation = false) => {
    const tripcode = tripDetails.trip_code;
    const trip_name = tripDetails.trip_name;
    const fileName = `YH-${tripcode}-${trip_name}`;

    const data = isCancellation ? cancellations : bookings; // Select data source
    let blob;

    if (format === "VCF") {
      const vcfData = convertToVCF(data);
      blob = new Blob([vcfData], { type: "text/vcard" });
      saveAs(blob, `${fileName}.vcf`);
    } else if (format === "CSV") {
      const csvData = convertToCSV(data);
      blob = new Blob([csvData], { type: "text/csv" });
      saveAs(blob, `${fileName}.csv`);
    } else if (format === "Excel") {
      const excelData = convertToExcel(data);
      blob = new Blob([excelData], { type: "application/octet-stream" });
      saveAs(blob, `${fileName}.xlsx`);
    }

    if (blob) {
      setTimeout(() => {
        URL.revokeObjectURL(blob);
      }, 100);
    }
  };



  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTripDetails({
      ...tripDetails,
      [name]: value,
    });
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update the tripDetails object to store the new image file
      setTripDetails((prevDetails) => ({
        ...prevDetails,
        new_image_file: file, // Store the file for uploading later
      }));
    }
  };

  // const handleItineraryChange = (index, e) => {
  //   const { name, value } = e.target;
  //   const updatedItinerary = [...tripItinerary];
  //   updatedItinerary[index] = {
  //     ...updatedItinerary[index],
  //     [name]: value,
  //   };
  //   setTripItinerary(updatedItinerary);
  // };

  const handleSave = async () => {
    try {
      // Create a new FormData object to handle file and text data
      const formData = new FormData();

      // Append all trip details to the FormData object
      formData.append("trip_name", tripDetails.trip_name);
      formData.append("trip_description", tripDetails.trip_description);
      formData.append("trip_code", tripDetails.trip_code);
      formData.append("slug", tripDetails.slug);
      formData.append("cost", tripDetails.cost);
      formData.append("seats", tripDetails.seats);
      formData.append("trip_start_date", tripDetails.trip_start_date);
      formData.append("end_date", tripDetails.end_date);
      formData.append("trip_start_point", tripDetails.trip_start_point);
      formData.append("trip_end_point", tripDetails.trip_end_point);
      formData.append("destination", tripDetails.destination);
      formData.append("trip_duration", tripDetails.trip_duration);
      formData.append("whatsapplink", tripDetails.whatsapplink);
      formData.append("traveller_type", tripDetails.traveller_type);
      formData.append("inclusion", tripDetails.inclusion);
      formData.append("exclusion", tripDetails.exclusion);
      formData.append("points_to_note", tripDetails.points_to_note);
      formData.append("trip_type", tripDetails.trip_type);
      formData.append("seat_type", tripDetails.seat_type);
      formData.append("trip_id", tripDetails.trip_id);
      // Check if a new image was selected and append it to the form data
      if (tripDetails.new_image_file) {
        formData.append("trip_image", tripDetails.new_image_file);
      }

      // Make the PUT request to update trip details along with the image
      await axios.put("https://admin.yeahtrips.in/updatetrip", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsEditing(false); // Exit edit mode after successful save
      alert('Trip details updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Error saving trip details:", error);
      alert('Failed to update trip details.');
    }
  };

  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [selectedItineraryImages, setSelectedItineraryImages] = useState({});

  // Function to handle when the "Edit" button is clicked
  const handleEditDay = (index) => {
    setEditingDayIndex(index); // Set the day being edited
  };

  const handleItineraryImageChange = (event, dayIndex) => {
    const file = event.target.files[0];
    setSelectedItineraryImages((prevImages) => ({
      ...prevImages,
      [dayIndex]: file,  // Store the selected image for that specific day
    }));
  };

  // Function to handle changes in itinerary inputs
  const handleItineraryChange = (index, event) => {
    const { name, value } = event.target;
    // Update the itinerary item with new values
    setTripItinerary((prevItinerary) => {
      const updatedItinerary = [...prevItinerary];
      updatedItinerary[index] = { ...updatedItinerary[index], [name]: value };
      return updatedItinerary;
    });
  };

  // Function to save changes for a specific day
  const handleSaveDay = async (dayIndex) => {
    const item = tripItinerary[dayIndex];

    // Ensure trip_id is available (either from state or props)
    const tripId = item.TRIP_ID;  // Or however you are storing or passing trip_id

    if (!item) {
      console.error(`No itinerary found for dayIndex ${dayIndex}`);
      return;
    }

    const formData = new FormData();

    // Append itinerary details for the specific day
    formData.append('DATE', item.DATE);
    formData.append('DAY_TITLE', item.DAY_TITLE);
    formData.append('DAY_DESCRIPTION', item.DAY_DESCRIPTION);
    formData.append('TRIP_ID', tripId); // Append trip_id
    formData.append('DAY', dayIndex + 1);  // Append day (index)

    // Append the image for the specific day, if one was selected
    if (selectedItineraryImages[dayIndex]) {
      formData.append('image', selectedItineraryImages[dayIndex]);
    }

    try {
      await axios.put(`https://admin.yeahtrips.in/updatetinerary/${dayIndex}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Trip itinerary day updated successfully!');
      setEditingDayIndex(null);  // Reset the editing state
      window.location.reload();
    } catch (error) {
      console.error("Error updating trip itinerary day:", error);
      alert('Failed to update trip itinerary day.');
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;

  const handleCancelEdit = () => {
    // Reset the edited coordinator state or set isEditingcordinators to null/none
    setIsEditingcordinators(null); // or set to a different value if needed
    setEditedCoordinator({}); // Reset editedCoordinator state if needed
  };


  const handleEditItineraryToggle = () => {
    setIsEditingItinerary(!isEditingItinerary);
    setEditingDayIndex(null);  // Reset editing day when toggling edit mode
  };
  const formatDetails = (details) => {
    return details.split('. ').map((item, index) => (
      <div key={index}>{item.trim()}.</div>
    ));
  };



  return (
    <div>
      <div>
        <AdminNavbar />
      </div>
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

            {isEditing ? (
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="trip_image">
                  Upload New Image:
                </label>
                <input
                  type="file"
                  id="trip_image"
                  name="trip_image"
                  accept="image/*"
                  onChange={handleFileChange} // Add a file change handler
                  className="border rounded w-full p-2"
                />
              </div>
            ) : (
              tripDetails.file_path && (
                <img
                  src={`https://admin.yeahtrips.in${tripDetails.file_path}`}
                  alt={tripDetails.trip_name}
                  className="w-full h-auto mb-6"
                />
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                {renderDetail("trip_description", "trip_description", tripDetails, isEditing, handleInputChange)}
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
                {renderDetail("whatsapplink", "whatsapplink", tripDetails, isEditing, handleInputChange)}
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
              {tripItinerary.length > 0 ? (
                tripItinerary.map((item, index) => {
                  // Correct the image path format (if image exists)
                  const correctedImagePath = item.DAY_IMG ? item.DAY_IMG.replace(/\\/g, '/') : '';
                  console.log(`Trip Itinerary Day ${item.DAY} - Image Path: ${correctedImagePath}`);

                  return (
                    <div key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
                      {editingDayIndex === index ? (
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

                            {correctedImagePath && (
                              <img
                                src={`https://admin.yeahtrips.in${correctedImagePath}`}
                                alt={`Day ${item.DAY} Image`}
                                onError={(e) => {
                                  e.target.onerror = null; // Prevents infinite loop if the image fails to load
                                  e.target.src = '/path/to/placeholder-image.jpg'; // Placeholder if image fails
                                }}
                                style={{ width: '50vw', height: '30vh', objectFit: 'cover' }}
                              />
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleItineraryImageChange(event, index)}
                              className="border rounded w-full p-2 mt-2"
                            />
                          </div>

                          {/* Day Title input */}
                          <input
                            type="text"
                            name="DAY_TITLE"
                            value={item.DAY_TITLE || ''}
                            onChange={(e) => handleItineraryChange(index, e)}
                            className="border rounded w-full p-2"
                            placeholder="Day Title"
                          />

                          {/* Day Description textarea */}
                          <textarea
                            name="DAY_DESCRIPTION"
                            value={item.DAY_DESCRIPTION || ''}
                            onChange={(e) => handleItineraryChange(index, e)}
                            className="border rounded w-full p-2"
                            placeholder="Day Description"
                          />

                          {/* Save button for the specific day */}
                          <button
                            onClick={() => handleSaveDay(index)}
                            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-bold">Date: {item.DATE}</p>
                          <p className="text-lg font-semibold">{item.DAY_TITLE}</p>
                          <p>{item.DAY_DESCRIPTION}</p>

                          {/* Show image if present */}
                          {item.DAY_IMG && (
                            <img
                              src={`https://admin.yeahtrips.in${correctedImagePath}`}
                              alt={`Itinerary for day ${index + 1}`}
                              style={{ width: '50vw', height: '30vh', objectFit: 'cover' }}
                            />
                          )}

                          {/* Edit button */}
                          {role !== 'Read-Only' && role !== 'User' && (
                            <button
                              onClick={() => handleEditDay(index)}
                              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600">No itinerary available for this trip.</p>
              )}
            </div>

          </>
        )}


      </div>
      <div>
        <h1 className="text-center font-extrabold max-w-4xl mx-auto mt-8 text-2xl">TEAM</h1>
        <div className="p-6">
          {coordinators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coordinators.map((coordinator, index) => (
                <div key={coordinator.cordinator_id} className="bg-gray-100 p-4 rounded-md shadow-sm">
                  <img
                    src={`https://admin.yeahtrips.in${coordinator.image}`}
                    alt={coordinator.name}
                    className="w-24 h-24 rounded-full mx-auto"
                  />
                  {isEditingcordinators === index ? (
                    <div>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, coordinator.cordinator_id)}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                      />

                      <input
                        type="text"
                        name="name"
                        value={editedCoordinator.name || ''}
                        onChange={handleInputcordinatorChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        name="role"
                        value={editedCoordinator.role || ''}
                        onChange={handleInputcordinatorChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Role"
                      />
                      <input
                        type="text"
                        name="email"
                        value={editedCoordinator.email || ''}
                        onChange={handleInputcordinatorChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        name="link"
                        value={editedCoordinator.link || ''}
                        onChange={handleInputcordinatorChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Link"
                      />
                      <select
                        name="profile_mode"
                        value={editedCoordinator.profile_mode || ''}
                        onChange={handleInputcordinatorChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="" disabled>
                          Select Profile Mode
                        </option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                      </select>
                      <button
                        onClick={() => handleSaveChanges(coordinator.cordinator_id)}
                        className="block mx-auto mt-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleCancelEdit()}
                        className="block mx-auto mt-2 bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-center mt-2">{coordinator.name}</h2>
                      <p className="text-center text-gray-600">{coordinator.role}</p>
                      {coordinator.profile_mode === 'whatsapp' ? (
                        <a href={`https://${coordinator.link}`} className="block text-center text-blue-500 mt-2">
                          WhatsApp
                        </a>
                      ) : (
                        <a href={coordinator.link} className="block text-center text-blue-500 mt-2">
                          Instagram
                        </a>
                      )}
                      <p className="text-center text-gray-600 mt-2">{coordinator.email}</p>

                      {role !== 'Read-Only' && role !== 'User' && (
                        <button
                          onClick={() => handleEditcordinatorClick(index)}
                          className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">No coordinators available</p>
          )}
        </div>
      </div>


      <div>
        <h1 className="text-center font-extrabold max-w-4xl mx-auto mt-8 text-2xl">Cancellation Policies</h1>
        <div className="p-6">
          {cancellationPolicies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {cancellationPolicies.map((policy, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-md shadow-sm">
                  <h2 className="text-xl font-bold">Policy #{index + 1}</h2>
                  <p><strong>Start Day:</strong> {policy.policy_startdate}</p>
                  <p><strong>End Day:</strong> {policy.policy_endDate}</p>
                  <p><strong>Fee:</strong> {policy.fee}%</p>
                  <p><strong>Type:</strong> {policy.cancellationType}</p>
                  {role !== 'Read-Only' && role !== 'User' && (
                    <button
                      onClick={() => handleEditPolicyClick(index)}
                      className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  {isEditingcancellationpolicy === index ? (
                    <div>
                      <input
                        type="number"
                        name="policy_startdate"
                        value={editedPolicy.policy_startdate || ''}
                        onChange={handleInputPolicyChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Start Day"
                      />
                      <input
                        type="number"
                        name="policy_endDate"
                        value={editedPolicy.policy_endDate || ''}
                        onChange={handleInputPolicyChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="End Day"
                      />
                      <input
                        type="number"
                        name="fee"
                        value={editedPolicy.fee || ''}
                        onChange={handleInputPolicyChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                        placeholder="Fee"
                      />
                      <select
                        name="cancellationType"
                        value={editedPolicy.cancellationType || ''}
                        onChange={handleInputPolicyChange}
                        className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                      >
                        <option value="" disabled>Select Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Amount</option>
                      </select>
                      <button
                        onClick={() => handleSavePolicyChanges(policy.id)}
                        className="block mx-auto mt-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">No cancellation policies available</p>
          )}
        </div>
      </div>
      <div>
        <div>
          <h1 className="text-center font-extrabold  max-w-4xl mx-auto mt-8 text-2xl">BOOKINGS</h1>
          <div className="ml-8">
            <label htmlFor="download-format" className="text-blue-700  ">Download as: </label>
            <select
              id="download-format"
              onChange={(e) => handleDownload(e.target.value)}
              className="border border-2 border-gray-400"
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
              {bookings.map((bookings, index) => (<tr key={bookings.trip_id}>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.booking_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.order_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.fullname}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.age}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.phonenumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.whatsappnumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.member_state}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bookings.city}</td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h1 className="text-center font-extrabold  max-w-4xl mx-auto mt-8 text-2xl">CANCELATIONS</h1>
        <div className="ml-8">
          <label htmlFor="download-format" className="text-blue-700  ">Download as: </label>
          <select
            id="download-format-cancellations"
            onChange={(e) => handleDownload(e.target.value, true)}
            className="border border-2 border-gray-400"
          >
            <option value="">Select format</option>
            <option value="VCF">VCF</option>
            <option value="CSV">CSV</option>
            <option value="Excel">Excel</option>
          </select>

        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phonenumber</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Id</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cancellations.map((item) => (
                <tr key={item.trip_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.booking_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.order_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.fullname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.phonenumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.reasons}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.payment_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>


  );
}
const formatDateForInput = (dateString) => {
  const dateParts = dateString.split(' ');
  const day = dateParts[0].replace(/\D/g, ''); // Extract numerical part of day
  const month = dateParts[1];
  const year = dateParts[2];

  const monthIndex = getMonthIndex(month);
  return `${year}-${monthIndex < 10 ? '0' + monthIndex : monthIndex}-${day.padStart(2, '0')}`; // Format as YYYY-MM-DD
};

// Function to format date to display (e.g., "12th September 2024")
const formatDateToDisplay = (inputDate) => {
  const date = new Date(inputDate);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-GB', options);

  // Add ordinal suffix to day
  const dayWithSuffix = addOrdinalSuffix(formattedDate.split(' ')[0]);
  return `${dayWithSuffix} ${formattedDate.split(' ').slice(1).join(' ')}`;
};

// Helper function to get month index
const getMonthIndex = (month) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months.indexOf(month) + 1; // Months are 1-indexed
};

// Add ordinal suffix to the day
const addOrdinalSuffix = (day) => {
  const suffix = ["th", "st", "nd", "rd"];
  const value = parseInt(day, 10);
  const index = (value % 10 <= 3 && value % 100 !== 11 && value % 100 !== 12 && value % 100 !== 13) ? value % 10 : 0;
  return `${value}${suffix[index] || suffix[0]}`; // Default to "th"
};
const renderDetail = (label, name, tripDetails, isEditing, handleInputChange) => {
  // Get the value from tripDetails
  let value = tripDetails[name];

  // Handle numeric values for cost, seats, etc.
  if (typeof value === 'number') {
    value = value.toString(); // Convert number to string for display
  }

  // Specific formatting for Inclusion, Exclusion, and Points to Note
  const isSpecialField = name === 'inclusion' || name === 'exclusion' || name === 'points_to_note';

  // Split the string into lines if it's a special field
  const displayValue = isSpecialField && typeof value === 'string'
    ? value.split('.').map(line => line.trim()).filter(line => line)
    : [value];

  // Handle date fields separately
  const isDateField = name === 'trip_start_date' || name === 'end_date';

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="font-semibold">
        {label}
      </label>
      {isEditing ? (
        isDateField ? (
          <input
            type="date"
            id={name}
            name={name}
            value={formatDateForInput(value)} // Use helper function to format date for input
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              // Format it back to the desired format
              const formattedDate = formatDateToDisplay(selectedDate);
              handleInputChange({ target: { name, value: formattedDate } });
            }}
            className="border border-gray-300 rounded p-2"
          />
        ) : (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleInputChange}
            rows="4"
            className="border border-gray-300 rounded p-2"
            placeholder={`Enter ${label}`}
          />
        )
      ) : (
        <p className="border border-gray-300 rounded p-2 whitespace-pre-line">
          {displayValue.map((line, index) => (
            <span key={index}>
              {line}
              {index < displayValue.length - 1 && <br />} {/* Add line breaks for special fields */}
            </span>
          ))}
        </p>
      )}
    </div>
  );
};



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