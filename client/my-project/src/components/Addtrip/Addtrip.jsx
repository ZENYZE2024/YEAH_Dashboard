import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format, differenceInDays, addDays } from 'date-fns';
import Navbar from '../navbar/navbar';

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
        additionalPickUpPoints: [{ pickUpPoint: '', time: '12:00 AM' }],
        cancellationType: 'percentage',
        cancellationPolicies: [
            {
                startDay: '',
                endDay: '',
                fee: '',
            }
        ],
    });

    const [days, setDays] = useState([]);
    const [tripImages, setTripImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [additionalImageInputs, setAdditionalImageInputs] = useState([{ id: Date.now() }]);
    const [coordinators, setCoordinators] = useState([{ name: '', role: '', email: '', cordinator_id: '', image: null, link: '', profile_mode: '' }]);


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
                DATE: formatDateWithSuffix(addDays(start, i - 1), 'd MMMM yyyy'),
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

        coordinators.forEach((coordinator, i) => {
            form.append(`coordinators[${i}][name]`, coordinator.name);
            form.append(`coordinators[${i}][role]`, coordinator.role);
            form.append(`coordinators[${i}][email]`, coordinator.email);
            form.append(`coordinators[${i}][cordinator_id]`, coordinator.cordinator_id);
            form.append(`coordinators[${i}][link]`, coordinator.link);
            form.append(`coordinators[${i}][profile_mode]`, coordinator.profile_mode);


            if (coordinator.image) {
                form.append(`coordinators[${i}][image]`, coordinator.image);
            }
        });



        const token = localStorage.getItem('accessToken');
        const { userId } = JSON.parse(atob(token.split('.')[1]));
        form.append('userId', userId);


        try {
            console.log(formData);
            form.append('additionalPickUpPoints', JSON.stringify(formData.additionalPickUpPoints));
            form.append('cancellationPolicies', JSON.stringify(formData.cancellationPolicies));
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


    const formatDateWithSuffix = (date) => {
        const day = date.getDate();
        const suffix = day % 10 === 1 && day !== 11 ? 'st' :
            day % 10 === 2 && day !== 12 ? 'nd' :
                day % 10 === 3 && day !== 13 ? 'rd' : 'th';
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day}${suffix} ${month} ${year}`;
    };


    const handleFieldChange = (field, value) => {
        if (field === 'trip_start_date' || field === 'end_date') {
            const formattedDate = formatDateWithSuffix(value);
            setFormData((prevData) => ({ ...prevData, [field]: value, [`${field}_formatted`]: formattedDate }));
        } else {
            setFormData((prevData) => ({ ...prevData, [field]: value }));
        }
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

    const handleCoordinatorChange = (index, e) => {
        const { name, value } = e.target;
        setCoordinators(prevCoordinators => {
            const updatedCoordinators = [...prevCoordinators];
            updatedCoordinators[index] = { ...updatedCoordinators[index], [name]: value };
            return updatedCoordinators;
        });
    };

    const handleCoordinatorFileChange = (index, e) => {
        const file = e.target.files[0];
        setCoordinators(prevCoordinators => {
            const updatedCoordinators = [...prevCoordinators];
            updatedCoordinators[index] = { ...updatedCoordinators[index], image: file };
            return updatedCoordinators;
        });
    };


    const addCoordinator = () => {
        setCoordinators(prevCoordinators => [
            ...prevCoordinators,
            { name: '', role: '', email: '', cordinator_id: '', image: null, link: '', profile_mode: '' }
        ]);
    };

    const removeCoordinator = (index) => {
        setCoordinators(prevCoordinators =>
            prevCoordinators.filter((_, i) => i !== index)
        );
    };

    const handleFormFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAdditionalPickUpPointChange = (index, field, value) => {
        setFormData(prevState => {
            const updatedPickUpPoints = [...prevState.additionalPickUpPoints];
            const point = updatedPickUpPoints[index];
            if (field === 'pickUpPoint') {
                point.pickUpPoint = value;
            } else if (field === 'time') {
                const [hours, minutes, period] = value.split(/[:\s]/);
                point.time = `${hours || '12'}:${minutes || '00'} ${period || 'AM'}`;
            }
            return { ...prevState, additionalPickUpPoints: updatedPickUpPoints };
        });
    };
    const handleAddPickUpPoint = () => {
        setFormData(prevState => ({
            ...prevState,
            additionalPickUpPoints: [...prevState.additionalPickUpPoints, { pickUpPoint: '', time: '12:00 AM' }]
        }));
    };

    const handleRemovePickUpPoint = (index) => {
        const updatedPickUpPoints = formData.additionalPickUpPoints.filter((_, i) => i !== index);
        setFormData(prevState => ({ ...prevState, additionalPickUpPoints: updatedPickUpPoints }));
    };

    const formatTimeTo12Hour = (time) => {
        if (!time) return '12:00 AM';
        const [hours, minutes, period] = time.split(/[:\s]/);
        const adjustedHours = parseInt(hours, 10) % 12 || 12;
        const adjustedMinutes = isNaN(parseInt(minutes, 10)) ? '00' : minutes;
        return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')} ${period || 'AM'}`;
    };

    const convertTo24Hour = (time) => {
        if (!time) return '';
        const [hours, minutes, period] = time.split(/[:\s]/);
        let adjustedHours = parseInt(hours, 10);
        if (period === 'PM' && adjustedHours !== 12) adjustedHours += 12;
        if (period === 'AM' && adjustedHours === 12) adjustedHours = 0;
        return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };


    const handleCancellationTypeChange = (e) => {
        setFormData({
            ...formData,
            cancellationType: e.target.value,
        });
    };

    const handlePolicyChange = (index, field, value) => {
        const updatedPolicies = [...formData.cancellationPolicies];
        updatedPolicies[index][field] = value;
        setFormData({
            ...formData,
            cancellationPolicies: updatedPolicies,
        });
    };

    const handleAddPolicy = () => {
        setFormData({
            ...formData,
            cancellationPolicies: [
                ...formData.cancellationPolicies,
                { startDay: '', endDay: '', fee: '' },
            ],
        });
    };

    const handleRemovePolicy = (index) => {
        const updatedPolicies = [...formData.cancellationPolicies];
        updatedPolicies.splice(index, 1);
        setFormData({
            ...formData,
            cancellationPolicies: updatedPolicies,
        });
    };
    return (
        <div>
            <div>
                <Navbar/>
            </div>
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
                    {formData.trip_start_date_formatted && <p>Start Date: {formData.trip_start_date_formatted}</p>}
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
                    {formData.end_date_formatted && <p> End Date: {formData.end_date_formatted}</p>}
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
                    <ReactQuill
                        value={formData.inclusion}
                        onChange={(value) => handleFieldChange('inclusion', value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        theme="snow"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Exclusion</label>
                    <ReactQuill
                        value={formData.exclusion}
                        onChange={(value) => handleFieldChange('exclusion', value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        theme="snow"
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Points to Note</label>
                    <ReactQuill
                        value={formData.points_to_note}
                        onChange={(value) => handleFieldChange('points_to_note', value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        theme="snow"
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
                    <ReactQuill
                        value={formData.trip_description}
                        onChange={(value) => handleFieldChange('trip_description', value)}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        theme="snow"
                        required
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Additional Pickup Points</label>
                    {formData.additionalPickUpPoints.map((point, index) => {
                        const timeParts = point.time ? formatTimeTo12Hour(point.time).split(/[:\s]/) : ['12', '00', 'AM'];
                        return (
                            <div key={index} className="flex space-x-4 mb-2">
                                <input
                                    type="text"
                                    placeholder="Pickup Point"
                                    value={point.pickUpPoint}
                                    onChange={(e) => handleAdditionalPickUpPointChange(index, 'pickUpPoint', e.target.value)}
                                    className="border border-gray-300 rounded-md p-2 flex-1"
                                />
                                <div className="flex space-x-2 flex-1">
                                    <select
                                        value={timeParts[0]}
                                        onChange={(e) => handleAdditionalPickUpPointChange(index, 'time', `${e.target.value}:${timeParts[1]} ${timeParts[2]}`)}
                                        className="border border-gray-300 rounded-md p-2 flex-1"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                                            <option key={hour} value={String(hour).padStart(2, '0')}>
                                                {String(hour).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={timeParts[1]}
                                        onChange={(e) => handleAdditionalPickUpPointChange(index, 'time', `${timeParts[0]}:${e.target.value} ${timeParts[2]}`)}
                                        className="border border-gray-300 rounded-md p-2 flex-1"
                                    >
                                        {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                                            <option key={minute} value={String(minute).padStart(2, '0')}>
                                                {String(minute).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={timeParts[2]}
                                        onChange={(e) => handleAdditionalPickUpPointChange(index, 'time', `${timeParts[0]}:${timeParts[1]} ${e.target.value}`)}
                                        className="border border-gray-300 rounded-md p-2 flex-1"
                                    >
                                        <option value="AM">AM</option>
                                        <option value="PM">PM</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemovePickUpPoint(index)}
                                    className="text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                    <button
                        type="button"
                        onClick={handleAddPickUpPoint}
                        className="mt-2 bg-blue-500 text-white p-2 rounded-md"
                    >
                        Add Pickup Point
                    </button>
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
                    <label className="text-sm font-medium text-gray-700 mb-1">GoogleMap Link</label>
                    <input
                        type="text"
                        value={formData.googlemap}
                        onChange={(e) => handleFieldChange('googlemap', e.target.value)}
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


                <div>
                    <button
                        type="button"
                        onClick={handleAddDay}
                        className="bg-blue-500 text-white rounded-md p-2"
                    >
                        Add More Itinerary Days
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4">Coordinators</h3>
                    {coordinators.map((coordinator, index) => (
                        <div key={index} className="border p-4 rounded-lg mb-4 bg-white shadow-md">
                            <div className="mb-4">
                                <label htmlFor={`coordinatorName${index}`} className="block text-sm font-medium text-gray-700">Name:</label>
                                <input
                                    type="text"
                                    id={`coordinatorName${index}`}
                                    name="name"
                                    value={coordinator.name}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    required
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`coordinatorRole${index}`} className="block text-sm font-medium text-gray-700">Role:</label>
                                <input
                                    type="text"
                                    id={`coordinatorRole${index}`}
                                    name="role"
                                    value={coordinator.role}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    required
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`cordinator_id${index}`} className="block text-sm font-medium text-gray-700">ID:</label>
                                <input
                                    type="text"
                                    id={`cordinator_id${index}`}
                                    name="cordinator_id"
                                    value={coordinator.cordinator_id}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    required
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`coordinatorEmail${index}`} className="block text-sm font-medium text-gray-700">Email:</label>
                                <input
                                    type="email"
                                    id={`coordinatorEmail${index}`}
                                    name="email"
                                    value={coordinator.email}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    required
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`coordinatorLink${index}`} className="block text-sm font-medium text-gray-700">Link:</label>
                                <input
                                    type="text"
                                    id={`coordinatorLink${index}`}
                                    name="link"
                                    value={coordinator.link}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`coordinatorProfileMode${index}`} className="block text-sm font-medium text-gray-700">Profile Mode:</label>
                                <select
                                    id={`coordinatorProfileMode${index}`}
                                    name="profile_mode"
                                    value={coordinator.profile_mode}
                                    onChange={(e) => handleCoordinatorChange(index, e)}
                                    className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                >
                                    <option value="">Select profile mode</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="instagram">Instagram</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor={`coordinatorImage${index}`} className="block text-sm font-medium text-gray-700">Coordinator Image:</label>
                                <input
                                    type="file"
                                    id={`coordinatorImage${index}`}
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => handleCoordinatorFileChange(index, e)}
                                    className="mt-1 block w-full text-gray-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeCoordinator(index)}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Remove Coordinator
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addCoordinator}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Coordinator
                    </button>
                </div>
                <div className="mb-6">
                    <label className="text-lg font-medium text-gray-700 mb-2 block">Cancellation Fee Type</label>
                    <select
                        value={formData.cancellationType}
                        onChange={handleCancellationTypeChange}
                        className="border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 p-3 w-full text-gray-800"
                    >
                        <option value="percentage">Percentage</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-4 px-6 text-left rounded-tl-lg bg-teal-400 text-gray-800 font-semibold">
                                    Policy Start Day
                                </th>
                                <th className="py-4 px-6 text-left bg-teal-300 text-gray-800 font-semibold">
                                    Policy End Day
                                </th>
                                <th className="py-4 px-6 text-left bg-teal-200 text-gray-800 font-semibold">
                                    {formData.cancellationType === 'percentage' ? 'Cancellation Fee (%)' : 'Cancellation Fee (Amount)'}
                                </th>
                                <th className="py-4 px-6 text-center rounded-tr-lg bg-teal-500 text-white font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 text-sm font-light">
                            {formData.cancellationPolicies.map((policy, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150">
                                    <td className="py-3 px-6">
                                        <input
                                            type="text"
                                            value={policy.startDay}
                                            onChange={(e) => handlePolicyChange(index, 'startDay', e.target.value)}
                                            placeholder="Policy Start Day"
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                    </td>
                                    <td className="py-3 px-6">
                                        <input
                                            type="text"
                                            value={policy.endDay}
                                            onChange={(e) => handlePolicyChange(index, 'endDay', e.target.value)}
                                            placeholder="Policy End Day"
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                    </td>
                                    <td className="py-3 px-6">
                                        <input
                                            type="text"
                                            value={policy.fee}
                                            onChange={(e) => handlePolicyChange(index, 'fee', e.target.value)}
                                            placeholder={formData.cancellationType === 'percentage' ? "Cancellation Fee (%)" : "Cancellation Fee (Amount)"}
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePolicy(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full shadow-md transition duration-150"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleAddPolicy}
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition duration-150"
                    >
                        Add More Cancellation Policies
                    </button>
                </div>



                <div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded-md p-2 mt-4"
                    >
                        Submit
                    </button>
                </div>


            </form>
        </div>
        </div>
    );
}

export default Addtripdetails;
