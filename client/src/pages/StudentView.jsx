import React, { useState, useEffect } from 'react';
import axios from 'axios';


function StudentView() {
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchRooms = (filter = {}) => {
    axios.get(`${import.meta.env.VITE_API_URL}/rooms`, { params: filter })
      .then(response => {
        setRooms(response.data);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch rooms.');
      });
  };

  const fetchFeatures = () => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/rooms`),
      axios.get(`${import.meta.env.VITE_API_URL}/features`)
    ])
    .then(([roomsRes, featuresRes]) => {
      setRooms(roomsRes.data);
      setFeatures(featuresRes.data);
    })
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRooms();
    fetchFeatures();
  }, []);

  const handleFeatureChange = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]
    );
  };

  // Format HTML5 datetime-local value to MySQL DATETIME format
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return dateTimeStr.replace('T', ' ') + ':00';
  };

  const handleSearch = () => {
    setError('');

    //Start and end time validation
    if (!startTime || !endTime) {
      alert("Both start and end times are required");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      alert("Start time cannot be in the past");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time");
      return;
    }

    const diffMs = end - start;
    const maxDuration = 4 * 60 * 60 * 1000; // 4 hours

    if (diffMs > maxDuration) {
      alert("Reservations cannot be longer than 4 hours");
      return;
    }

    const minDuration = 30 * 60 * 1000; // 30 minutes

    if (diffMs < minDuration) {
      alert("Reservations must be at least 30 minutes long");
      return;
    }

    const params = {};
    if (searchTerm.trim() !== '') params.search = searchTerm;
    if (capacity.trim() !== '') params.capacity = capacity;
    if (selectedFeatures.length > 0) params.features = selectedFeatures.join(',');
    
    if (startTime && endTime) {
      params.startTime = formatDateTime(startTime);
      params.endTime = formatDateTime(endTime);
    }

    fetchRooms(params);
  };

  // Handle reservation creation
  const handleMakeReservation = (roomId) => {
    setError('');
    setSuccessMessage('');

    if (!startTime || !endTime) {
      setError('Please select a Start and End time before reserving.');
      return;
    }

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      setError('Your session expired. Please log in again.');
      return;
    }
    // Payload to POST /reservations
    const reservationData = {
      UserID: user.UserID, // Use the actual logged-in user ID
      RoomID: roomId,
      StartTime: formatDateTime(startTime),
      EndTime: formatDateTime(endTime),
      Status: 'pending' // Default status for new reservations
    };

    axios.post(`${import.meta.env.VITE_API_URL}/reservations`, reservationData)
      .then(response => {
        setSuccessMessage('Reservation requested! Status: Pending review.');
        handleSearch();
      })
      .catch(err => {
        console.error(err);
        setError('Failed to process reservation.');
      });
  };


  return (
    <div className="container mt-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Study Room Reservation System</h1>
        <p className="lead text-muted">University Library</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="mb-4">
        <h3 className='text-center'>Looking for a specific study room?</h3>
        <form className="d-flex" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <input 
            className="form-control me-2" 
            type="text" 
            placeholder="Search by Room Name" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" type="button" onClick={handleSearch}>
            Search
          </button>
        </form>
      </div>

      <div className='shadow-sm bg-light p-4 m-4 rounded'>
        <h4 className='text-center'>Filters & Schedule</h4>
        <div className='row'>
          <div className='col-md-6 mb-3'>
            <label className='form-label fw-bold text-secondary'>Start Date & Time</label>
            <input 
              type='datetime-local' 
              className='form-control' 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className='col-md-6 mb-3'>
            <label className='form-label fw-bold text-secondary'>End Date & Time</label>
            <input 
              type='datetime-local' 
              className='form-control' 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className='row mt-3 justify-content-center'>
          <div className='col-md-4 mb-3'>
            <label className='form-label'>Minimum Capacity</label>
            <input 
              type='number' 
              className='form-control' 
              placeholder='Ex: 4' 
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
            />
          </div>
          <div className='col-md-5 mb-3'>
            <label className='form-label d-block fw-semibold'>Features</label>
            <div className="d-flex gap-3 mt-2">
              {features.length === 0 && <span className="text-muted">Cargando features…</span>}
              {features.map(feat => (
                <div className='form-check' key={feat.FeatureID}>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id={`feat-${feat.FeatureID}`}
                    checked={selectedFeatures.includes(feat.FeatureID)}
                    onChange={() => handleFeatureChange(feat.FeatureID)}
                  />
                  <label className='form-check-label' htmlFor={`feat-${feat.FeatureID}`}>
                    {feat.FeatureName}
                  </label>
                </div>
              ))}
            </div>  
          </div>
        </div>
      </div>

      <div className="row">
        {rooms.map(room => (
          <div className="col-md-4 mb-4" key={room.RoomID}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold">{room.RoomName}</h5>
                <p className="card-text">
                  <strong>Capacity:</strong> {room.Capacity} <br />
                  <strong>Features:</strong> {room.features || 'Standard setup'}
                </p>
                <span className={`badge ${room.DynamicStatus === 'Available' ? 'bg-success' : 'bg-danger'}`}>
                  {room.DynamicStatus}
                </span>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <button 
                  className="btn btn-outline-primary w-100" 
                  disabled={room.DynamicStatus !== 'Available'}
                  onClick={() => handleMakeReservation(room.RoomID)}
                >
                  Make a reservation
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentView;