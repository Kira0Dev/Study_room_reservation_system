import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  // Filters useState
  const [searchTerm, setSearchTerm] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // fetcchRooms with filters
  const fetchRooms = (filter = {}) => {
    // axios.get with {params} convert the query into a url
    axios.get('http://localhost:3000/rooms', { params: filter })
      .then(response => {
        setRooms(response.data);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch rooms.');
      });
  };

  // Initial fetch of rooms without filters
  useEffect(() => {
    fetchRooms();
  }, []);

  // Checkboxes handler for features
  const handleFeatureChange = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Search button handler
  const handleSearch = () => {
    const params = {};
    if (searchTerm.trim() !== '') params.search = searchTerm;
    if (capacity.trim() !== '') params.capacity = capacity;
    if (selectedFeatures.length > 0) params.features = selectedFeatures.join(','); // Convierte [1, 2] a "1,2"

    fetchRooms(params);
  };

  return (
    <div className="container mt-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Study Room Reservation System</h1>
        <p className="lead text-muted">University Library</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

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

      <div className='shadow-sm bg-light p-4 m-4 rounded '>
        <h4 className='text-center'>Filters</h4>
        <div className='row justify-content-center'>
          <div className='col-md-4 mb-3 me-4'>
            <label className='form-label'>Capacity</label>
            <input 
              type='number' 
              className='form-control' 
              placeholder='Minimum capacity' 
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="1"
            />
          </div>
          <div className='col-md-4 mb-3 ms-4'>
            <label className='form-label'>Features</label>
            <div className='form-check'>
              <input 
                className='form-check-input' 
                type='checkbox' 
                id='feature-1' 
                checked={selectedFeatures.includes(1)}
                onChange={() => handleFeatureChange(1)}
              />
              <label className='form-check-label' htmlFor='feature-1'>Whiteboard</label>
            </div>
            <div className='form-check'>
              <input 
                className='form-check-input' 
                type='checkbox' 
                id='feature-2'
                checked={selectedFeatures.includes(2)}
                onChange={() => handleFeatureChange(2)}
              />
              <label className='form-check-label' htmlFor='feature-2'>Video Conferencing</label>
            </div>
            <div className='form-check'>
              <input 
                className='form-check-input' 
                type='checkbox' 
                id='feature-3'
                checked={selectedFeatures.includes(3)}
                onChange={() => handleFeatureChange(3)}
              />
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
                  <strong>Features:</strong> {room.features}
                </p>
                <span className={`badge ${room.Status === 'available' ? 'bg-success' : room.Status === 'in use' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                  {room.Status === 'available' ? 'Available' : room.Status === 'in use' ? 'In Use' : 'Under Maintenance'}
                </span>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <button className="btn btn-outline-primary w-100" disabled={room.Status !== 'available'}>
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

export default App;