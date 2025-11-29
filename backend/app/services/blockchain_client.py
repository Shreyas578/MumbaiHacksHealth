"""
Blockchain client for interacting with HealthFactRegistry smart contract on Somnia Testnet
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from pathlib import Path

from web3 import Web3
from web3.exceptions import ContractLogicError, Web3Exception

from app.utils.canonical_hash import (
    compute_who_fact_hash,
    enum_to_verdict,
    enum_to_severity,
    enum_to_status
)

logger = logging.getLogger(__name__)


class BlockchainClient:
    """
    Web3 client for querying WHO health facts from the blockchain
    """
    
    def __init__(self):
        """Initialize Web3 connection and load contract"""
        # Get configuration from environment
        rpc_url = os.getenv("WEB3_PROVIDER_URL", "https://dream-rpc.somnia.network")
        self.contract_address = os.getenv("HEALTH_FACT_REGISTRY_ADDRESS")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Check connection
        if not self.w3.is_connected():
            logger.error(f"Failed to connect to Somnia RPC: {rpc_url}")
            raise ConnectionError(f"Cannot connect to blockchain RPC at {rpc_url}")
        
        logger.info(f"✅ Connected to Somnia Testnet (Chain ID: {self.w3.eth.chain_id})")
        
        # Load contract ABI
        config_dir = Path(__file__).parent.parent / "config"
        abi_path = config_dir / "contract_abi.json"
        
        if not abi_path.exists():
            logger.warning("⚠️ Contract ABI not found. Blockchain verification disabled.")
            self.contract = None
            return
        
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        # Validate contract address
        if not self.contract_address or self.contract_address == "WILL_BE_SET_AFTER_DEPLOYMENT":
            logger.warning("⚠️ Contract address not configured. Blockchain verification disabled.")
            self.contract = None
            return
        
        # Convert address to checksum format
        self.contract_address = Web3.to_checksum_address(self.contract_address)
        
        # Initialize contract
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=contract_abi
        )
        
        logger.info(f"✅ Contract loaded at: {self.contract_address}")
    
    def is_available(self) -> bool:
        """Check if blockchain verification is available"""
        return self.contract is not None and self.w3.is_connected()
    
    def check_who_fact(self, claim_text: str) -> Optional[Dict[str, Any]]:
        """
        Query blockchain for WHO verification of a health claim
        
        Args:
            claim_text: The health claim to verify
            
        Returns:
            Dict with WHO fact data if found on-chain and active, None otherwise
        """
        if not self.is_available():
            logger.debug("Blockchain verification not available")
            return None
        
        try:
            # Create minimal fact JSON for hash computation
            # Note: This is a simplified approach. In production, you'd need
            # to try various claim normalizations or use a more sophisticated
            # matching system (e.g., semantic search + hash lookup)
            
            # For now, we'll just try exact claim matching
            # A better approach would be to maintain a local index of claim_text -> factHash
            
            logger.debug(f"Checking blockchain for claim: {claim_text[:100]}...")
            
            # This is a placeholder - see note below
            # In practice, you'd need to either:
            # 1. Maintain a local DB of claim_text -> factHash mappings
            # 2. Use event logs to build an index
            # 3. Have the frontend send the suspected fact ID
            
            # For demonstration, we'll check against our known sample facts
            return self._check_against_known_facts(claim_text)
            
        except Exception as e:
            logger.error(f"Error checking blockchain: {str(e)}")
            return None
    
    def _check_against_known_facts(self, claim_text: str) -> Optional[Dict[str, Any]]:
        """
        Helper method to check against known WHO facts
        In production, replace with proper indexing system
        """
        # Load known WHO facts from local files
        facts_dir = Path(__file__).parent.parent / "data" / "who_facts"
        
        if not facts_dir.exists():
            return None
        
        for fact_file in facts_dir.glob("who-*.json"):
            try:
                with open(fact_file, 'r', encoding='utf-8') as f:
                    fact_json = json.load(f)
                
                # Check if claim text matches (case-insensitive, normalized)
                if self._normalize_claim(claim_text) in self._normalize_claim(fact_json['claim_text']):
                    # Compute hash
                    fact_hash = compute_who_fact_hash(fact_json)
                    
                    # Query blockchain
                    return self.get_fact_by_hash(fact_hash)
                    
            except Exception as e:
                logger.debug(f"Error checking fact file {fact_file}: {e}")
                continue
        
        return None
    
    def _normalize_claim(self, text: str) -> str:
        """Normalize claim text for comparison"""
        return text.lower().strip()
    
    def get_fact_by_hash(self, fact_hash: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve fact from blockchain by canonical hash
        
        Args:
            fact_hash: Canonical SHA-256 hash (with or without 0x prefix)
            
        Returns:
            Dict with fact data if found and active, None otherwise
        """
        if not self.is_available():
            return None
        
        try:
            # Ensure 0x prefix
            if not fact_hash.startswith("0x"):
                fact_hash = f"0x{fact_hash}"
            
            # Convert to bytes32
            fact_hash_bytes = Web3.to_bytes(hexstr=fact_hash)
            
            # Check if fact exists
            exists, status = self.contract.functions.checkFactExists(fact_hash_bytes).call()
            
            if not exists:
                logger.debug(f"Fact not found on-chain: {fact_hash}")
                return None
            
            # Get full fact details
            fact = self.contract.functions.getFactByHash(fact_hash_bytes).call()
            
            # Parse fact tuple (matches Solidity struct)
            fact_data = {
                "fact_hash": fact[0].hex(),
                "fact_id": fact[1],
                "verdict": enum_to_verdict(fact[2]),
                "severity": enum_to_severity(fact[3]),
                "issued_at": fact[4],
                "last_reviewed_at": fact[5],
                "version": fact[6],
                "status": enum_to_status(fact[7]),
                "added_by": fact[8],
                "added_at_block": fact[9]
            }
            
            # Only return if status is ACTIVE
            if fact_data["status"] != "active":
                logger.info(f"Fact found but status is {fact_data['status']}: {fact_data['fact_id']}")
                return None
            
            logger.info(f"✅ WHO fact verified on-chain: {fact_data['fact_id']}")
            return fact_data
            
        except ContractLogicError as e:
            logger.debug(f"Contract call failed (fact likely doesn't exist): {e}")
            return None
        except Web3Exception as e:
            logger.error(f"Web3 error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error querying blockchain: {e}")
            return None
    
    def get_fact_by_id(self, fact_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve fact from blockchain by WHO fact ID
        
        Args:
            fact_id: WHO fact ID (e.g., "who-2025-0001")
            
        Returns:
            Dict with fact data if found and active, None otherwise
        """
        if not self.is_available():
            return None
        
        try:
            # Query contract
            fact = self.contract.functions.getFactById(fact_id).call()
            
            # Parse fact tuple
            fact_data = {
                "fact_hash": fact[0].hex(),
                "fact_id": fact[1],
                "verdict": enum_to_verdict(fact[2]),
                "severity": enum_to_severity(fact[3]),
                "issued_at": fact[4],
                "last_reviewed_at": fact[5],
                "version": fact[6],
                "status": enum_to_status(fact[7]),
                "added_by": fact[8],
                "added_at_block": fact[9]
            }
            
            # Only return if status is ACTIVE
            if fact_data["status"] != "active":
                return None
            
            return fact_data
            
        except ContractLogicError:
            return None
        except Exception as e:
            logger.error(f"Error getting fact by ID: {e}")
            return None
    
    def get_total_facts(self) -> int:
        """Get total number of facts registered on-chain"""
        if not self.is_available():
            return 0
        
        try:
            return self.contract.functions.totalFacts().call()
        except Exception as e:
            logger.error(f"Error getting total facts: {e}")
            return 0
    
    def get_contract_owner(self) -> Optional[str]:
        """Get contract owner address (WHO authority)"""
        if not self.is_available():
            return None
        
        try:
            return self.contract.functions.owner().call()
        except Exception as e:
            logger.error(f"Error getting contract owner: {e}")
            return None


# Singleton instance
_blockchain_client: Optional[BlockchainClient] = None


def get_blockchain_client() -> BlockchainClient:
    """Get or create blockchain client singleton"""
    global _blockchain_client
    
    if _blockchain_client is None:
        _blockchain_client = BlockchainClient()
    
    return _blockchain_client
