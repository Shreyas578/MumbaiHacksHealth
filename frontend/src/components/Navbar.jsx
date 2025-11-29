import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOrgAuth } from '../contexts/OrgAuthContext'
import VerifiedIcon from '@mui/icons-material/Verified'
import HomeIcon from '@mui/icons-material/Home'
import ListIcon from '@mui/icons-material/List'
import LoginIcon from '@mui/icons-material/Login'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LogoutIcon from '@mui/icons-material/Logout'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, logout } = useOrgAuth()

    const handleLogout = () => {
        logout()
        navigate('/org/login')
    }

    return (
        <AppBar position="sticky" elevation={2}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    {/* Logo/Brand */}
                    <VerifiedIcon sx={{ mr: 1 }} />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 0, mr: 4, cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => navigate('/')}
                    >
                        Health Fact Guardian
                    </Typography>

                    {/* Navigation Links */}
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            startIcon={<HomeIcon />}
                            onClick={() => navigate('/')}
                            sx={{
                                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                        >
                            Home
                        </Button>

                        <Button
                            color="inherit"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={() => navigate('/checker')}
                            sx={{
                                backgroundColor: location.pathname === '/checker' ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                        >
                            AI Checker
                        </Button>

                        <Button
                            color="inherit"
                            startIcon={<ListIcon />}
                            onClick={() => navigate('/facts')}
                            sx={{
                                backgroundColor: location.pathname.startsWith('/facts') ? 'rgba(255,255,255,0.1)' : 'transparent'
                            }}
                        >
                            Browse Facts
                        </Button>

                        {isAuthenticated && (
                            <Button
                                color="inherit"
                                startIcon={<DashboardIcon />}
                                onClick={() => navigate('/org/dashboard')}
                                sx={{
                                    backgroundColor: location.pathname === '/org/dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent'
                                }}
                            >
                                Dashboard
                            </Button>
                        )}
                    </Box>

                    {/* Auth Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {isAuthenticated ? (
                            <Button
                                color="inherit"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                variant="outlined"
                                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/org/login')}
                                    variant={location.pathname === '/org/login' ? 'outlined' : 'text'}
                                    sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    color="inherit"
                                    startIcon={<LoginIcon />}
                                    onClick={() => navigate('/org/register')}
                                    variant={location.pathname === '/org/register' ? 'outlined' : 'text'}
                                    sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}
