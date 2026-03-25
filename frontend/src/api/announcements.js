/**
 * api/announcements.js
 */
import apiClient from './client'

export const announcementsApi = {
  list: (params = {}) => apiClient.get('/announcements', { params }),
  markRead: (id) => apiClient.post(`/announcements/${id}/read`),
}
