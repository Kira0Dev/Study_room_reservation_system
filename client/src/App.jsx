import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import StudentView from './pages/StudentView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminView from './pages/AdminView';


const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  //if there's no token or user info, redirect to login
  if (!token || !storedUser) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(storedUser);

  // verify user role matches the required role for this route
  if (roleRequired && user.role !== roleRequired) {
    // Redirect students to StudentView
    if (user.role === 'student') return <Navigate to="/StudentView" />;
    // Redirect admins to AdminView
    if (user.role === 'admin') return <Navigate to="/AdminView" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route 
          path="/StudentView" 
          element={
            <ProtectedRoute roleRequired="student">
              <StudentView />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/AdminView" 
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminView />
            </ProtectedRoute>
          } 
        />

        {/* If users navigate to the root path, redirect them to login or their respective dashboard */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;