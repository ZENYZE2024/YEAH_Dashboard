import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, differenceInDays, addDays } from 'date-fns';

function Addtripdetails() {
    const [formData, setFormData] = useState({
        trip_name: '',
        trip_code: '',
        cost: '',
        seats: '',
        trip_start_date: null,
        end_date: null,
        trip_start_point: '',
        trip_end_point: '',
        destination: '',
        trip_duration: '',
        traveller_type: '',
        inclusion: '',
        exclusion: '',
        points_to_note: '',
        trip_type: '',
        trip_description: '',
        googlemap: '',
        whatsapplink: '',
    });

    const [days, setDays] = useState([]);
    const [tripImages, setTripImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [additionalImageInputs, setAdditionalImageInputs] = useState([{ id: Date.now() }]);

    useEffect(() => {
        if (formData.trip_start_date && formData.end_date) {
            generateItineraryDays();
        }
    }, [formData.trip_start_date, formData.end_date]);

    const generateItineraryDays = () => {
        const start = new Date(formData.trip_start_date);
        const end = new Date(formData.end_date);
        const numDays = differenceInDays(end, start) + 1;
        const newDays = [];

        for (let i = 1; i <= numDays; i++) {
            newDays.push({
                DAY: `Day ${i}`,
                DATE: format(addDays(start, i - 1), 'd MMMM yyyy'),
                DAY_TITLE: '',
                DAY_DESCRIPTION: '',
                IMAGES: [],
            });
        }

        setDays(newDays);
        if (!formData.trip_duration) {
            setFormData((prevData) => ({ ...prevData, trip_duration: `${numDays} days` }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.trip_start_date > formData.end_date) {
            alert('Trip end date cannot be before the start date.');
            return;
        }

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            form.append(key, formData[key]);
        });

        days.forEach((day, index) => {
            form.append(`itinerary[${index}][DAY]`, day.DAY);
            form.append(`itinerary[${index}][DATE]`, day.DATE);
            form.append(`itinerary[${index}][DAY_TITLE]`, day.DAY_TITLE);
            form.append(`itinerary[${index}][DAY_DESCRIPTION]`, day.DAY_DESCRIPTION);
            day.IMAGES.forEach((file, i) => {
                form.append(`itinerary[${index}][images][${i}]`, file);
            });
        });

        tripImages.forEach((file, i) => {
            form.append(`trip_images[${i}]`, file);
        });

        additionalImages.forEach((imageArray, index) => {
            imageArray.forEach((file, i) => {
                form.append(`additional_images_${index}[${i}]`, file);
            });
        });

        try {
            const response = await axios.post('https://admin.yeahtrips.in/addtrips', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Trip details submitted successfully!');
        } catch (error) {
            console.error('Error submitting trip details:', error);
            alert('Failed to submit trip details.');
        }
    };

    const handleFieldChange = (field, value) => {
        setFormData((prevData) => ({ ...prevData, [field]: value }));
    };

    const handleAddDay = () => {
        setDays([...days, {
            DAY: `Day ${days.length + 1}`,
            DATE: '',
            DAY_TITLE: '',
            DAY_DESCRIPTION: '',
            IMAGES: [],
        }]);
    };

    const handleRemoveDay = (index) => {
        setDays(days.filter((_, i) => i !== index));
    };

    const handleDayChange = (index, field, value) => {
        const updatedDays = [...days];
        updatedDays[index] = { ...updatedDays[index], [field]: value };
        setDays(updatedDays);
    };

    const handleImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const updatedDays = [...days];
        updatedDays[index] = { ...updatedDays[index], IMAGES: files };
        setDays(updatedDays);
    };

    const handleTripImageChange = (e) => {
        setTripImages(Array.from(e.target.files));
    };

    const handleAdditionalImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const updatedAdditionalImages = [...additionalImages];
        updatedAdditionalImages[index] = files;
        setAdditionalImages(updatedAdditionalImages);
    };

    const handleAddAdditionalImages = () => {
        setAdditionalImageInputs([...additionalImageInputs, { id: Date.now() }]);
        setAdditionalImages([...additionalImages, []]);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Add Trip Details</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                    <input
                        type="text"
                        value={formData.trip_name}
                        onChange={(e) => handleFieldChange('trip_name', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Code</label>
                    <input
                        type="text"
                        value={formData.trip_code}
                        onChange={(e) => handleFieldChange('trip_code', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Cost</label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => handleFieldChange('cost', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Seats</label>
                    <input
                        type="number"
                        value={formData.seats}
                        onChange={(e) => handleFieldChange('seats', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Start Date</label>
                    <DatePicker
                        selected={formData.trip_start_date}
                        onChange={(date) => handleFieldChange('trip_start_date', date)}
                        dateFormat="MMMM d, yyyy"
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <DatePicker
                        selected={formData.end_date}
                        onChange={(date) => handleFieldChange('end_date', date)}
                        dateFormat="MMMM d, yyyy"
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Start Point</label>
                    <input
                        type="text"
                        value={formData.trip_start_point}
                        onChange={(e) => handleFieldChange('trip_start_point', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">End Point</label>
                    <input
                        type="text"
                        value={formData.trip_end_point}
                        onChange={(e) => handleFieldChange('trip_end_point', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => handleFieldChange('destination', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Duration</label>
                    <input
                        type="text"
                        value={formData.trip_duration}
                        onChange={(e) => handleFieldChange('trip_duration', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Traveller Type</label>
                    <input
                        type="text"
                        value={formData.traveller_type}
                        onChange={(e) => handleFieldChange('traveller_type', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Inclusion</label>
                    <textarea
                        value={formData.inclusion}
                        onChange={(e) => handleFieldChange('inclusion', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        rows="3"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Exclusion</label>
                    <textarea
                        value={formData.exclusion}
                        onChange={(e) => handleFieldChange('exclusion', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        rows="3"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Points to Note</label>
                    <textarea
                        value={formData.points_to_note}
                        onChange={(e) => handleFieldChange('points_to_note', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        rows="3"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                    <input
                        type="text"
                        value={formData.trip_type}
                        onChange={(e) => handleFieldChange('trip_type', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Description</label>
                    <textarea
                        value={formData.trip_description}
                        onChange={(e) => handleFieldChange('trip_description', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        rows="4"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Google Map Link</label>
                    <input
                        type="text"
                        value={formData.googlemap}
                        onChange={(e) => handleFieldChange('googlemap', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">WhatsApp Link</label>
                    <input
                        type="text"
                        value={formData.whatsapplink}
                        onChange={(e) => handleFieldChange('whatsapplink', e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Trip Images</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleTripImageChange}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                    />
                </div>

                {additionalImageInputs.map((input, index) => (
                    <div key={input.id} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Additional Images {index + 1}</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => handleAdditionalImageChange(index, e)}
                            className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddAdditionalImages}
                    className="bg-blue-500 text-white rounded-md p-2 mt-4"
                >
                    Add More Additional Images
                </button>

                {days.map((day, index) => (
                    <div key={index} className="border border-gray-300 p-4 rounded-md mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">{day.DAY}</h2>
                            <button
                                type="button"
                                onClick={() => handleRemoveDay(index)}
                                className="text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                        <div className="mb-2">
                            <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="text"
                                value={day.DATE}
                                onChange={(e) => handleDayChange(index, 'DATE', e.target.value)}
                                className="border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="text-sm font-medium text-gray-700 mb-1">Day Title</label>
                            <input
                                type="text"
                                value={day.DAY_TITLE}
                                onChange={(e) => handleDayChange(index, 'DAY_TITLE', e.target.value)}
                                className="border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="text-sm font-medium text-gray-700 mb-1">Day Description</label>
                            <textarea
                                value={day.DAY_DESCRIPTION}
                                onChange={(e) => handleDayChange(index, 'DAY_DESCRIPTION', e.target.value)}
                                className="border border-gray-300 rounded-md shadow-sm p-2"
                                rows="3"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="text-sm font-medium text-gray-700 mb-1">Day Images</label>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => handleImageChange(index, e)}
                                className="border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddDay}
                    className="bg-blue-500 text-white rounded-md p-2"
                >
                    Add More Itinerary Days
                </button>

                <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-md p-2 mt-4"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Addtripdetails;
