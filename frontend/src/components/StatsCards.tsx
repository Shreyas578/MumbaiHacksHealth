import React from 'react';
import { Paper, Box, Typography, Grid, useTheme } from '@mui/material';
import {
    AssessmentOutlined,
    CheckCircleOutline,
    CancelOutlined,
    WarningAmberRounded,
} from '@mui/icons-material';
import { Stats } from '../api/rumorApi';
import { motion } from 'framer-motion';

interface StatsCardsProps {
    stats: Stats | null;
    loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
    const theme = useTheme();

    if (loading || !stats) {
        return null;
    }

    const cards = [
        {
            title: 'Total Verified',
            value: stats.total_rumors,
            icon: AssessmentOutlined,
            gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            shadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
            glow: 'rgba(99, 102, 241, 0.6)',
        },
        {
            title: 'True Claims',
            value: stats.by_verdict.True,
            icon: CheckCircleOutline,
            gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            shadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            glow: 'rgba(16, 185, 129, 0.6)',
        },
        {
            title: 'False Claims',
            value: stats.by_verdict.False,
            icon: CancelOutlined,
            gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            shadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
            glow: 'rgba(239, 68, 68, 0.6)',
        },
        {
            title: 'High Severity',
            value: stats.by_severity.High,
            icon: WarningAmberRounded,
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            shadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
            glow: 'rgba(245, 158, 11, 0.6)',
        }
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{
                                y: -8,
                                scale: 1.02,
                                transition: { type: "spring", stiffness: 300 }
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    background: card.gradient,
                                    borderRadius: 4,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: card.shadow,
                                    color: 'white',
                                    cursor: 'default',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
                                        transform: 'translateX(-100%)',
                                        transition: 'transform 0.6s',
                                    },
                                    '&:hover::before': {
                                        transform: 'translateX(100%)',
                                    },
                                    '&:hover': {
                                        boxShadow: `0 12px 40px ${card.glow}`,
                                    }
                                }}
                            >
                                {/* Decorative circle */}
                                <Box
                                    component={motion.div}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 10, 0]
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        top: -20,
                                        right: -20,
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        zIndex: 0
                                    }}
                                />

                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 3,
                                                background: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 28, color: 'white' }} />
                                        </Box>
                                    </Box>

                                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, letterSpacing: 1 }}>
                                        {card.title.toUpperCase()}
                                    </Typography>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default StatsCards;
