import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip
} from '@mui/material'
import VerdictBadge from './VerdictBadge'
import { getSeverityColor } from '../utils/contractMapping'
import SecurityIcon from '@mui/icons-material/Security'

export default function FactCard({ fact }) {
    const navigate = useNavigate()

    const handleViewDetails = () => {
        navigate(`/facts/${fact.fact_id}`)
    }

    return (
        <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <VerdictBadge verdict={fact.verdict} />
                    <Chip
                        label={fact.severity.toUpperCase()}
                        size="small"
                        sx={{
                            backgroundColor: getSeverityColor(fact.severity),
                            color: '#fff',
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                <Typography variant="h6" component="h3" gutterBottom>
                    {fact.claim_text.length > 100
                        ? fact.claim_text.substring(0, 100) + '...'
                        : fact.claim_text}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <SecurityIcon fontSize="small" color="primary" />
                    <Typography variant="body2" color="text.secondary">
                        {fact.org_name}
                    </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Published: {new Date(fact.issued_at).toLocaleDateString()}
                </Typography>
            </CardContent>

            <CardActions>
                <Button size="small" onClick={handleViewDetails}>
                    View Details
                </Button>
            </CardActions>
        </Card>
    )
}
