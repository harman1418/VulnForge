import axios from 'axios'

const API = axios.create({
  baseURL: 'https://api.vulnforge.app',
  timeout: 300000,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')  // ✅ token is right there
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default API