import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // get rooms from backend
    axios.get('http://localhost:3000/rooms')
      .then(response => {
        setRooms(response.data);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch rooms.');
      });
  }, []);

  return (
    <div className="container mt-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Study Room Reservation System</h1>
        <p className="lead text-muted">University Library</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4">
        <h3 className='text-center'>Looking for a specific study room?</h3>
        <form className="d-flex">
          <input className="form-control me-2" type="text" placeholder="Study Room Name" />
          <button className="btn btn-primary" type="button">Search</button>
        </form>
      </div>

      <div className='shadow-sm bg-light p-4 m-4 rounded '>
        <h4 className='text-center'>Filters</h4>
        <div className='row justify-content-center'>
          <div className='col-md-4 mb-3 me-4'>
            <label className='form-label'>Capacity</label>
            <input type='number' className='form-control' placeholder='Minimum capacity' />
          </div>
          <div className='col-md-4 mb-3 ms-4'>
            <label className='form-label'>Features</label>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='1' />
              <label className='form-check-label' htmlFor='whiteboard'>Whiteboard</label>
            </div>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='2' />
              <label className='form-check-label' htmlFor='Video_Conferencing'>Video Conferencing</label>
            </div>
            <div className='form-check'>
              <input className='form-check-input' type='checkbox' id='3' />
              <label className='form-check-label' htmlFor='projector'>Projector</label>
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
