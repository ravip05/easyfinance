/**
 * api/franchise.js
 */
import apiClient from './client'

export const franchiseApi = {
  list: (params = {}) => apiClient.get('/franchises', { params }),
  create: (data) => apiClient.post('/franchises', data),
  update: (id, data) => apiClient.patch(`/franchises/${id}`, data),
  destroy: (id) => apiClient.delete(`/franchises/${id}`),
  getLeads: (id) => apiClient.get(`/franchises/${id}/leads`),
  getPayouts: (id) => apiClient.get(`/franchises/${id}/payouts`),
}
