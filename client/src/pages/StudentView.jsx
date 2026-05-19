import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentView() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchRooms = (filter = {}) => {
    axios.get('http://localhost:3000/rooms', { params: filter })
      .then(response => {
        setRooms(response.data);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch rooms.');
      });
  };

  useEffect(() => {
    fetchRooms();
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
      UserID: user.ID, // Use the actual logged-in user ID
      RoomID: roomId,
      StartTime: formatDateTime(startTime),
      EndTime: formatDateTime(endTime),
      Status: 'pending' // Default status for new reservations
    };

    axios.post('http://localhost:3000/reservations', reservationData)
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
          <div className='col-md-4 mb-3'>
            <label className='form-label d-block'>Features</label>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='feature-1' checked={selectedFeatures.includes(1)} onChange={() => handleFeatureChange(1)} />
              <label className='form-check-label' htmlFor='feature-1'>Whiteboard</label>
            </div>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='feature-2' checked={selectedFeatures.includes(2)} onChange={() => handleFeatureChange(2)} />
              <label className='form-check-label' htmlFor='feature-2'>Video Conferencing</label>
            </div>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='feature-3' checked={selectedFeatures.includes(3)} onChange={() => handleFeatureChange(3)} />
              <label className='form-check-label' htmlFor='feature-3'>Projector</label>
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