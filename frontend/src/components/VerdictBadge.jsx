import React from 'react'
import { Chip } from '@mui/material'
import { getVerdictColor } from '../utils/contractMapping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import WarningIcon from '@mui/icons-material/Warning'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

export default function VerdictBadge({ verdict }) {
    const color = getVerdictColor(verdict)

    const getIcon = () => {
        switch (verdict.toLowerCase()) {
            case 'true':
                return <CheckCircleIcon />
            case 'false':
                return <CancelIcon />
            case 'misleading':
            case 'partially_true':
                return <WarningIcon />
            default:
                return <HelpOutlineIcon />
        }
    }

    return (
        <Chip
            label={verdict.toUpperCase()}
            icon={getIcon()}
            sx={{
                backgroundColor: color,
                color: '#fff',
                fontWeight: 'bold',
                '& .MuiChip-icon': { color: '#fff' }
            }}
        />
    )
}
