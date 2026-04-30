import axios from 'axios'

const API = axios.create({
  baseURL: 'https://api.vulnforge.app',
  timeout: 300000,
  withCredentials: true // ✅ Crucial for sending HttpOnly cookies!
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