import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Divider,
    Link,
    Grid,
    useTheme,
    alpha
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Help,
    Warning,
    MenuBook,
} from '@mui/icons-material';
import { RumorResponse } from '../api/rumorApi';
import { motion } from 'framer-motion';

interface TruthCardProps {
    rumor: RumorResponse;
}

const TruthCard: React.FC<TruthCardProps> = ({ rumor }) => {
    const theme = useTheme();

    const getVerdictConfig = (verdict: string) => {
        switch (verdict) {
            case 'True':
                return {
                    color: theme.palette.success.main,
                    bg: alpha(theme.palette.success.main, 0.1),
                    icon: CheckCircle,
                    gradient: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                };
            case 'False':
                return {
                    color: theme.palette.error.main,
                    bg: alpha(theme.palette.error.main, 0.1),
                    icon: Cancel,
                    gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                };
            case 'Misleading':
                return {
                    color: theme.palette.warning.main,
                    bg: alpha(theme.palette.warning.main, 0.1),
                    icon: Warning,
                    gradient: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                };
            default:
                return {
                    color: theme.palette.info.main,
                    bg: alpha(theme.palette.info.main, 0.1),
                    icon: Help,
                    gradient: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`
                };
        }
    };

    const config = getVerdictConfig(rumor.verdict);
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4,
                    border: `1px solid ${alpha(config.color, 0.3)}`,
                    background: `linear-gradient(180deg, ${alpha(config.color, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
                    boxShadow: `0 8px 32px ${alpha(config.color, 0.15)}`
                }}
            >
                {/* Header Banner */}
                <Box
                    sx={{
                        p: 3,
                        background: config.gradient,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            component={motion.div}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <Icon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1, fontWeight: 600 }}>
                                VERDICT
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                {rumor.verdict.toUpperCase()}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={`Severity: ${rumor.severity}`}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}
                    />
                </Box>

                <Box sx={{ p: 4 }}>
                    {/* Claims Section */}
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" color="text.secondary" fontWeight="600">
                                ORIGINAL CLAIM
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, mb: 3, fontStyle: 'italic', color: 'text.primary' }}>
                                "{rumor.original_text}"
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" color="text.secondary" fontWeight="600">
                                NORMALIZED CLAIM
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, mb: 3, color: 'text.primary' }}>
                                {rumor.normalized_claim}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />

                    {/* Explanation */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                            <Box component="span" sx={{ width: 4, height: 24, bgcolor: config.color, borderRadius: 1, display: 'inline-block' }} />
                            Analysis & Explanation
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                            {rumor.explanation}
                        </Typography>
                    </Box>

                    {/* Sources */}
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, mb: 2 }}>
                            <MenuBook sx={{ color: theme.palette.primary.main }} />
                            Scientific Sources
                        </Typography>
                        <Grid container spacing={2}>
                            {rumor.sources.map((source, index) => (
                                <Grid item xs={12} key={index}>
                                    <Paper
                                        component={motion.a}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            display: 'block',
                                            textDecoration: 'none',
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }}
                                    >
                                        <Typography variant="subtitle1" color="primary" fontWeight="600" sx={{ mb: 0.5 }}>
                                            {source.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            Source: {new URL(source.url).hostname}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Disclaimer */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2, border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}` }}>
                        <Typography variant="caption" color="text.secondary" align="center" display="block">
                            <strong>Disclaimer:</strong> This analysis is generated by AI based on available medical literature.
                            It is for informational purposes only and does not constitute medical advice.
                            Always consult a qualified healthcare professional for medical concerns.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
};

export default TruthCard;
