import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    Link as MuiLink
} from '@mui/material'
import VerdictBadge from '../components/VerdictBadge'
import { getSeverityColor } from '../utils/contractMapping'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SecurityIcon from '@mui/icons-material/Security'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PublicFactDetailPage() {
    const { factId } = useParams()
    const navigate = useNavigate()
    const [fact, setFact] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchFactDetail()
    }, [factId])

    const fetchFactDetail = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/public/facts/${factId}`)
            setFact(response.data)
        } catch (err) {
            setError('Fact not found')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        )
    }

    if (error || !fact) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Fact not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/facts')} sx={{ mt: 2 }}>
                    Back to Facts
                </Button>
            </Container>
        )
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/facts')} sx={{ mb: 3 }}>
                Back to Facts
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                    <Box>
                        <VerdictBadge verdict={fact.verdict} />
                        <Chip
                            label={fact.severity.toUpperCase()}
                            size="small"
                            sx={{
                                ml: 1,
                                backgroundColor: getSeverityColor(fact.severity),
                                color: '#fff',
                                fontWeight: 'bold'
                            }}
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SecurityIcon color="primary" />
                        <Chip label="On-Chain Verified" color="success" size="small" />
                    </Box>
                </Box>

                {/* Claim */}
                <Typography variant="h4" component="h1" gutterBottom>
                    {fact.claim_text}
                </Typography>

                {/* Metadata */}
                <Box display="flex" gap={3} mb={3}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Fact ID:</strong> {fact.fact_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Published by:</strong> {fact.org_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Date:</strong> {new Date(fact.issued_at).toLocaleDateString()}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Summary */}
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Summary
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {fact.summary}
                    </Typography>
                </Box>

                {/* Topics */}
                {fact.topics && fact.topics.length > 0 && (
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Topics
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {fact.topics.map((topic, index) => (
                                <Chip key={index} label={topic} size="small" />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Evidence */}
                {fact.evidence && fact.evidence.length > 0 && (
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Evidence Sources
                        </Typography>
                        <List>
                            {fact.evidence.map((evidence, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemText
                                        primary={
                                            <MuiLink href={evidence.url} target="_blank" rel="noopener">
                                                {evidence.title} <OpenInNewIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />
                                            </MuiLink>
                                        }
                                        secondary={`Accessed: ${new Date(evidence.accessed_at).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Blockchain Info */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Blockchain Verification
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        This fact has been cryptographically verified and published on the Somnia Testnet blockchain.
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                        <Typography variant="caption">
                            <strong>Fact Hash:</strong> {fact.on_chain_hash?.slice(0, 16)}...{fact.on_chain_hash?.slice(-8)}
                        </Typography>
                        <Typography variant="caption">
                            <strong>Transaction:</strong> {fact.tx_hash?.slice(0, 16)}...{fact.tx_hash?.slice(-8)}
                        </Typography>
                        {fact.block_number && (
                            <Typography variant="caption">
                                <strong>Block:</strong> {fact.block_number}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    )
}
