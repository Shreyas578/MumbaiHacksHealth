"""
Canonical JSON hashing utility for WHO health facts
Implements RFC 8785 canonical JSON serialization + SHA-256 hashing
"""

import json
import hashlib
from typing import Dict, Any


def canonicalize_json(obj: Any) -> str:
    """
    Canonicalize JSON object per RFC 8785
    
    Rules:
    - Sort all object keys alphabetically
    - No whitespace
    - UTF-8 encoding
    - Recursive for nested objects
    
    Args:
        obj: Python dict/list/primitive to canonicalize
        
    Returns:
        Canonical JSON string
    """
    return json.dumps(
        obj,
        ensure_ascii=False,
        sort_keys=True,
        separators=(',', ':')
    )


def compute_who_fact_hash(fact_json: Dict[str, Any]) -> str:
    """
    Compute canonical SHA-256 hash of a WHO fact JSON object
    
    This hash MUST match the JavaScript implementation for on-chain verification
    
    Args:
        fact_json: WHO fact dictionary
        
    Returns:
        Hex-encoded SHA-256 hash (with 0x prefix for blockchain compatibility)
        
    Example:
        >>> fact = {"id": "who-2025-0001", "claim_text": "test", ...}
        >>> hash = compute_who_fact_hash(fact)
        >>> hash
        '0xabcd1234...'
    """
    # Step 1: Canonicalize the JSON
    canonical_json = canonicalize_json(fact_json)
    
    # Step 2: UTF-8 encode
    encoded = canonical_json.encode('utf-8')
    
    # Step 3: Compute SHA-256
    hash_digest = hashlib.sha256(encoded).hexdigest()
    
    # Step 4: Add 0x prefix for Ethereum/Solidity compatibility
    return f"0x{hash_digest}"


def verify_hash_consistency(fact_json: Dict[str, Any], expected_hash: str) -> bool:
    """
    Verify that a computed hash matches an expected hash
    
    Args:
        fact_json: WHO fact dictionary
        expected_hash: Expected hash (with or without 0x prefix)
        
    Returns:
        True if hashes match, False otherwise
    """
    computed = compute_who_fact_hash(fact_json)
    
    # Normalize both hashes (remove 0x prefix for comparison)
    computed_normalized = computed.lower().replace("0x", "")
    expected_normalized = expected_hash.lower().replace("0x", "")
    
    return computed_normalized == expected_normalized


# Enum conversions (must match Solidity contract)
VERDICT_ENUM = {
    "true": 0,
    "false": 1,
    "misleading": 2,
    "unproven": 3,
    "partially_true": 4
}

SEVERITY_ENUM = {
    "low": 0,
    "medium": 1,
    "high": 2,
    "critical": 3
}

STATUS_ENUM = {
    "active": 0,
    "superseded": 1,
    "withdrawn": 2
}


def verdict_to_enum(verdict: str) -> int:
    """Convert verdict string to Solidity enum value"""
    return VERDICT_ENUM.get(verdict.lower(), 3)  # Default to UNPROVEN


def severity_to_enum(severity: str) -> int:
    """Convert severity string to Solidity enum value"""
    return SEVERITY_ENUM.get(severity.lower(), 0)  # Default to LOW


def status_to_enum(status: str) -> int:
    """Convert status string to Solidity enum value"""
    return STATUS_ENUM.get(status.lower(), 0)  # Default to ACTIVE


def enum_to_verdict(enum_value: int) -> str:
    """Convert Solidity enum value to verdict string"""
    reverse_map = {v: k for k, v in VERDICT_ENUM.items()}
    return reverse_map.get(enum_value, "unproven")


def enum_to_severity(enum_value: int) -> str:
    """Convert Solidity enum value to severity string"""
    reverse_map = {v: k for k, v in SEVERITY_ENUM.items()}
    return reverse_map.get(enum_value, "low")


def enum_to_status(enum_value: int) -> str:
    """Convert Solidity enum value to status string"""
    reverse_map = {v: k for k, v in STATUS_ENUM.items()}
    return reverse_map.get(enum_value, "active")


if __name__ == "__main__":
    # Test with sample WHO fact
    import os
    import sys
    
    # Add parent directory to path
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    
    # Load sample WHO fact
    sample_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "data",
        "who_facts",
        "who-2025-0001.json"
    )
    
    if os.path.exists(sample_path):
        with open(sample_path, 'r', encoding='utf-8') as f:
            sample_fact = json.load(f)
        
        print("🧪 Testing canonical hash computation...")
        print(f"Fact ID: {sample_fact['id']}")
        print(f"Claim: {sample_fact['claim_text'][:60]}...")
        
        fact_hash = compute_who_fact_hash(sample_fact)
        print(f"\n🔐 Canonical Hash: {fact_hash}")
        
        canonical = canonicalize_json(sample_fact)
        print(f"\n📝 Canonical JSON (first 200 chars):")
        print(canonical[:200] + "...")
        
        print(f"\n✅ Verdict enum: {verdict_to_enum(sample_fact['verdict'])}")
        print(f"✅ Severity enum: {severity_to_enum(sample_fact['severity'])}")
        print(f"✅ Status enum: {status_to_enum(sample_fact['status'])}")
    else:
        print(f"❌ Sample file not found at {sample_path}")
