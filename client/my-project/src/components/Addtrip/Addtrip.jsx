import React, { useState } from "react";
import axios from "axios";

function Addtripdetails() {

    const [trip_name, setTrip_name] = useState("");
    const [trip_code, setTrip_code] = useState("");
    const [slug, setSlug] = useState("");
    const [cost, setCost] = useState("");
    const [seats, setSeats] = useState("");
    const [trip_start_date, setTrip_start_date] = useState("");
    const [end_date, setEnd_date] = useState("");
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
    const [seat_type, setSeat_type] = useState("");
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://admin.yeahtrips.in/addtrips', {
                trip_name,
                trip_code,
                slug,
                cost,
                seats,
                trip_start_date,
                end_date,
                trip_start_point,
                trip_end_point,
                destination,
                trip_duration,
                traveller_type,
                inclusion,
                exclusion,
                points_to_note,
                trip_type,
                days,
            });
            if (response.data) {
                alert("data inserted sucessfully")
            }


            setTrip_name("");
            setTrip_code("");
            setSlug("");
            setCost("");
            setSeats("");
            setTrip_start_date("");
            setEnd_date("");
            setTrip_start_point("");
            setTrip_end_point("");
            setDestination("");
            setTrip_duration("");
            setTraveller_type("");
            setInclusion("");
            setExclusion("");
            SetPoints_to_note("");
            setTrip_type("");
            setDays([{ DAY: "", DATE: "", DAY_TITLE: "", DAY_DESCRIPTION: "" }]);
        } catch (error) {
            console.error("Error adding item:", error);

        }
    };


    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-500">

                <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">ADD TRIPS</h1>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="text"
                            placeholder="Trip Name"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_name}
                            onChange={(e) => setTrip_name(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Trip Code"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_code}
                            onChange={(e) => setTrip_code(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Slug"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Cost"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Seats"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Start Date"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_start_date}
                            onChange={(e) => setTrip_start_date(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip End Date"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={end_date}
                            onChange={(e) => setEnd_date(e.target.value)}
                        />


                        <input
                            type="text"
                            placeholder="Trip Start Point"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_start_point}
                            onChange={(e) => setTrip_start_point(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip End Point"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_end_point}
                            onChange={(e) => setTrip_end_point(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Destination"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />


                        <input
                            type="text"
                            placeholder="Trip Duration"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_duration}
                            onChange={(e) => setTrip_duration(e.target.value)}
                        />


                        <input
                            type="text"
                            placeholder="Traveller Type"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={traveller_type}
                            onChange={(e) => setTraveller_type(e.target.value)}
                        />

                        
                       



                       

                        <input
                            type="text"
                            placeholder="Inclusion"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={inclusion}
                            onChange={(e) => setInclusion(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Exclusion"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={exclusion}
                            onChange={(e) => setExclusion(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Points To Note"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={points_to_note}
                            onChange={(e) => SetPoints_to_note(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Trip Type"
                            className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:border-blue-500"
                            value={trip_type}
                            onChange={(e) => setTrip_type(e.target.value)}
                        />


                        {days.map((day, index) => (
                            <div key={index} className="mb-4 border p-4 rounded-md">
                                <input
                                    type="text"
                                    name="DAY"
                                    placeholder="Day Number"
                                    className="w-full px-4 py-2 border rounded-md mb-4"
                                    value={day.DAY}
                                    onChange={(e) => handleDayChange(index, e)}
                                />
                                <input
                                    type="text"
                                    name="DATE"
                                    placeholder="Date"
                                    className="w-full px-4 py-2 border rounded-md mb-4"
                                    value={day.DATE}
                                    onChange={(e) => handleDayChange(index, e)}
                                />
                                <input
                                    type="text"
                                    name="DAY_TITLE"
                                    placeholder="Day Title"
                                    className="w-full px-4 py-2 border rounded-md mb-4"
                                    value={day.DAY_TITLE}
                                    onChange={(e) => handleDayChange(index, e)}
                                />
                                <input
                                    type="text"
                                    name="DAY_DESCRIPTION"
                                    placeholder="Day Description"
                                    className="w-full px-4 py-2 border rounded-md mb-4"
                                    value={day.DAY_DESCRIPTION}
                                    onChange={(e) => handleDayChange(index, e)}
                                />
                                <button
                                    type="button"
                                    className="text-red-500 hover:underline"
                                    onClick={() => handleRemoveDay(index)}
                                >
                                    Remove Day
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4"
                            onClick={handleAddDay}
                        >
                            Add Another Day
                        </button>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add Trip
                        </button>

                    </form>

                </div>

            </div>
        </>
    )
}
export default Addtripdetails;