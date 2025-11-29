import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { OrgAuthProvider } from './contexts/OrgAuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './pages/Dashboard'
import CheckerPage from './pages/Dashboard.tsx'
import OrgLoginPage from './pages/OrgLoginPage'
import OrgRegisterPage from './pages/OrgRegisterPage'
import OrgDashboardPage from './pages/OrgDashboardPage'
import PublicFactsPage from './pages/PublicFactsPage'
import PublicFactDetailPage from './pages/PublicFactDetailPage'
import './App.css'

function App() {
  return (
    <OrgAuthProvider>
      <BrowserRouter>
        <Box>
          <Navbar />
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* AI Fact Checker (Original LLM Page) */}
            <Route path="/checker" element={<CheckerPage />} />

            {/* Organization Auth Routes */}
            <Route path="/org/login" element={<OrgLoginPage />} />
            <Route path="/org/register" element={<OrgRegisterPage />} />
            <Route
              path="/org/dashboard"
              element={
                <ProtectedRoute>
                  <OrgDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Public Facts Routes */}
            <Route path="/facts" element={<PublicFactsPage />} />
            <Route path="/facts/:factId" element={<PublicFactDetailPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </OrgAuthProvider>
  )
}

export default App
