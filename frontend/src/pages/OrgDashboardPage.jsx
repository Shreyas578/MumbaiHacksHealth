import React from 'react'
import { useOrgAuth } from '../contexts/OrgAuthContext'
import { useAccount } from 'wagmi'
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Divider,
    Alert
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import WalletConnect from '../components/WalletConnect'
import NewStatementForm from '../components/NewStatementForm'

export default function OrgDashboardPage() {
    const { org } = useOrgAuth()
    const { isConnected } = useAccount()
    const navigate = useNavigate()

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" component="h1">
                    Organization Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Welcome back, {org?.name}
                </Typography>
            </Box>

            {/* Organization Info */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Organization Profile
                </Typography>
                <Box>
                    <Typography variant="body1">
                        <strong>Name:</strong> {org?.name}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Email:</strong> {org?.email}
                    </Typography>
                    {org?.wallet_address && (
                        <Typography variant="body1">
                            <strong>Wallet:</strong> {org.wallet_address.slice(0, 6)}...{org.wallet_address.slice(-4)}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Wallet Connection */}
            <WalletConnect />

            <Divider sx={{ my: 4 }} />

            {/* Publishing Section */}
            {isConnected ? (
                <NewStatementForm />
            ) : (
                <Alert severity="info">
                    Connect your wallet above to publish health facts on the blockchain
                </Alert>
            )}

            {/* Browse Public Facts */}
            <Box mt={3} textAlign="center">
                <Button
                    variant="outlined"
                    onClick={() => navigate('/facts')}
                >
                    Browse Published Facts
                </Button>
            </Box>
        </Container>
    )
}
