/**
 * api/hr.js
 * 
 * HR module APIs: Holidays, Policies, Leave Management, Attendance, Push.
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
  updatePolicy: (id, data) => apiClient.put(`/admin/hr/policies/${id}`, data),
  deletePolicy: (id) => apiClient.delete(`/admin/hr/policies/${id}`),
  
  // Attendance
  getAttendance: (params = {}) => apiClient.get('/attendance', { params }),
  getAttendanceSummary: (params = {}) => apiClient.get('/attendance/summary', { params }),
  checkIn: (data) => apiClient.post('/attendance/check-in', data),
  checkOut: (data) => apiClient.post('/attendance/check-out', data),

  // Leave Management
  listLeaves: (params = {}) => apiClient.get('/leaves', { params }),
  applyLeave: (data) => apiClient.post('/leaves', data),
  updateLeave: (id, data) => apiClient.patch(`/leaves/${id}`, data),
  onLeaveToday: () => apiClient.get('/leaves/on-leave-today'),

  // Payroll
  getPayrollSummary: () => apiClient.get('/payroll/summary'),
  processPayroll: (data) => apiClient.post('/payroll/process', data),

  // Staff self-view
  getStaffPayouts: () => apiClient.get('/staff/payouts'),
  getCommissionData: () => apiClient.get('/staff/commissions'),
  getStaffPerformance: () => apiClient.get('/admin/staff-performance'),
}
