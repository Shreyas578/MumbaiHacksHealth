import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useOrgAuth } from '../contexts/OrgAuthContext'
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material'

export default function OrgRegisterPage() {
    const navigate = useNavigate()
    const { register } = useOrgAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)

        const result = await register(name, email, password)

        if (result.success) {
            // Registration successful, redirect to login
            navigate('/org/login', {
                state: { message: 'Registration successful! Please sign in.' }
            })
        } else {
            setError(result.error)
        }

        setLoading(false)
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Register Organization
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Create an account to publish verified health facts
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Organization Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
                            helperText="e.g., World Health Organization"
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            helperText="Minimum 8 characters"
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link to="/org/login" style={{ textDecoration: 'none' }}>
                                    Sign in here
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    )
}
