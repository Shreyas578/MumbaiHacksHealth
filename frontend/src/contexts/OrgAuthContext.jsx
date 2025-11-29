import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const OrgAuthContext = createContext(null)

export const useOrgAuth = () => {
    const context = useContext(OrgAuthContext)
    if (!context) {
        throw new Error('useOrgAuth must be used within OrgAuthProvider')
    }
    return context
}

export const OrgAuthProvider = ({ children }) => {
    const [org, setOrg] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('org_token'))
    const [loading, setLoading] = useState(true)

    // Set axios default header when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            localStorage.setItem('org_token', token)

            // Fetch org profile
            fetchProfile()
        } else {
            delete axios.defaults.headers.common['Authorization']
            localStorage.removeItem('org_token')
            setOrg(null)
        }
    }, [token])

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/org/me`)
            setOrg(response.data)
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            // Token might be invalid, clear it
            logout()
        } finally {
            setLoading(false)
        }
    }

    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register-org`, {
                name,
                email,
                password
            })
            return { success: true, data: response.data }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Registration failed'
            }
        }
    }

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login-org`, {
                email,
                password
            })

            const { access_token, organization } = response.data
            setToken(access_token)
            setOrg(organization)

            return { success: true, data: organization }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            }
        }
    }

    const logout = () => {
        setToken(null)
        setOrg(null)
        localStorage.removeItem('org_token')
    }

    const updateWalletAddress = async (walletAddress) => {
        try {
            const response = await axios.patch(`${API_URL}/api/org/me/wallet`, {
                wallet_address: walletAddress
            })
            setOrg(response.data)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Failed to update wallet'
            }
        }
    }

    const value = {
        org,
        token,
        loading,
        isAuthenticated: !!token && !!org,
        register,
        login,
        logout,
        updateWalletAddress
    }

    return (
        <OrgAuthContext.Provider value={value}>
            {children}
        </OrgAuthContext.Provider>
    )
}
