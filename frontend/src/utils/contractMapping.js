// Utility functions for contract enum mapping
export const verdictToEnum = (verdict) => {
    const map = {
        'true': 0,
        'false': 1,
        'misleading': 2,
        'unproven': 3,
        'partially_true': 4
    }
    return map[verdict.toLowerCase()] ?? 3
}

export const severityToEnum = (severity) => {
    const map = {
        'low': 0,
        'medium': 1,
        'high': 2,
        'critical': 3
    }
    return map[severity.toLowerCase()] ?? 0
}

export const enumToVerdict = (enumValue) => {
    const map = ['true', 'false', 'misleading', 'unproven', 'partially_true']
    return map[enumValue] || 'unproven'
}

export const enumToSeverity = (enumValue) => {
    const map = ['low', 'medium', 'high', 'critical']
    return map[enumValue] || 'low'
}

// Verdict color mapping for UI
export const getVerdictColor = (verdict) => {
    const colors = {
        'true': '#4caf50',
        'false': '#f44336',
        'misleading': '#ff9800',
        'unproven': '#9e9e9e',
        'partially_true': '#ffeb3b'
    }
    return colors[verdict.toLowerCase()] || '#9e9e9e'
}

// Severity color mapping for UI
export const getSeverityColor = (severity) => {
    const colors = {
        'low': '#4caf50',
        'medium': '#ff9800',
        'high': '#ff5722',
        'critical': '#d32f2f'
    }
    return colors[severity.toLowerCase()] || '#9e9e9e'
}
