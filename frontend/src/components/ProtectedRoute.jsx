import React from 'react'
import { Navigate } from 'react-router-dom'
import { useOrgAuth } from '../contexts/OrgAuthContext'
import { Box, CircularProgress } from '@mui/material'

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useOrgAuth()

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/org/login" replace />
    }

    return children
}
