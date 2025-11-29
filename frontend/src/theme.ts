import { createTheme, alpha } from '@mui/material/styles';

// Premium Color Palette
const colors = {
    background: '#0F172A', // Deep slate blue
    paper: 'rgba(30, 41, 59, 0.7)', // Glassy slate
    primary: '#6366F1', // Indigo
    secondary: '#EC4899', // Pink
    success: '#10B981', // Emerald
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
    }
};

const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: colors.background,
            paper: colors.paper,
        },
        primary: {
            main: colors.primary,
        },
        secondary: {
            main: colors.secondary,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
        },
        success: {
            main: colors.success,
        },
        warning: {
            main: colors.warning,
        },
        error: {
            main: colors.error,
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
        },
        h2: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
        },
        h3: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        h6: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 16,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: `radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%)`,
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: colors.paper,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    padding: '10px 24px',
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.23)',
                    },
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #818cf8 100%)`,
                },
                containedSecondary: {
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, #f472b6 100%)`,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(15, 23, 42, 0.5)',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            boxShadow: `0 0 0 4px ${alpha(colors.primary, 0.2)}`,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                },
                head: {
                    fontWeight: 700,
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    color: colors.text.secondary,
                },
            },
        },
    },
});

export default theme;
