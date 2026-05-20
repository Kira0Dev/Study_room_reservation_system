import { describe, it, expect } from 'vitest';

// The same logic as StudentView and AdminView to test the date formatting utility function
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  return dateTimeStr.replace('T', ' ') + ':00';
};

describe('Utility Functions - Date Formatter', () => {
  
  it('Should convert the datetime-local format of HTML5 to the DATETIME format of MySQL', () => {
    const inputFromFrontend = '2026-05-20T16:30';
    const expectedOutputMySQL = '2026-05-20 16:30:00';

    const result = formatDateTime(inputFromFrontend);

    // Verify that the "T" is replaced with a space and seconds are added (:00)
    expect(result).toBe(expectedOutputMySQL);
  });

  it('Should return an empty string if no date is provided', () => {
    const result = formatDateTime('');
    expect(result).toBe('');
  });
});