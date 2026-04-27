import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import PageTransition from './components/PageTransition'
import Landing        from './pages/Landing'
import Login          from './pages/Login'
import Register       from './pages/Register'
import VerifyOTP      from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Dashboard      from './pages/Dashboard'
import Targets        from './pages/Targets'
import Scans          from './pages/Scans'
import ScanReport     from './pages/ScanReport'
import ToolsPage      from './pages/ToolsPage'
import ToolRunner     from './pages/ToolRunner'
import './index.css'

function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('vulnforge_user') || 'null')
  return user ? <Navigate to="/dashboard" replace /> : children
}

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('vulnforge_user') || 'null')
  return user ? children : <Navigate to="/login" replace />
}

function AnimatedRoutes() {
  return (
    <PageTransition>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp"      element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Protected */}
        <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/targets"         element={<ProtectedRoute><Targets /></ProtectedRoute>} />
        <Route path="/scans"           element={<ProtectedRoute><Scans /></ProtectedRoute>} />
        <Route path="/scans/:id"       element={<ProtectedRoute><ScanReport /></ProtectedRoute>} />

        {/* Tools */}
        <Route path="/tools"           element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
        <Route path="/tools/:toolId"   element={<ProtectedRoute><ToolRunner /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
