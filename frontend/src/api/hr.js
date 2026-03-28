/**
 * api/hr.js
 * 
 * HR module APIs: Holidays, Policies, and Push Notifications.
 */
import apiClient from './client'

export const hrApi = {
  // Holidays
  listHolidays: (params = {}) => apiClient.get('/holidays', { params }),
  createHoliday: (data) => apiClient.post('/holidays', data),
  deleteHoliday: (id) => apiClient.delete(`/holidays/${id}`),

  // Policies
  listPolicies: () => apiClient.get('/company-policies'),
  createPolicy: (data) => apiClient.post('/company-policies', data),
  
  // Attendance
  getAttendance: (params = {}) => apiClient.get('/attendance', { params }),
  getAttendanceSummary: (params = {}) => apiClient.get('/attendance/summary', { params }),
  checkIn: (data) => apiClient.post('/attendance/check-in', data),
  checkOut: (data) => apiClient.post('/attendance/check-out', data),

  // Payroll
  getPayrollSummary: () => apiClient.get('/payroll/summary'),
  processPayroll: (data) => apiClient.post('/payroll/process', data),
}
