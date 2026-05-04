import axios from 'axios'

const API = axios.create({
  baseURL: 'https://api.vulnforge.app',
  timeout: 300000,
  withCredentials: true // ✅ Crucial for sending HttpOnly cookies!
})

// Prevent infinite redirect loops — only redirect once
let isRedirecting = false

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Don't redirect if we're already on login/register/auth pages
      const path = window.location.pathname
      const isAuthPage = ['/login', '/register', '/verify', '/forgot-password', '/reset-password'].some(p => path.startsWith(p))

      if (!isAuthPage && !isRedirecting) {
        isRedirecting = true
        localStorage.removeItem('vulnforge_user')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default API