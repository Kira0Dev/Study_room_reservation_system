import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminView() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('');
  const [formFeatures, setFormFeatures] = useState([]); 

  const fetchRooms = (filter = {}) => {
    axios.get('http://localhost:3000/rooms', { params: filter })
      .then(response => setRooms(response.data))
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

  const handleFormFeatureChange = (featureId) => {
    setFormFeatures(prev => 
      prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]
    );
  };

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

  //Admin function to update reservation status
  
  const handleUpdateReservationStatus = (reservationId, newStatus) => {
    setError('');
    setSuccessMessage('');

    axios.put(`http://localhost:3000/reservations/${reservationId}`, { Status: newStatus })
      .then(() => {
        setSuccessMessage(`Reservation status updated to: ${newStatus}`);
        handleSearch(); // Refresh the view
      })
      .catch(err => {
        console.error(err);
        setError('Failed to update reservation status.');
      });
  };

  // ROOM's CRUD (POST, PUT, DELETE)

  const resetForm = () => {
    setRoomName('');
    setRoomCapacity('');
    setFormFeatures([]);
    setIsEditing(false);
    setEditingRoomId(null);
    setShowForm(false);
  };

  const handleSaveRoom = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const roomData = {
      RoomName: roomName,
      Capacity: Number(roomCapacity),
      features: formFeatures // Array 
    };

    if (isEditing) {
      axios.put(`http://localhost:3000/rooms/${editingRoomId}`, roomData)
        .then(() => {
          setSuccessMessage('Room updated successfully.');
          resetForm();
          handleSearch();
        })
        .catch(err => setError(err.response?.data?.message || 'Error updating room.'));
    } else {
      // Create new room
      axios.post('http://localhost:3000/rooms', roomData)
        .then(() => {
          setSuccessMessage('New room created successfully.');
          resetForm();
          handleSearch();
        })
        .catch(err => setError(err.response?.data?.message || 'Error creating room.'));
    }
  };

  const handleEditClick = (room) => {
    setIsEditing(true);
    setEditingRoomId(room.RoomID);
    setRoomName(room.RoomName);
    setRoomCapacity(room.Capacity);
    setFormFeatures(room.FeatureIDs ? room.FeatureIDs.split(',').map(Number) : []);
    setShowForm(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      setError('');
      setSuccessMessage('');
      axios.delete(`http://localhost:3000/rooms/${roomId}`)
        .then(() => {
          setSuccessMessage('Room deleted completely.');
          handleSearch();
        })
        .catch(err => setError('Failed to delete the room.'));
    }
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
      <header className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
        <div>
          <h1 className="fw-bold text-danger">Library Administration Panel</h1>
          <p className="lead text-muted">Control Desk Hub</p>
        </div>
        <button 
          className={`btn ${showForm ? 'btn-secondary' : 'btn-danger'} fw-bold px-4 py-2`}
          onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
        >
          {showForm ? 'Cancel Operation' : '＋ Add New Room'}
        </button>
      </header>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}
      {successMessage && <div className="alert alert-success shadow-sm">{successMessage}</div>}

      {showForm && (
        <div className="card border-danger shadow-sm mb-4 bg-white animate__animated animate__fadeIn">
          <div className="card-header bg-danger text-white fw-bold">
            {isEditing ? `Editing Room: ${roomName}` : 'Register a New Study Room'}
          </div>
          <form onSubmit={handleSaveRoom} className="card-body row">
            <div className="col-md-5 mb-3">
              <label className="form-label fw-semibold">Room Name</label>
              <input type="text" className="form-control" placeholder="Ex: Cubículo B-12" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label fw-semibold">Max Capacity</label>
              <input type="number" className="form-control" min="1" placeholder="Ex: 6" value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label d-block fw-semibold">Room Equipment Features</label>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="form-feat-1" checked={formFeatures.includes(1)} onChange={() => handleFormFeatureChange(1)} />
                <label className="form-check-label" htmlFor="form-feat-1">Whiteboard</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="form-feat-2" checked={formFeatures.includes(2)} onChange={() => handleFormFeatureChange(2)} />
                <label className="form-check-label" htmlFor="form-feat-2">Video Conf.</label>
              </div>
              <div className="form-check form-check-inline">
                <input className="form-check-input" type="checkbox" id="form-feat-3" checked={formFeatures.includes(3)} onChange={() => handleFormFeatureChange(3)} />
                <label className="form-check-label" htmlFor="form-feat-3">Projector</label>
              </div>
            </div>
            <div className="col-12 text-end mt-2">
              <button type="button" className="btn btn-light me-2" onClick={resetForm}>Clear</button>
              <button type="submit" className="btn btn-danger px-4 fw-bold">{isEditing ? 'Apply Changes' : 'Save Room'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <h3 className='text-center fw-semibold text-secondary mb-3'>Room Filter</h3>
        <form className="d-flex" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <input className="form-control me-2 shadow-sm" type="text" placeholder="Search rooms by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className="btn btn-primary px-4 shadow-sm" type="button" onClick={handleSearch}>Search</button>
        </form>
      </div>

      <div className='shadow-sm bg-light p-4 mb-5 rounded border'>
        <h4 className='text-center text-muted mb-3'>Filters & Schedule</h4>
        <div className='row'>
          <div className='col-md-6 mb-3'>
            <label className='form-label fw-bold text-secondary'>Start Date & Time</label>
            <input type='datetime-local' className='form-control' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className='col-md-6 mb-3'>
            <label className='form-label fw-bold text-secondary'>End Date & Time</label>
            <input type='datetime-local' className='form-control' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className='row mt-2 justify-content-center'>
          <div className='col-md-4 mb-3'>
            <label className='form-label fw-semibold'>Minimum Capacity</label>
            <input type='number' className='form-control' placeholder='Ex: 4' value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" />
          </div>
          <div className='col-md-5 mb-3'>
            <label className='form-label d-block fw-semibold'>Features</label>
            <div className="d-flex gap-3 mt-2">
              <div className='form-check'>
                <input className='form-check-input' type='checkbox' id='feat-1' checked={selectedFeatures.includes(1)} onChange={() => handleFeatureChange(1)} />
                <label className='form-check-label' htmlFor='feat-1'>Whiteboard</label>
              </div>
              <div className='form-check'>
                <input className='form-check-input' type='checkbox' id='feat-2' checked={selectedFeatures.includes(2)} onChange={() => handleFeatureChange(2)} />
                <label className='form-check-label' htmlFor='feat-2'>Video Call</label>
              </div>
              <div className='form-check'>
                <input className='form-check-input' type='checkbox' id='feat-3' checked={selectedFeatures.includes(3)} onChange={() => handleFeatureChange(3)} />
                <label className='form-check-label' htmlFor='feat-3'>Projector</label>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="row">
        {rooms.map(room => (
          <div className="col-md-4 mb-4" key={room.RoomID}>
            <div className="card h-100 shadow-sm border-2">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold text-dark mb-0">{room.RoomName}</h5>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-1 bg-secondary text-white" onClick={() => handleEditClick(room)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger bg-danger text-white" onClick={() => handleDeleteRoom(room.RoomID)}>Delete</button>
                    </div>
                  </div>
                  <p className="card-text">
                    <strong>Capacity:</strong> {room.Capacity} <br />
                    <strong>Features:</strong> {room.features || 'Standard setup'}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-2">
                    <span className="small text-secondary fw-bold">Live Status:</span>
                    <span className={`badge ${room.DynamicStatus === 'Available' ? 'bg-success' : 'bg-danger'}`}>
                      {room.DynamicStatus}
                    </span>
                  </div>
                  {room.DynamicStatus === 'Reserved' && room.ReservationID && (
                    <div className="border border-warning p-2 rounded bg-white mt-2 shadow-inner">
                      <p className="small mb-1 text-center fw-semibold text-warning-dark">
                        Current Order Status: <span className="badge bg-warning text-dark">{room.ReservationStatus}</span>
                      </p>
                      {room.ReservationStatus === 'pending' && (
                        <div className="d-flex gap-1 mt-2">
                          <button 
                            className="btn btn-success btn-sm w-50 fw-bold"
                            onClick={() => handleUpdateReservationStatus(room.ReservationID, 'approved')}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm w-50"
                            onClick={() => handleUpdateReservationStatus(room.ReservationID, 'cancelled')}
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                      {room.ReservationStatus === 'approved' && (
                        <button 
                          className="btn btn-secondary btn-sm w-100 mt-1"
                          onClick={() => handleUpdateReservationStatus(room.ReservationID, 'cancelled')}
                        >
                          Revoke / Close Check-in
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <button 
                    className={`btn btn-outline-primary w-100 ${room.DynamicStatus === 'Available' ? '' : 'd-none'}`}
                    disabled={room.DynamicStatus !== 'Available'}
                    onClick={() => handleMakeReservation(room.RoomID)}
                  >
                    Make a reservation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminView;