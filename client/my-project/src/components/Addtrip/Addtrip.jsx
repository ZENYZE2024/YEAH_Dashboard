import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format, differenceInDays, addDays } from 'date-fns';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';



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

    });

    const [days, setDays] = useState([]);
    const [tripImages, setTripImages] = useState([]);
    const [additionalImages, setAdditionalImages] = useState([]);
    const [additionalImageInputs, setAdditionalImageInputs] = useState([{ id: Date.now() }]);
    const [coordinators, setCoordinators] = useState([{ name: '', role: '', email: '' }]);
    const [cancellationPolicies, setCancellationPolicies] = useState([]);
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [policiesPerPage] = useState(5); // Number of policies per page

    const filteredPolicies = cancellationPolicies.filter(policy =>
        policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.feeType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastPolicy = currentPage * policiesPerPage;
    const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
    const currentPolicies = filteredPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);
    const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

    useEffect(() => {
        const fetchCancellationPolicies = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getCancellationPolicies');
                setCancellationPolicies(response.data);
            } catch (error) {
                console.error('Error fetching cancellation policies:', error);
            }
        };

        fetchCancellationPolicies();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleCheckboxChange = (policyId) => {
        setSelectedPolicies((prevSelected) => {
            if (prevSelected.includes(policyId)) {
                return prevSelected.filter(id => id !== policyId); // Unselect
            } else {
                return [...prevSelected, policyId]; // Select
            }
        });
    };




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
        });

        const selectedPolicyData = cancellationPolicies.filter(policy => selectedPolicies.includes(policy.id));
        form.append('cancellationPolicies', JSON.stringify(selectedPolicyData));

        const token = localStorage.getItem('accessToken');
        const { userId } = JSON.parse(atob(token.split('.')[1]));
        form.append('userId', userId);


        try {
            form.append('additionalPickUpPoints', JSON.stringify(formData.additionalPickUpPoints));
            form.append('cancellationPolicies', JSON.stringify(formData.cancellationPolicies));
            const response = await axios.post('https://admin.yeahtrips.in/addtrips', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Trip details submitted successfully!');
            window.location.reload()
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

            // If the name field is changed, find the corresponding coordinator and update the email
            if (name === 'name') {
                const selectedCoordinator = coordinatorsList.find(coordinator => coordinator.name === value);
                if (selectedCoordinator) {
                    // Auto-populate the email based on the selected coordinator
                    updatedCoordinators[index] = {
                        ...updatedCoordinators[index],
                        [name]: value,
                        email: selectedCoordinator.email // Auto-fill the email field
                    };
                } else {
                    // If no matching coordinator is found, just update the name
                    updatedCoordinators[index] = {
                        ...updatedCoordinators[index],
                        [name]: value
                    };
                }
            } else {
                // Update other fields (like role, id, etc.)
                updatedCoordinators[index] = {
                    ...updatedCoordinators[index],
                    [name]: value
                };
            }

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


    const [coordinatorsList, setCoordinatorsList] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCoordinators = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getthecoordinators');

                // Filter coordinators that are not 'super user'
                const filteredCoordinators = response.data.filter(coordinator => coordinator.role !== 'Super User');

                // Set the coordinators in the state
                setCoordinatorsList(filteredCoordinators);
            } catch (err) {
                setError('Error fetching coordinators');
                console.error('Error fetching coordinators:', err);
            }
        };

        fetchCoordinators();
    }, []);


    return (
        <div>
            <div>
                <AdminNavbar />
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
                        <label className="text-sm font-medium text-gray-700 mb-1">Trip Description</label>
                        <ReactQuill
                            value={formData.trip_description}
                            onChange={(value) => handleFieldChange('trip_description', value)}
                            className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                            theme="snow"
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

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">Pickup Points</label>
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
                            Add Additional Pickup Point
                        </button>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">PickuppointMap Link</label>
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
                                <ReactQuill
                                    value={day.DAY_DESCRIPTION || ''}
                                    onChange={(value) => handleDayChange(index, 'DAY_DESCRIPTION', value)}
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
                                {/* Name Dropdown */}
                                <div className="mb-4">
                                    <label htmlFor={`coordinatorName${index}`} className="block text-sm font-medium text-gray-700">Name:</label>
                                    <select
                                        id={`coordinatorName${index}`}
                                        name="name"
                                        value={coordinator.name}
                                        onChange={(e) => handleCoordinatorChange(index, e)}
                                        required
                                        className="border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                                    >
                                        <option value="">Select Coordinator</option>
                                        {coordinatorsList.map((optionCoordinator, i) => (
                                            <option key={i} value={optionCoordinator.name}>
                                                {optionCoordinator.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Auto-populated Email */}
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
                                        readOnly
                                    />
                                </div>

                                {/* Role Input */}
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


                    <div className="mb-4 p-4 border rounded-lg shadow-md bg-white">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Cancellation Policies</h2>

                        {/* Search bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search policies..."
                                className="w-full p-2 border rounded-lg text-gray-700"
                            />
                        </div>

                        {/* Policies List */}
                        {currentPolicies.map((policy) => (
                            <div key={policy.id} className="flex items-start mb-4 p-2 border-b last:border-b-0">
                                <input
                                    type="checkbox"
                                    id={`policy-${policy.id}`}
                                    checked={selectedPolicies.includes(policy.id)}
                                    onChange={() => handleCheckboxChange(policy.id)}
                                    className="mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`policy-${policy.id}`} className="cursor-pointer text-gray-700">
                                    <span className="font-medium">{policy.feeType}</span> (Policy ID: {policy.id})
                                    <div className="font-medium">{policy.policyName}</div>

                                    {policy.dateRanges.length > 0 && (
                                        <ul className="ml-4 mt-1 text-sm text-gray-600">
                                            {policy.dateRanges.map((range, index) => (
                                                <li key={index} className="flex">
                                                    <span className="font-semibold">Start:</span> <span className="ml-1">{range.startDate}</span>
                                                    <span className="font-semibold ml-2">End:</span> <span className="ml-1">{range.endDate}</span>
                                                    <span className="font-semibold ml-2">Fee:</span> <span className="ml-1">{range.fee}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </label>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
                            >
                                Next
                            </button>
                        </div>
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
