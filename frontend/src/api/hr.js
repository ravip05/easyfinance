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
  
  // Push Notifications
  registerPush: (data) => apiClient.post('/push-subscriptions', data),
  unregisterPush: (data) => apiClient.delete('/push-subscriptions', { data }),
}
