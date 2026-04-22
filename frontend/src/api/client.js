/** Cache Bust: 2026-04-22 21:25:40 **/
import axios from 'axios'

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.trycloudflare.com') || window.location.hostname.endsWith('.loca.lt'))
  ? '' 
  : 'https://backend-flax-delta-18.vercel.app'

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('crm_token')
  if (token) {
    if (config.headers.set) {
        config.headers.set('Authorization', `Bearer ${token}`)
    } else {
        config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('crm_token')
      sessionStorage.removeItem('crm_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient