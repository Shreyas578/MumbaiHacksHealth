import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Box,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    useTheme,
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Modal,
    Fade,
    Backdrop
} from '@mui/material';
import {
    Send,
    History,
    FilterList,
    Visibility,
    HealthAndSafety,
    AutoAwesome
} from '@mui/icons-material';
import TruthCard from '../components/TruthCard';
import StatsCards from '../components/StatsCards';
import { checkRumor, getRumors, RumorResponse, getStats, Stats } from '../api/rumorApi';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
    const theme = useTheme();
    const [claimText, setClaimText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentResult, setCurrentResult] = useState<RumorResponse | null>(null);
    const [recentRumors, setRecentRumors] = useState<RumorResponse[]>([]);
    const [verdictFilter, setVerdictFilter] = useState<string>('');
    const [severityFilter, setSeverityFilter] = useState<string>('');
    const [selectedRumor, setSelectedRumor] = useState<RumorResponse | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);

    // Load recent rumors and stats on mount
    useEffect(() => {
        loadRecentRumors();
        loadStats();
    }, [verdictFilter, severityFilter]);

    const loadStats = async () => {
        try {
            const statsData = await getStats();
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const loadRecentRumors = async () => {
        try {
            const response = await getRumors(20, 0, verdictFilter, severityFilter);
            setRecentRumors(response.rumors);
        } catch (err) {
            console.error('Failed to load rumors:', err);
        }
    };

    const handleCheckRumor = async () => {
        if (!claimText.trim()) {
            setError('Please enter a health claim to verify');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentResult(null);

        try {
            const result = await checkRumor({ text: claimText });
            setCurrentResult(result);
            setClaimText('');
            // Reload recent rumors and stats to include the new one
            loadRecentRumors();
            loadStats();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to verify claim. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'True': return theme.palette.success.main;
            case 'False': return theme.palette.error.main;
            case 'Misleading': return theme.palette.warning.main;
            default: return theme.palette.text.secondary;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return theme.palette.error.main;
            case 'Medium': return theme.palette.warning.main;
            case 'Low': return theme.palette.success.main;
            default: return theme.palette.info.main;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
                    <Box
                        component={motion.div}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.8 }}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            mb: 2,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                            cursor: 'pointer'
                        }}
                    >
                        <HealthAndSafety sx={{ fontSize: 48, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h2" sx={{
                        fontWeight: 800,
                        mb: 1,
                        background: `linear-gradient(to right, #fff, ${theme.palette.primary.light})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                        textShadow: '0 0 40px rgba(99, 102, 241, 0.3)'
                    }}>
                        Health Fact Guardian
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                        AI-Powered verification engine for medical claims and health rumors.
                    </Typography>
                </Box>
            </motion.div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            <Grid container spacing={4}>
                {/* Left Panel - Check Rumor */}
                <Grid item xs={12} lg={5}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Paper sx={{ p: 4, height: '100%', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <AutoAwesome sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                                    <Typography variant="h5" fontWeight="700">
                                        Verify New Claim
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    placeholder="e.g., 'Drinking warm lemon water cures cancer' or 'Garlic prevents COVID-19'..."
                                    value={claimText}
                                    onChange={(e) => setClaimText(e.target.value)}
                                    disabled={loading}
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        sx: { fontSize: '1.1rem', lineHeight: 1.6 }
                                    }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    component={motion.button}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleCheckRumor}
                                    disabled={loading || !claimText.trim()}
                                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    sx={{
                                        height: 56,
                                        fontSize: '1.1rem',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        backgroundSize: '200% 200%',
                                        animation: 'gradient 3s ease infinite',
                                        '@keyframes gradient': {
                                            '0%': { backgroundPosition: '0% 50%' },
                                            '50%': { backgroundPosition: '100% 50%' },
                                            '100%': { backgroundPosition: '0% 50%' },
                                        },
                                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        '&:hover': {
                                            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.6)}`,
                                        }
                                    }}
                                >
                                    {loading ? 'Analyzing Evidence...' : 'Verify Claim'}
                                </Button>

                                <AnimatePresence>
                                    {currentResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Box sx={{ mt: 4 }}>
                                                <TruthCard rumor={currentResult} />
                                            </Box>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Box>
                        </Paper>
                    </motion.div>
                </Grid>

                {/* Right Panel - Recent Verifications */}
                <Grid item xs={12} lg={7}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Paper sx={{ p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <History sx={{ color: theme.palette.primary.main, mr: 1 }} />
                                    <Typography variant="h6" fontWeight="700">
                                        Recent Verifications
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        icon={<FilterList sx={{ fontSize: 16 }} />}
                                        label="Filter"
                                        variant="outlined"
                                        onClick={() => { }}
                                        sx={{ borderColor: alpha(theme.palette.divider, 0.2) }}
                                    />
                                </Box>
                            </Box>

                            <TableContainer sx={{ flexGrow: 1, maxHeight: 600 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Claim</TableCell>
                                            <TableCell>Verdict</TableCell>
                                            <TableCell>Severity</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentRumors.map((rumor, index) => (
                                            <TableRow
                                                key={rumor.id}
                                                hover
                                                component={motion.tr}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                        transform: 'scale(1.01)',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                        zIndex: 1,
                                                        position: 'relative'
                                                    }
                                                }}
                                                onClick={() => setSelectedRumor(rumor)}
                                            >
                                                <TableCell sx={{ maxWidth: 300 }}>
                                                    <Typography noWrap variant="body2" fontWeight="500">
                                                        {rumor.original_text}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(rumor.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={rumor.verdict}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getVerdictColor(rumor.verdict), 0.1),
                                                            color: getVerdictColor(rumor.verdict),
                                                            fontWeight: 700,
                                                            border: `1px solid ${alpha(getVerdictColor(rumor.verdict), 0.2)}`
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={rumor.severity}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getSeverityColor(rumor.severity), 0.1),
                                                            color: getSeverityColor(rumor.severity),
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRumor(rumor);
                                                        }}
                                                        sx={{
                                                            '&:hover': {
                                                                color: theme.palette.primary.main,
                                                                background: alpha(theme.palette.primary.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>

            {/* Detail Modal */}
            <Modal
                open={!!selectedRumor}
                onClose={() => setSelectedRumor(null)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.8)' }
                }}
            >
                <Fade in={!!selectedRumor}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 800,
                        outline: 'none'
                    }}>
                        {selectedRumor && <TruthCard rumor={selectedRumor} />}
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
};

export default Dashboard;
