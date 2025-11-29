import React, { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import axios from 'axios'
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
    IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { HEALTH_FACT_REGISTRY_ADDRESS } from '../web3/config'
import { HEALTH_FACT_REGISTRY_ABI } from '../web3/contractABI'
import { verdictToEnum, severityToEnum } from '../utils/contractMapping'
import { hashFactJSON } from '../utils/canonicalHash'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function NewStatementForm() {
    const { address, isConnected } = useAccount()
    const { writeContract, data: hash, isPending, error: contractError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const [formData, setFormData] = useState({
        claim_text: '',
        verdict: 'false',
        severity: 'medium',
        summary: '',
        topics: [],
        evidence: []
    })

    const [currentTopic, setCurrentTopic] = useState('')
    const [currentEvidence, setCurrentEvidence] = useState({ url: '', title: '' })
    const [submitError, setSubmitError] = useState('')
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')
        setSubmitSuccess(false)

        if (!isConnected) {
            setSubmitError('Please connect your wallet first')
            return
        }

        try {
            // Generate fact ID
            const timestamp = Date.now()
            const factId = `org-fact-${timestamp}`
            const issuedAt = new Date().toISOString()

            // Prepare fact data for hashing
            const factData = {
                fact_id: factId,
                claim_text: formData.claim_text,
                verdict: formData.verdict,
                severity: formData.severity,
                summary: formData.summary,
                topics: formData.topics,
                evidence: formData.evidence.map(ev => ({
                    ...ev,
                    accessed_at: new Date().toISOString()
                })),
                issued_at: issuedAt
            }

            // Generate canonical hash
            const factHash = hashFactJSON(factData)

            // Convert to contract parameters
            const verdictEnum = verdictToEnum(formData.verdict)
            const severityEnum = severityToEnum(formData.severity)
            const issuedAtTimestamp = Math.floor(new Date(issuedAt).getTime() / 1000)

            // Call smart contract
            writeContract({
                address: HEALTH_FACT_REGISTRY_ADDRESS,
                abi: HEALTH_FACT_REGISTRY_ABI,
                functionName: 'addFact',
                args: [
                    factHash,
                    factId,
                    verdictEnum,
                    severityEnum,
                    BigInt(issuedAtTimestamp),
                    BigInt(issuedAtTimestamp),
                    1 // version
                ]
            })

            // Store data for backend submission after transaction confirms
            window.pendingFact = {
                ...factData,
                on_chain_hash: factHash,
                block_number: null
            }

        } catch (err) {
            console.error('Error publishing fact:', err)
            setSubmitError(err.message || 'Failed to publish fact')
        }
    }

    // Submit to backend after blockchain confirmation
    React.useEffect(() => {
        const submitToBackend = async () => {
            if (isSuccess && hash && window.pendingFact) {
                try {
                    const response = await axios.post(`${API_URL}/api/org/facts`, {
                        ...window.pendingFact,
                        tx_hash: hash,
                        block_number: null
                    })

                    setSubmitSuccess(true)
                    // Reset form
                    setFormData({
                        claim_text: '',
                        verdict: 'false',
                        severity: 'medium',
                        summary: '',
                        topics: [],
                        evidence: []
                    })
                    delete window.pendingFact
                } catch (err) {
                    setSubmitError('Blockchain transaction succeeded, but failed to save to database: ' + err.response?.data?.detail)
                }
            }
        }

        submitToBackend()
    }, [isSuccess, hash])

    const addTopic = () => {
        if (currentTopic.trim()) {
            setFormData(prev => ({
                ...prev,
                topics: [...prev.topics, currentTopic.trim()]
            }))
            setCurrentTopic('')
        }
    }

    const removeTopic = (index) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }))
    }

    const addEvidence = () => {
        if (currentEvidence.url && currentEvidence.title) {
            setFormData(prev => ({
                ...prev,
                evidence: [...prev.evidence, currentEvidence]
            }))
            setCurrentEvidence({ url: '', title: '' })
        }
    }

    const removeEvidence = (index) => {
        setFormData(prev => ({
            ...prev,
            evidence: prev.evidence.filter((_, i) => i !== index)
        }))
    }

    if (!isConnected) {
        return (
            <Alert severity="warning">
                Please connect your wallet to publish health facts
            </Alert>
        )
    }

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Publish New Health Statement
            </Typography>

            {submitSuccess && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSubmitSuccess(false)}>
                    Fact published successfully! Transaction hash: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                </Alert>
            )}

            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
                    {submitError}
                </Alert>
            )}

            {contractError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Contract Error: {contractError.message}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Health Claim"
                    value={formData.claim_text}
                    onChange={(e) => setFormData({ ...formData, claim_text: e.target.value })}
                    margin="normal"
                    required
                    multiline
                    rows={2}
                    helperText="The health claim being verified"
                />

                <Box display="flex" gap={2}>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Verdict</InputLabel>
                        <Select
                            value={formData.verdict}
                            label="Verdict"
                            onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                        >
                            <MenuItem value="true">True</MenuItem>
                            <MenuItem value="false">False</MenuItem>
                            <MenuItem value="misleading">Misleading</MenuItem>
                            <MenuItem value="unproven">Unproven</MenuItem>
                            <MenuItem value="partially_true">Partially True</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Severity</InputLabel>
                        <Select
                            value={formData.severity}
                            label="Severity"
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <TextField
                    fullWidth
                    label="Summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    margin="normal"
                    required
                    multiline
                    rows={3}
                    helperText="Detailed explanation of the verdict"
                />

                {/* Topics */}
                <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>Topics</Typography>
                    <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                        {formData.topics.map((topic, index) => (
                            <Chip
                                key={index}
                                label={topic}
                                onDelete={() => removeTopic(index)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                    <Box display="flex" gap={1}>
                        <TextField
                            size="small"
                            label="Add Topic"
                            value={currentTopic}
                            onChange={(e) => setCurrentTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                        />
                        <Button onClick={addTopic} startIcon={<AddIcon />}>Add</Button>
                    </Box>
                </Box>

                {/* Evidence */}
                <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>Evidence Sources</Typography>
                    {formData.evidence.map((ev, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="body2" sx={{ flex: 1 }}>{ev.title}</Typography>
                            <IconButton size="small" onClick={() => removeEvidence(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Box display="flex" gap={1} mb={1}>
                        <TextField
                            size="small"
                            label="Evidence Title"
                            value={currentEvidence.title}
                            onChange={(e) => setCurrentEvidence({ ...currentEvidence, title: e.target.value })}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            size="small"
                            label="URL"
                            value={currentEvidence.url}
                            onChange={(e) => setCurrentEvidence({ ...currentEvidence, url: e.target.value })}
                            sx={{ flex: 1 }}
                        />
                        <Button onClick={addEvidence} startIcon={<AddIcon />}>Add</Button>
                    </Box>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isPending || isConfirming}
                    sx={{ mt: 3 }}
                >
                    {isPending ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Waiting for wallet approval...
                        </>
                    ) : isConfirming ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Confirming transaction...
                        </>
                    ) : (
                        'Publish to Blockchain'
                    )}
                </Button>
            </form>
        </Paper>
    )
}
