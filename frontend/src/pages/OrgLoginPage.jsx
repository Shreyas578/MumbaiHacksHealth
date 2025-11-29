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

export default function OrgLoginPage() {
    const navigate = useNavigate()
    const { login } = useOrgAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/org/dashboard')
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
                        Organization Login
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Sign in to publish health facts on the blockchain
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link to="/org/register" style={{ textDecoration: 'none' }}>
                                    Register here
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    )
}
