// Canonical JSON hashing utility (RFC 8785)
import { sha256 } from 'viem'

export const canonicalizeJSON = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return '[' + obj.map(canonicalizeJSON).join(',') + ']'
    }

    const keys = Object.keys(obj).sort()
    const pairs = keys.map(key => {
        const value = canonicalizeJSON(obj[key])
        return `"${key}":${value}`
    })

    return '{' + pairs.join(',') + '}'
}

export const hashFactJSON = (factData) => {
    // Prepare fact object matching WHO schema
    const factObj = {
        id: factData.fact_id,
        claim: factData.claim_text,
        verdict: factData.verdict,
        severity: factData.severity,
        summary: factData.summary,
        evidence: factData.evidence || [],
        topics: factData.topics || [],
        issued_at: factData.issued_at,
        last_reviewed_at: factData.issued_at,
        version: 1,
        status: "active"
    }

    const canonical = canonicalizeJSON(factObj)
    const hash = sha256(new TextEncoder().encode(canonical))

    return hash
}
