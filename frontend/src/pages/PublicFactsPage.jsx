import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Container,
    Typography,
    Grid,
    Box,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination
} from '@mui/material'
import FactCard from '../components/FactCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PublicFactsPage() {
    const [facts, setFacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [verdictFilter, setVerdictFilter] = useState('')
    const [severityFilter, setSeverityFilter] = useState('')

    const limit = 12

    useEffect(() => {
        fetchFacts()
    }, [page, verdictFilter, severityFilter])

    const fetchFacts = async () => {
        setLoading(true)
        setError('')

        try {
            const params = {
                limit,
                offset: (page - 1) * limit
            }

            if (verdictFilter) params.verdict = verdictFilter
            if (severityFilter) params.severity = severityFilter

            const response = await axios.get(`${API_URL}/api/public/facts`, { params })
            setFacts(response.data.facts)
            setTotal(response.data.total)
        } catch (err) {
            setError('Failed to load facts. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Published Health Facts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Browse verified health statements published by trusted organizations
                </Typography>
            </Box>

            {/* Filters */}
            <Box display="flex" gap={2} mb={4}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Verdict</InputLabel>
                    <Select
                        value={verdictFilter}
                        label="Verdict"
                        onChange={(e) => {
                            setVerdictFilter(e.target.value)
                            setPage(1)
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="true">True</MenuItem>
                        <MenuItem value="false">False</MenuItem>
                        <MenuItem value="misleading">Misleading</MenuItem>
                        <MenuItem value="unproven">Unproven</MenuItem>
                        <MenuItem value="partially_true">Partially True</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Severity</InputLabel>
                    <Select
                        value={severityFilter}
                        label="Severity"
                        onChange={(e) => {
                            setSeverityFilter(e.target.value)
                            setPage(1)
                        }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : facts.length === 0 ? (
                <Alert severity="info">
                    No facts found. {verdictFilter || severityFilter ? 'Try adjusting filters.' : ''}
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {facts.map((fact) => (
                            <Grid item xs={12} sm={6} md={4} key={fact.id}>
                                <FactCard fact={fact} />
                            </Grid>
                        ))}
                    </Grid>

                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Container>
    )
}
