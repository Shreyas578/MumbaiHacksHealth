import React from 'react'
import { Container, Typography, Box, Button, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import LoginIcon from '@mui/icons-material/Login'
import ListIcon from '@mui/icons-material/List'

export default function Dashboard() {
    const navigate = useNavigate()

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Health Fact Guardian
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    Blockchain-Verified Health Information Platform
                </Typography>
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                {/* Browse Facts */}
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <ListIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Browse Facts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        View all published health facts from trusted organizations
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/facts')}
                    >
                        View Public Facts
                    </Button>
                </Paper>

                {/* Organization Login */}
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <LoginIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Organization Portal
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Sign in to publish verified health facts on blockchain
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/org/login')}
                    >
                        Organization Login
                    </Button>
                </Paper>

                {/* Blockchain Verified */}
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <VerifiedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Blockchain Verified
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        All facts are cryptographically verified on Somnia Testnet
                    </Typography>
                    <Button
                        variant="outlined"
                        fullWidth
                        disabled
                    >
                        Learn More
                    </Button>
                </Paper>
            </Box>

            <Box mt={6} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Powered by HealthFactRegistry Smart Contract on Somnia Testnet
                </Typography>
            </Box>
        </Container>
    )
}
