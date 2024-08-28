import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isBefore, format as formatDate } from "date-fns";

function Addtripdetails() {
    const [trip_name, setTrip_name] = useState("");
    const [trip_code, setTrip_code] = useState("");
    const [cost, setCost] = useState("");
    const [seats, setSeats] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [trip_start_date, setTrip_start_date] = useState(null);
    const [end_date, setEnd_date] = useState(null);
    const [trip_start_point, setTrip_start_point] = useState("");
    const [trip_end_point, setTrip_end_point] = useState("");
    const [destination, setDestination] = useState("");
    const [trip_duration, setTrip_duration] = useState("");
    const [traveller_type, setTraveller_type] = useState("");
    const [inclusion, setInclusion] = useState("");
    const [exclusion, setExclusion] = useState("");
    const [points_to_note, SetPoints_to_note] = useState("");
    const [trip_type, setTrip_type] = useState("");
    const [days, setDays] = useState([
        { DAY: "", DATE: "", DAY_TITLE: "", DAY_DESCRIPTION: "" }
    ]);
    const [isValidDateRange, setIsValidDateRange] = useState(true);

    useEffect(() => {
        setTrip_end_point(trip_start_point);
    }, [trip_start_point]);

    const handleDayChange = (index, event) => {
        const { name, value } = event.target;
        const newDays = days.map((day, i) =>
            i === index ? { ...day, [name]: value } : day
        );
        setDays(newDays);
    };

    const handleAddDay = () => {
        setDays([...days, { DAY: "", DATE: "", DAY_TITLE: "", DAY_DESCRIPTION: "" }]);
    };

    const handleRemoveDay = (index) => {
        setDays(days.filter((_, i) => i !== index));
    };

    const handleNumberChange = (setter) => (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    const handleDateChange = (setter) => (date) => {
        setter(date);
        if (trip_start_date && date && isBefore(date, trip_start_date)) {
            setIsValidDateRange(false);
        } else {
            setIsValidDateRange(true);
        }
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const validateDates = () => {
        if (trip_start_date && end_date && isBefore(end_date, trip_start_date)) {
            setIsValidDateRange(false);
            return false;
        }
        setIsValidDateRange(true);
        return true;
    };

    const formatDateWithSuffix = (date) => {
        if (!date) return "";
        const day = formatDate(date, "d"); // Get day of the month
        const month = formatDate(date, "MMMM"); // Get full month name
        const year = formatDate(date, "yyyy"); // Get year
        return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
    };

    const getOrdinalSuffix = (day) => {
        if (day >= 11 && day <= 13) return "th"; // Special cases for 11th, 12th, 13th
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };

    const formatDateForDB = (date) => {
        return date ? formatDate(date, "yyyy-MM-dd") : "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) return;

        try {
            const formData = new FormData();
            formData.append("trip_name", trip_name);
            formData.append("trip_code", trip_code);
            formData.append("cost", cost);
            formData.append("seats", seats);
            formData.append("image", imageFile); // Append the image file
            formData.append("trip_start_date", formatDateForDB(trip_start_date));
            formData.append("end_date", formatDateForDB(end_date));
            formData.append("trip_start_point", trip_start_point);
            formData.append("trip_end_point", trip_end_point);
            formData.append("destination", destination);
            formData.append("trip_duration", trip_duration);
            formData.append("traveller_type", traveller_type);
            formData.append("inclusion", inclusion);
            formData.append("exclusion", exclusion);
            formData.append("points_to_note", points_to_note);
            formData.append("trip_type", trip_type);
            formData.append("days", JSON.stringify(days));

            const response = await axios.post("https://admin.yeahtrips.in/addtrips", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data) {
                alert("Data inserted successfully");
            }

            // Reset form
            setTrip_name("");
            setTrip_code("");
            setCost("");
            setSeats("");
            setTrip_start_date(null);
            setEnd_date(null);
            setTrip_start_point("");
            setTrip_end_point("");
            setDestination("");
            setTrip_duration("");
            setTraveller_type("");
            setInclusion("");
            setImageFile(null);
            setExclusion("");
            SetPoints_to_note("");
            setTrip_type("");
            setDays([{ DAY: "", DATE: "", DAY_TITLE: "", DAY_DESCRIPTION: "" }]);
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Add Trip Details</h1>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <input
                            type="text"
                            placeholder="Trip Name"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_name}
                            onChange={(e) => setTrip_name(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip Code"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_code}
                            onChange={(e) => setTrip_code(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip Cost"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={cost}
                            onChange={handleNumberChange(setCost)}
                        />
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full py-2"
                        />
                        <input
                            type="text"
                            placeholder="Trip Seats"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={seats}
                            onChange={handleNumberChange(setSeats)}
                        />
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Trip Start Date
                            </label>
                            <DatePicker
                                selected={trip_start_date}
                                onChange={handleDateChange(setTrip_start_date)}
                                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                dateFormat="d MMMM yyyy"
                                placeholderText="Select start date"
                                showYearDropdown
                                scrollableMonthYearDropdown
                            />
                            {trip_start_date && (
                                <p className="text-gray-700 mt-2">
                                    Start Date: {formatDateWithSuffix(trip_start_date)}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Trip End Date
                            </label>
                            <DatePicker
                                selected={end_date}
                                onChange={handleDateChange(setEnd_date)}
                                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                dateFormat="d MMMM yyyy"
                                placeholderText="Select end date"
                                showYearDropdown
                                scrollableMonthYearDropdown
                            />
                            {end_date && (
                                <p className="text-gray-700 mt-2">
                                    End Date: {formatDateWithSuffix(end_date)}
                                </p>
                            )}
                        </div>
                        {!isValidDateRange && (
                            <p className="text-red-500">End date must be after the start date.</p>
                        )}
                        <input
                            type="text"
                            placeholder="Trip Start Point"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_start_point}
                            onChange={(e) => setTrip_start_point(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip End Point"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_end_point}
                            onChange={(e) => setTrip_end_point(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Destination"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip Duration"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_duration}
                            onChange={(e) => setTrip_duration(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Traveller Type"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={traveller_type}
                            onChange={(e) => setTraveller_type(e.target.value)}
                        />
                        <textarea
                            placeholder="Inclusion"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={inclusion}
                            onChange={(e) => setInclusion(e.target.value)}
                        />
                        <textarea
                            placeholder="Exclusion"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={exclusion}
                            onChange={(e) => setExclusion(e.target.value)}
                        />
                        <textarea
                            placeholder="Points to Note"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={points_to_note}
                            onChange={(e) => SetPoints_to_note(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip Type"
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                            value={trip_type}
                            onChange={(e) => setTrip_type(e.target.value)}
                        />
                        <div>
                            <h2 className="text-lg font-bold mb-4">Itinerary</h2>
                            {days.map((day, index) => (
                                <div key={index} className="mb-4 border p-4 rounded-lg">
                                    <input
                                        type="text"
                                        name="DAY"
                                        placeholder="Day"
                                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                        value={day.DAY}
                                        onChange={(e) => handleDayChange(index, e)}
                                    />
                                    <input
                                        type="text"
                                        name="DATE"
                                        placeholder="Date"
                                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                        value={day.DATE}
                                        onChange={(e) => handleDayChange(index, e)}
                                    />
                                    <input
                                        type="text"
                                        name="DAY_TITLE"
                                        placeholder="Day Title"
                                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                        value={day.DAY_TITLE}
                                        onChange={(e) => handleDayChange(index, e)}
                                    />
                                    <textarea
                                        name="DAY_DESCRIPTION"
                                        placeholder="Day Description"
                                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:border-purple-500"
                                        value={day.DAY_DESCRIPTION}
                                        onChange={(e) => handleDayChange(index, e)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDay(index)}
                                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Remove Day
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddDay}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                            >
                                Add Day
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg mt-6"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Addtripdetails;
