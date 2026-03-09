import axios from 'axios'

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '') + '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('crm_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('crm_token')
      sessionStorage.removeItem('crm_user')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default apiClient