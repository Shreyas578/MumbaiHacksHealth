import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button, Box, Typography, Chip, Paper } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useOrgAuth } from '../contexts/OrgAuthContext'

export default function WalletConnect() {
    const { address, isConnected, chain } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const { updateWalletAddress, org } = useOrgAuth()

    const handleConnect = async () => {
        const metamaskConnector = connectors.find(c => c.name === 'MetaMask')
        if (metamaskConnector) {
            connect({ connector: metamaskConnector })
        } else {
            // Fallback to first available connector
            connect({ connector: connectors[0] })
        }
    }

    const handleDisconnect = () => {
        disconnect()
    }

    // Save wallet address to backend when connected
    React.useEffect(() => {
        if (isConnected && address && address !== org?.wallet_address) {
            updateWalletAddress(address)
        }
    }, [isConnected, address])

    if (isConnected) {
        return (
            <Paper elevation={2} sx={{ p: 3, my: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="h6">Wallet Connected</Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Address: {address?.slice(0, 6)}...{address?.slice(-4)}
                        </Typography>

                        {chain && (
                            <Chip
                                label={chain.name}
                                size="small"
                                color={chain.id === 50312 ? 'success' : 'warning'}
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDisconnect}
                    >
                        Disconnect
                    </Button>
                </Box>
            </Paper>
        )
    }

    return (
        <Paper elevation={2} sx={{ p: 3, my: 3 }}>
            <Box textAlign="center">
                <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Connect Your Wallet
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Connect MetaMask to publish facts on Somnia Testnet
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={handleConnect}
                >
                    Connect MetaMask
                </Button>
            </Box>
        </Paper>
    )
}
