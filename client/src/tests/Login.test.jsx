import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Login from '../pages/Login';

describe('Login Component UI Test', () => {
  it('Render the login title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Verify that the title "Library Login" is present in the document
    const titleElement = screen.getByText(/Library Login/i);
    expect(titleElement).not.toBeNull();
  });
  it('It should allow writing in the email and password inputs', () => {
    render(
        <BrowserRouter>
        <Login />
        </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/name@university.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'alumno@university.edu.mx' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Check if the input values have been updated correctly
    expect(emailInput.value).toBe('alumno@university.edu.mx');
    expect(passwordInput.value).toBe('password123');
    })
});

