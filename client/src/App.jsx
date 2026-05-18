import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import StudentView from './pages/StudentView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminView from './pages/AdminView';

// Este es un componente "Guardián" falso por ahora. 
// Más adelante aquí verificaremos si existe un Token JWT o una sesión.
const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  // Si no hay token, significa que no se ha logueado
  if (!token || !storedUser) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(storedUser);

  // Verificamos si su rol coincide con el requerido (comparamos con user.Role de tu DB)
  if (roleRequired && user.Role !== roleRequired) {
    // Si un estudiante intenta entrar a admin, lo regresamos a su vista
    if (user.Role === 'student') return <Navigate to="/student" />;
    // Si un admin cae en rutas de estudiante por error, lo mandamos a admin
    if (user.Role === 'admin') return <Navigate to="/admin" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Rutas Protegidas */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute roleRequired="student">
              <StudentView />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminView />
            </ProtectedRoute>
          } 
        />

        {/* Si entran a la raíz ("/"), los redirigimos al login o al panel según prefieras */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;