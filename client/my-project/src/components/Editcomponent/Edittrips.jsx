import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { format } from 'date-fns';
import * as XLSX from "xlsx";
import AdminNavbar from "../Dashboardnavbar/Dashboardnavbar";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [waitinglist, setWaitinglist] = useState([])
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {

      console.log(trip_id)
      const storedRole = localStorage.getItem('role');
      setRole(storedRole);

      try {
        const [detailsResponse, itineraryResponse, bookingsResponse, cancellationsresponse, coordinatorsResponse, cancellationPoliciesResponse, waitinglistresponse] = await Promise.all([
          axios.get(`https://admin.yeahtrips.in/editdetailstrips/${trip_id}`),

          axios.get(`https://admin.yeahtrips.in/tripitenary/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/getbookingdetails/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/cancellations/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/getcoordinatordetails/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/cancellationpolicies/${trip_id}`),
          axios.get(`https://admin.yeahtrips.in/waitinglistmembers/${trip_id}`)

        ]);

        setTripDetails(detailsResponse.data[0]);
        setTripItinerary(Array.isArray(itineraryResponse.data) ? itineraryResponse.data : []);
        setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
        setCancellations(Array.isArray(cancellationsresponse.data) ? cancellationsresponse.data : []);
        setCoordinators(Array.isArray(coordinatorsResponse.data) ? coordinatorsResponse.data : []);
        setCancellationPolicies(Array.isArray(cancellationPoliciesResponse.data) ? cancellationPoliciesResponse.data : []);
        setWaitinglist(Array.isArray(waitinglistresponse.data) ? waitinglistresponse.data : [])
        console.log("Trip Details:", detailsResponse.data);
        console.log("Trip Itinerary:", itineraryResponse.data);
        console.log("Bookings:", bookingsResponse.data);
        console.log("cancellation", cancellationsresponse.data);
        console.log("Coordinators:", coordinatorsResponse.data);
        console.log("waitinglist", waitinglistresponse.data)
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

  const [pickupPoints, setPickupPoints] = useState([]);
  const [editedPoints, setEditedPoints] = useState([]);
  const [isEditingPickupPoints, setIsEditingPickupPoints] = useState(false); // Renamed state variable

  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const response = await axios.get('https://admin.yeahtrips.in/gettheeditpickuppoints', {
          params: { trip_id },
        });
        setPickupPoints(response.data);
        setEditedPoints(response.data); // Initialize editedPoints with fetched data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pickup points');
        setLoading(false);
      }
    };
    if (trip_id) {
      fetchPickupPoints();
    }
  }, [trip_id]);

  const handleEditClick = () => {
    setIsEditingPickupPoints(true); // Update here
  };

  const handleChange = (index, field, value) => {
    const updatedPoints = [...editedPoints];
    updatedPoints[index] = { ...updatedPoints[index], [field]: value };
    setEditedPoints(updatedPoints);
  };


  const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i)); // 1 to 12
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? `0${i}` : i)); // 00 to 59
  const amPmOptions = ['AM', 'PM'];



  const handleTimeChange = (index, hour, minute, amPm) => {
    // Get the existing time
    const existingTime = editedPoints[index].time;

    // Split the existing time to get components
    const [currentHour, currentMinute, currentSuffix] = existingTime.split(/:|\s+/);

    // Use selected values or fallback to current values
    const newHour = hour !== undefined ? hour : currentHour; // Use the selected hour or the current hour
    const newMinute = minute !== undefined ? minute : currentMinute; // Use the selected minute or the current minute
    const newSuffix = amPm !== undefined ? amPm : currentSuffix; // Use the selected AM/PM or the current suffix

    // Construct the new time string without duplicates
    const cleanTime = `${newHour}:${newMinute} ${newSuffix}`.trim();

    // Update the time in editedPoints
    handleChange(index, 'time', cleanTime);
  };





  const handleSavePickupPoints = async () => {
    try {
      await axios.put('https://admin.yeahtrips.in/updatethePickupPoints', {
        trip_id,
        pickupPoints: editedPoints,
      });
      console.log('Pickup points updated successfully!');
      setPickupPoints(editedPoints); // Optionally update original pickupPoints state
    } catch (error) {
      console.error('Error updating pickup points:', error);
    } finally {
      setIsEditingPickupPoints(false); // Exit edit mode after saving
    }
  };

  const [isEditingcordinators, setIsEditingcordinators] = useState(false);
  const [editedCoordinator, setEditedCoordinator] = useState({});
  const [newCoordinator, setNewCoordinator] = useState({
    name: '',
    email: '',
    role: '',

  }); const [coordinatorOptions, setCoordinatorOptions] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false); // State for showing/hiding the add member form
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const toggleAddMemberForm = () => {
    setShowAddMemberForm((prev) => !prev);
  };

  const handleEditcordinatorClick = (index) => {
    setIsEditingcordinators(index);
    setEditedCoordinator(coordinators[index]); // Set existing coordinator details for editing
    setSelectedImage(coordinators[index].image); // Set the current image in state
  };

  const handleInputcordinatorChange = (e, isNew = false) => {
    const { name, value } = e.target;

    if (isNew) {
      // If isNew is true, update the newCoordinator state
      setNewCoordinator((prev) => ({
        ...prev,
        [name]: value
      }));
    } else {
      // Otherwise, update the editedCoordinator state
      setEditedCoordinator((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };


  useEffect(() => {
    // Fetch the coordinators from the database
    const fetchCoordinators = async () => {
      try {
        const response = await axios.get('https://admin.yeahtrips.in/getthecoordinators');
        setCoordinatorOptions(response.data);

      } catch (err) {
        console.error('Error fetching coordinators:', err);
      }
    };

    fetchCoordinators();
  }, []);


  const handleNewCoordinatorChange = (e) => {
    const { name, value } = e.target;

    // Update the selected name
    setNewCoordinator((prev) => ({ ...prev, [name]: value }));

    // Auto-populate email when a coordinator is selected
    if (name === 'name') {
      const selectedCoordinator = coordinatorOptions.find(coord => coord.name === value);
      setNewCoordinator((prev) => ({
        ...prev,
        email: selectedCoordinator ? selectedCoordinator.email : '' // Auto-populate or clear email
      }));
    }
  };



  const handleAddCoordinator = async () => {
    // Ensure a coordinator is selected
    if (!newCoordinator.name) return;

    // Find the selected coordinator based on name
    const selectedCoordinator = coordinatorOptions.find(coord => coord.name === newCoordinator.name);

    if (selectedCoordinator) {
      // Prepare the data to be sent
      const coordinatorData = {
        name: selectedCoordinator.name,
        email: selectedCoordinator.email,
        role: newCoordinator.role,
        tripId: trip_id // Assuming trip_id is available in the component
      };

      try {
        // Send the POST request to add the coordinator
        const response = await axios.post('https://admin.yeahtrips.in/coordinatorstrip', coordinatorData);
        // Assuming the API returns the added coordinator, you can update the state
        setCoordinators([...coordinators, { ...coordinatorData, id: Date.now() }]);
        alert('Coordinator added successfully'); // Optional: show success message
      } catch (err) {
        console.error('Error adding coordinator:', err);
        alert('Failed to add coordinator'); // Optional: show error message
      }

      // Reset the newCoordinator state after submission
      setNewCoordinator({ name: '', email: '', role: '', link: '', profile_mode: '' });
    }
  };


  const handleSaveChanges = async (coordinatorId) => {
    setLoading(true); // Start loading

    try {
      const formData = new FormData();

      // Append all other fields from editedCoordinator
      formData.append('name', editedCoordinator.name);
      formData.append('role', editedCoordinator.role);
      formData.append('email', editedCoordinator.email);
      formData.append('link', editedCoordinator.link);
      formData.append('profile_mode', editedCoordinator.profile_mode);

      // Check if a new image is selected; otherwise, append the existing image URL
      if (selectedImage && typeof selectedImage !== 'string') {
        formData.append('image', selectedImage); // New image file
      } else {
        formData.append('existingImage', editedCoordinator.image); // Send existing image URL
      }

      // Log the formData to verify the contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Send data to backend
      const response = await axios.put(
        `https://admin.yeahtrips.in/update-coordinator/${trip_id}/${coordinatorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Important for file uploads
          },
        }
      );

      alert('Coordinator updated successfully');
      window.location.reload(); // Reload the page to reflect the updates
    } catch (err) {
      console.error('Error updating coordinator:', err);
      setError('Failed to update coordinator');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDeleteCoordinator = async (cordinatorId) => {
    if (window.confirm("Are you sure you want to delete this coordinator?")) {
      try {
        const response = await fetch(`https://admin.yeahtrips.in/deletecoordinator/${cordinatorId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCoordinators((prev) => prev.filter(coordinator => coordinator.cordinator_id !== cordinatorId));
          alert('Coordinator deleted successfully.');
        } else {
          alert('Failed to delete the coordinator.');
        }
      } catch (error) {
        console.error("Error deleting coordinator:", error);
        alert('An error occurred while deleting the coordinator.');
      }
    }
  };


  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file); // Store new image if selected
  };
  const [allPolicies, setAllPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [isEditingcancellationpolicy, setIsEditingcancellationpolicy] = useState(false);

  const fetchAllPolicies = async () => {
    try {
      const response = await axios.get('https://admin.yeahtrips.in/getcancellationpolicies');
      setAllPolicies(response.data);
      console.log("Policies", response.data)
      const currentPolicyIds = cancellationPolicies.map(policy => policy.policy_id);
      setSelectedPolicies(currentPolicyIds);
    } catch (error) {
      console.error('Error fetching all policies:', error);
    }
  };



  // Handle Checkbox Change
  const handleCheckboxChange = (policyId) => {
    setSelectedPolicyId(policyId);
  };


  const handleSavePolicies = async () => {
    try {
      const tripId = trip_id;
      const policyId = cancellationPolicies[0]?.policy_id; // Assuming you're using the first policy_id

      // Prepare the data to be sent to the backend
      const dataToSend = {
        trip_id: tripId,
        policy_id: selectedPolicyId, // Single selected policy_id
      };

      // Send the data to the backend
      await axios.put(`https://admin.yeahtrips.in/update-cancellation-policy/${tripId}`, dataToSend);

      setIsEditingcancellationpolicy(false);
      window.location.reload()
    } catch (error) {
      console.error('Error saving policies:', error);
    }
  };

  const handleEditPolicyClick = () => {
    navigate(`/edit-cancellation-policy/${trip_id}`);
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
      formData.append("totalseats", tripDetails.totalseats);
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
      formData.append("googlemap", tripDetails.googlemap);
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

  const formatDate = (dateString) => {
    if (!dateString) return ''; // If the dateString is null or empty, return an empty string

    const date = new Date(dateString);

    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      return ''; // Return an empty string or handle the error as you prefer
    }

    const options = { month: 'long', year: 'numeric' };
    const day = date.getDate();

    // Determine the correct suffix for the day
    const daySuffix = (day) => {
      if (day === 1 || day === 21 || day === 31) return 'st';
      if (day === 2 || day === 22) return 'nd';
      if (day === 3 || day === 23) return 'rd';
      return 'th';
    };

    return `${day}${daySuffix(day)} ${new Intl.DateTimeFormat('en-US', options).format(date)}`;
  };

  const handleItineraryImageChange = (event, dayIndex) => {
    const file = event.target.files[0];
    setSelectedItineraryImages((prevImages) => ({
      ...prevImages,
      [dayIndex]: file,  // Store the selected image for that specific day
    }));
  };

  const handleItineraryChange = (index, event) => {
    const { name, value } = event.target;

    setTripItinerary((prevItinerary) => {
      const updatedItinerary = [...prevItinerary];

      // Ensure all fields, including DATE, are retained when updating any field
      updatedItinerary[index] = {
        ...updatedItinerary[index], // Keep the other fields, including DATE
        [name]: value,              // Only update the specific field that changed
      };

      return updatedItinerary;
    });
  };


  const handleSaveDay = async (dayIndex) => {
    const item = tripItinerary[dayIndex];

    // Ensure trip_id is available (either from state or props)
    const tripId = item.TRIP_ID;

    if (!item) {
      console.error(`No itinerary found for dayIndex ${dayIndex}`);
      return;
    }

    const formData = new FormData();


    let formattedDate = formatDate(item.DATE); // Declare formattedDate using let

    // If the formatted date is empty, fallback to the original DATE from tripItinerary
    if (formattedDate === '') {
      formattedDate = tripItinerary[dayIndex].DATE; // Reassign formattedDate
    }




    formData.append('DATE', formattedDate);
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
      window.location.reload();  // Reload the page to reflect changes
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


  // Helper function to convert '12th February 2024' to '2024-02-12'
  function parseDate(dateString) {
    const dateParts = dateString.split(' ');
    const day = dateParts[0].replace(/\D/g, ''); // Extract numerical part of day
    const month = dateParts[1];
    const year = dateParts[2];

    const monthIndex = getMonthIndex(month);
    return `${year}-${monthIndex < 10 ? '0' + monthIndex : monthIndex}-${day.padStart(2, '0')}`;
  }

  const handleApprove = (bookingId) => {
    console.log(`Approval requested for booking ID: ${bookingId}`);

    axios.post('https://admin.yeahtrips.in/approve-cancellation', { booking_id: bookingId })
      .then(response => {
        console.log('Cancellation approved:', response.data);
        window.location.reload();
      })
      .catch(error => {
        console.error('Error approving cancellation:', error);
      });
  };

  const seatsCount = {};

  cancellations.forEach(item => {
    if (!seatsCount[item.booking_id]) {
      seatsCount[item.booking_id] = { count: 0, seats: item.seats };
    }
    seatsCount[item.booking_id].count += 1;
  });

  const bookingCounts = {};

  bookings.forEach(booking => {
    if (bookingCounts[booking.booking_id]) {
      bookingCounts[booking.booking_id] += 1;
    } else {
      bookingCounts[booking.booking_id] = 1;
    }
  });

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
                  className="w-full h-[50vh] mb-6"
                />
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                {renderDetail("trip_description", "trip_description", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Trip Code", "trip_code", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Slug", "slug", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Cost", "cost", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Seats Available", "seats", tripDetails)}
                {renderDetail("Total Seats", "totalseats", tripDetails, isEditing, handleInputChange)}

                {renderDetail("Start Date", "trip_start_date", tripDetails, isEditing, handleInputChange)}
                {renderDetail("End Date", "end_date", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Start Point", "trip_start_point", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Destination", "destination", tripDetails, isEditing, handleInputChange)}
              </div>
              <div className="space-y-2">
                {renderDetail("Traveller Type", "traveller_type", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Duration", "trip_duration", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Inclusion", "inclusion", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Exclusion", "exclusion", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Points to Note", "points_to_note", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Trip Type", "trip_type", tripDetails, isEditing, handleInputChange)}
                {renderDetail("Seat Type", "seat_type", tripDetails, isEditing, handleInputChange)}
                {renderDetail("End Point", "trip_end_point", tripDetails, isEditing, handleInputChange)}
                {renderDetail("whatsapplink", "whatsapplink", tripDetails, isEditing, handleInputChange)}
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
            <div>
              <h2 className="text-xl font-semibold mb-4">Pickup Points</h2>
              {pickupPoints.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {editedPoints.map((point, index) => (
                    <div key={point.id} className="border p-4 rounded shadow-lg hover:bg-gray-50">
                      <h3 className="font-semibold">{index === 0 ? 'Starting Point' : 'Additional Point'}</h3>
                      <p>
                        <strong>Pickup Point:</strong>
                        {isEditingPickupPoints ? (
                          <input
                            type="text"
                            value={point.pickuppoint}
                            onChange={(e) => handleChange(index, 'pickuppoint', e.target.value)}
                            className="border border-gray-300 px-2 py-1 w-full"
                          />
                        ) : (
                          point.pickuppoint
                        )}
                      </p>
                      <p>
                        <strong>Time:</strong>
                        {isEditingPickupPoints ? (
                          <div className="flex items-center space-x-2">
                            <select
                              className="border border-gray-300 px-2 py-1 w-16"
                              value={point.time ? point.time.split(':')[0] : '12'} // Get hour part
                              onChange={(e) => handleTimeChange(index, e.target.value, point.time ? point.time.split(':')[1].split(' ')[0] : '00', point.time ? point.time.split(' ')[1] : 'AM')}
                            >
                              {hours.map(hour => (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              ))}
                            </select>
                            <select
                              className="border border-gray-300 px-2 py-1 w-16"
                              value={point.time ? point.time.split(':')[1].split(' ')[0] : '00'} // Get minute part
                              onChange={(e) => handleTimeChange(index, point.time ? point.time.split(':')[0] : '12', e.target.value, point.time ? point.time.split(' ')[1] : 'AM')}
                            >
                              {minutes.map(minute => (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              ))}
                            </select>
                            <select
                              className="border border-gray-300 px-2 py-1 w-16"
                              value={point.time ? point.time.split(' ')[1] : 'AM'} // Get AM/PM part
                              onChange={(e) => handleTimeChange(index, point.time ? point.time.split(':')[0] : '12', point.time ? point.time.split(':')[1].split(' ')[0] : '00', e.target.value)}
                            >
                              {amPmOptions.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          point.time
                        )}
                      </p>
                      {index === 0 && (
                        <p>
                          <strong>Google Map Link:</strong>
                          {isEditingPickupPoints ? (
                            <input
                              type="text"
                              value={point.googlemap || ''}
                              onChange={(e) => handleChange(index, 'googlemap', e.target.value)}
                              className="border border-gray-300 px-2 py-1 w-full"
                            />
                          ) : (
                            point.googlemap
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No pickup points available for this trip.</p>
              )}
              {isEditingPickupPoints ? (
                <button className="mt-2 bg-blue-500 text-white px-4 py-2" onClick={handleSavePickupPoints}>
                  Save Changes
                </button>
              ) : (
                (role !== 'Read-Only' && role !== 'User') && (
                  <button className="mt-2 bg-green-500 text-white px-4 py-2" onClick={handleEditClick}>
                    Edit Pickup Points
                  </button>
                )
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
                              type="date"
                              name="DATE"
                              value={formatDateForInput(item.DATE)} 
                              onChange={(e) => {
                                const selectedDate = new Date(e.target.value);
                                const formattedDate = formatDateToDisplay(selectedDate); 
                                handleItineraryChange(index, { target: { name: "DATE", value: formattedDate } }); 
                              }}
                              className="border p-2"
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
                          {item.DAY_TITLE &&
                            <p>{item.DAY_TITLE}</p>

                          }


                          {item.DAY_IMG && (
                            <img
                              src={`https://admin.yeahtrips.in${correctedImagePath}`}
                              alt={`Itinerary for day ${index + 1}`}
                              style={{ width: '50vw', height: '30vh', objectFit: 'cover' }}
                            />
                          )}

                          {item.DAY_DESCRIPTION && (
                            <>
                              {item.DAY_DESCRIPTION.split('.').map((sentence, index) => (
                                // Trim to remove extra spaces and check if the sentence is not empty
                                sentence.trim() && <p key={index}>{sentence.trim()}.</p>
                              ))}
                            </>
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
        <button
          onClick={toggleAddMemberForm}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          {showAddMemberForm ? 'Hide Add Member Form' : 'Add Member'}
        </button>

        {showAddMemberForm && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-center mt-4">Add New Member</h2>
            <div className="bg-gray-100 p-4 rounded-md shadow-sm mb-6">
              <select
                name="name"
                value={newCoordinator.name || ''}
                onChange={handleNewCoordinatorChange}
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              >
                <option value="" disabled>Select Coordinator</option>
                {coordinatorOptions.map(coord => (
                  <option key={coord.id} value={coord.name}>{coord.name}</option>
                ))}
              </select>
              <input
                type="text"
                name="role"
                value={newCoordinator.role || ''}
                onChange={(e) => handleInputcordinatorChange(e, true)}
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                placeholder="Role"
              />
              <input
                type="email"
                name="email"
                value={newCoordinator.email || ''}
                readOnly
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
                placeholder="Email"
              />

              <button
                onClick={handleAddCoordinator}
                className="block mx-auto mt-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
              >
                Add Member
              </button>
            </div>
          </div>
        )}

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
                      type="email"
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
                      <option value="" disabled>Select Profile Mode</option>
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
                      onClick={handleCancelEdit}
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

                    {/* Edit button */}
                    {role !== 'Read-Only' && role !== 'User' && (
                      <>
                        <button
                          onClick={() => handleEditcordinatorClick(index)}
                          className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCoordinator(coordinator.cordinator_id)}
                          className="block mx-auto mt-2 bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">No coordinators available.</p>
        )}
      </div>




      <div>
        <h1 className="text-center font-extrabold max-w-4xl mx-auto mt-8 text-2xl">Cancellation Policy</h1>
        <div className="p-6">
          {cancellationPolicies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-100 p-4 rounded-md shadow-sm">
                <h2 className="text-xl font-bold">{cancellationPolicies[0].policy_name}</h2>
                <p><strong>Fee Type:</strong> {cancellationPolicies[0].fee_type}</p>

                {cancellationPolicies.map((policy, index) => (
                  <div key={index} className="mt-2">
                    <p><strong>Start Day:</strong> {policy.start_date}</p>
                    <p><strong>End Day:</strong> {policy.end_date}</p>
                    <p><strong>Fee:</strong> {policy.fee}%</p>
                  </div>
                ))}

                {role !== 'Read-Only' && role !== 'User' && (
                  <button
                    onClick={handleEditPolicyClick}
                    className="block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                  >
                    Edit Policy
                  </button>
                )}
              </div>
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
          {/* Add a wrapper div for horizontal scrolling on small screens */}
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings
                  .filter((booking, index, self) =>
                    self.findIndex(b => b.booking_id === booking.booking_id) === index
                  )
                  .map((booking, index) => (
                    <tr key={booking.trip_id}>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.booking_id}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.order_id}</td>
                      <td className="px-4 py-2 whitespace-normal break-words">{booking.fullname}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{bookingCounts[booking.booking_id]}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.age}</td>
                      <td className="px-4 py-2 whitespace-normal break-words">{booking.email}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.phonenumber}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.whatsappnumber}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.member_state}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.city}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.bookingDetails?.amount_paid}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.bookingDetails?.couponcode}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{booking.bookingDetails?.discount_amount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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
          <div className="overflow-x-auto">
            <table className="table-auto min-w-full divide-y divide-gray-200 border border-gray-300">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cancellations
                  // Filter out duplicate booking_ids and only keep the first occurrence
                  .filter((item, index, self) => self.findIndex(t => t.booking_id === item.booking_id) === index)
                  .map((item) => (
                    <tr key={item.trip_id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.booking_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.order_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.fullname}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.phonenumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.reasons}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.payment_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{seatsCount[item.booking_id] ? seatsCount[item.booking_id].count : 0}</td>                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'Approved' ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded">
                            Approved
                          </span>
                        ) : (
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => handleApprove(item.booking_id)}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

        </div>



        <h2 className="text-2xl font-bold mb-4">Waiting List Members</h2>
        {waitinglist.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Phone Number</th>
                <th className="border px-4 py-2">WhatsApp Number</th>
                <th className="border px-4 py-2">Seats</th>
                <th className="border px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {waitinglist.map(member => (
                <tr key={member.id}>
                  <td className="border px-4 py-2">{member.id}</td>
                  <td className="border px-4 py-2">{member.email}</td>
                  <td className="border px-4 py-2">{member.phonenumber}</td>
                  <td className="border px-4 py-2">{member.whatsappnumber}</td>
                  <td className="border px-4 py-2">{member.seats}</td>
                  <td className="border px-4 py-2">{new Date(member.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No waiting list members found.</p>
        )}

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

const formatDateToDisplay = (inputDate) => {
  const date = new Date(inputDate);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-GB', options);

  const dayWithSuffix = addOrdinalSuffix(formattedDate.split(' ')[0]);
  return `${dayWithSuffix} ${formattedDate.split(' ').slice(1).join(' ')}`;
};

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
  let value = tripDetails[name];

  // Handle numeric values for cost, seats, etc.
  if (typeof value === 'number') {
    value = value.toString(); // Convert number to string for display
  }

  // Check if the field is one of the special HTML fields
  const htmlEditorFields = ['trip_description', 'inclusion', 'exclusion', 'points_to_note'];
  const isSpecialField = htmlEditorFields.includes(name);

  // Handle date fields separately
  const isDateField = name === 'trip_start_date' || name === 'end_date';

  // Function to strip HTML tags
  const stripHtmlTags = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Split content by period (.) for special fields in view mode
  const displayValue = isSpecialField && !isEditing && typeof value === 'string'
    ? stripHtmlTags(value).split('.').map((line) => line.trim()).filter((line) => line)
    : [value]; // Otherwise, return an array with the original value

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
            value={formatDateForInput(value)}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const formattedDate = formatDateToDisplay(selectedDate);
              handleInputChange({ target: { name, value: formattedDate } });
            }}
            className="border border-gray-300 rounded p-2"
          />
        ) : isSpecialField ? (
          <ReactQuill
            id={name}
            value={value || ''}
            onChange={(content) => handleInputChange({ target: { name, value: content } })}
            className="border border-gray-300 rounded p-2"
            placeholder={`Enter ${label}`}
          />
        ) : (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            rows="4"
            className="border border-gray-300 rounded p-2"
            placeholder={`Enter ${label}`}
          />
        )
      ) : (
        isSpecialField ? (
          <textarea
            id={name}
            name={name}
            value={displayValue.join('\n')}
            readOnly
            rows="4"
            className="border border-gray-300 rounded p-2 whitespace-pre-line"
          />
        ) : (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            readOnly
            rows="4"
            className="border border-gray-300 rounded p-2"
          />
        )
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