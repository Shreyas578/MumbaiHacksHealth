# WHO Blockchain Verification - Deployment & Usage Guide

## 🚀 Quick Start

This guide walks you through deploying the HealthFactRegistry contract to Somnia Testnet and registering WHO facts.

---

## Prerequisites

### 1. Somnia Testnet Wallet Setup

You need a wallet with STT tokens on Somnia Testnet:

- **RPC URL**: `https://dream-rpc.somnia.network`
- **Chain ID**: `50312`
- **Currency**: STT

**How to get STT tokens**:
- Visit Somnia Testnet faucet (check Somnia documentation)
- Or contact Somnia team for testnet tokens

### 2. Private Key

Export your wallet's private key (⚠️ **NEVER share or commit this!**)

---

## Step-by-Step Deployment

### Step 1: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (in backend directory)
cd backend
pip install -r requirements.txt
cd ..
```

### Step 2: Configure Environment Variables

Edit `backend\.env` and add your Somnia private key:

```env
# Replace YOUR_PRIVATE_KEY_HERE with your actual private key (including 0x prefix)
SOMNIA_PRIVATE_KEY=0x1234567890abcdef...
```

⚠️ **Security**: Ensure `.env` is in `.gitignore` and NEVER commit it!

### Step 3: Compile Smart Contract

```bash
npx hardhat compile
```

**Expected output**:
```
Compiled 1 Solidity file successfully
```

### Step 4: Deploy to Somnia Testnet

```bash
npx hardhat run scripts/deploy.js --network somnia
```

**Expected output**:
```
🚀 Starting HealthFactRegistry deployment on Somnia Testnet...

📡 Network: somnia
🔗 Chain ID: 50312
👤 Deployer address: 0x...
💰 Deployer balance: 10.5 STT

📝 Deploying HealthFactRegistry contract...
✅ Contract deployed to: 0xABCD1234...
📋 Deployment transaction hash: 0x5678...
⛽ Gas used: 1234567

👑 Contract owner: 0x...
✓ Owner matches deployer: true

📊 Total facts registered: 0

💾 Deployment info saved to: backend\app\config\contract_deployment.json
💾 Contract ABI saved to: backend\app\config\contract_abi.json

============================================================
✨ DEPLOYMENT SUMMARY
============================================================
Contract Address: 0xABCD1234...
Network: Somnia Testnet (Chain ID: 50312)
Owner: 0x...
Transaction: 0x5678...
============================================================

📝 Next steps:
1. Add contract address to .env file:
   HEALTH_FACT_REGISTRY_ADDRESS=0xABCD1234...
2. Run: node scripts/add_who_facts.js
3. Verify deployment on Somnia block explorer
```

### Step 5: Update Environment Variables

**Automatic**: The deployment script saves the contract address to `backend/app/config/contract_deployment.json`

**Manual** (optional): Also update `backend\.env`:

```env
HEALTH_FACT_REGISTRY_ADDRESS=0xABCD1234...  # Your deployed contract address
```

### Step 6: Register WHO Facts On-Chain

```bash
node scripts/add_who_facts.js
```

**Expected output**:
```
🔐 Starting WHO Fact Registration Process...

📋 Contract Address: 0xABCD1234...
👤 Signer Address: 0x...

👑 Contract Owner: 0x...

📂 Found 2 WHO fact file(s) to process

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Processing: who-2025-0001 - who-2025-0001.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Canonical Hash: 0xa1b2c3d4...
📊 Fact Details:
   - ID: who-2025-0001
   - Claim: Drinking hot water or warm beverages can cure or prevent COVID-19 infection...
   - Verdict: false (enum: 1)
   - Severity: high (enum: 2)
   - Version: 1

🚀 Submitting transaction...
📋 Transaction Hash: 0xabcd1234...
⏳ Waiting for confirmation...
✅ Confirmed in block: 12345
⛽ Gas Used: 123456
📡 Event FactAdded emitted:
   - Fact Hash: 0xa1b2c3d4...
   - Fact ID: who-2025-0001
✅ Successfully registered!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Processing: who-2025-0002 - who-2025-0002.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Canonical Hash: 0xe5f6g7h8...
📊 Fact Details:
   - ID: who-2025-0002
   - Claim: Turmeric can cure cancer and is as effective as chemotherapy...
   - Verdict: misleading (enum: 2)
   - Severity: critical (enum: 3)
   - Version: 1

🚀 Submitting transaction...
📋 Transaction Hash: 0xdcba4321...
⏳ Waiting for confirmation...
✅ Confirmed in block: 12346
⛽ Gas Used: 123789
📡 Event FactAdded emitted:
   - Fact Hash: 0xe5f6g7h8...
   - Fact ID: who-2025-0002
✅ Successfully registered!

═══════════════════════════════════════════════════════════
📊 REGISTRATION SUMMARY
═══════════════════════════════════════════════════════════
✅ Successfully registered: 2
⏭️  Skipped (already exists): 0
📁 Total facts processed: 2

🔗 Total facts on-chain: 2
═══════════════════════════════════════════════════════════
```

---

## Testing the Integration

### Test 1: Verify Canonical Hashing (Python)

```bash
cd backend/app/utils
python canonical_hash.py
```

**Expected output**:
```
🧪 Testing canonical hash computation...
Fact ID: who-2025-0001
Claim: Drinking hot water or warm beverages can cure or prevent...

🔐 Canonical Hash: 0xa1b2c3d4e5f6...

📝 Canonical JSON (first 200 chars):
{"claim_text":"Drinking hot water or warm beverages can cure or prevent COVID-19 infection","evidence":[{"accessed_at":"2025-01-15T10:30:00Z",...

✅ Verdict enum: 1
✅ Severity enum: 2
✅ Status enum: 0
```

### Test 2: Start FastAPI Backend

```bash
cd backend
uvicorn app.main:app --reload
```

### Test 3: Test WHO Fact Verification via API

**Test with hot water COVID claim** (should match WHO fact):

```bash
curl -X POST "http://localhost:8000/api/check_rumor" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Drinking hot water can cure COVID-19\", \"channel\": \"web\"}"
```

**Expected response** (blockchain-verified):
```json
{
  "id": 1,
  "original_text": "Drinking hot water can cure COVID-19",
  "normalized_claim": "Drinking hot water or warm beverages can cure or prevent COVID-19 infection",
  "verdict": "False",
  "severity": "High",
  "explanation": "Hot water does not cure or prevent COVID-19...",
  "sources": [
    {
      "name": "WHO COVID-19 Myth Busters",
      "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"
    }
  ],
  "channel": "web",
  "created_at": "2025-01-29T...",
  "on_chain_verified": true,
  "who_fact_id": "who-2025-0001",
  "verification_method": "WHO Blockchain Registry",
  "blockchain_explorer_url": "https://somnia-explorer.com/address/0xABCD..."
}
```

**Test with unknown claim** (should fallback to AI):

```bash
curl -X POST "http://localhost:8000/api/check_rumor" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Eating garlic prevents all diseases\", \"channel\": \"web\"}"
```

**Expected response** (AI-verified):
```json
{
  ...
  "on_chain_verified": false,
  "who_fact_id": null,
  "verification_method": "AI",
  "blockchain_explorer_url": null
}
```

---

## API Response Schema

### Blockchain Verification Fields

The `/api/check_rumor` endpoint now includes:

| Field | Type | Description |
|-------|------|-------------|
| `on_chain_verified` | boolean | `true` if verified against WHO blockchain registry |
| `who_fact_id` | string \| null | WHO fact ID (e.g., `"who-2025-0001"`) if verified on-chain |
| `verification_method` | string | `"WHO Blockchain Registry"` or `"AI"` |
| `blockchain_explorer_url` | string \| null | Link to view contract on Somnia explorer |

---

## Troubleshooting

### Issue: "Failed to connect to blockchain RPC"

**Solution**:
- Check `WEB3_PROVIDER_URL` in `.env`
- Verify Somnia RPC is accessible: `https://dream-rpc.somnia.network`
- Check your internet connection

### Issue: "Contract address not configured"

**Solution**:
- Run deployment script: `npx hardhat run scripts/deploy.js --network somnia`
- Verify `backend/app/config/contract_deployment.json` exists
- Or manually set `HEALTH_FACT_REGISTRY_ADDRESS` in `.env`

### Issue: "Deployer account has zero balance"

**Solution**:
- Get STT tokens from Somnia faucet
- Check balance: `npx hardhat run scripts/check_balance.js --network somnia`

### Issue: "Signer is not the contract owner"

**Solution**:
- Only the wallet that deployed the contract can add facts
- Ensure you're using the same `SOMNIA_PRIVATE_KEY` that deployed the contract

### Issue: "Fact already exists"

**Solution**:
- This is expected if you run `add_who_facts.js` multiple times
- Facts are deduplicated by hash on-chain
- Script will show: `⚠️ Fact already registered` and skip

---

## Adding New WHO Facts

### 1. Create WHO Fact JSON

Create a new file in `backend/app/data/who_facts/who-YYYY-NNNN.json`:

```json
{
  "id": "who-2025-0003",
  "claim_text": "Your health claim here",
  "verdict": "false",
  "severity": "high",
  "summary": "Explanation of verdict...",
  "evidence": [
    {
      "url": "https://www.who.int/...",
      "title": "Source title",
      "checksum": "sha256_hash_of_pdf",
      "accessed_at": "2025-01-29T12:00:00Z"
    }
  ],
  "topics": ["topic1", "topic2"],
  "issued_at": "2025-01-29T12:00:00Z",
  "last_reviewed_at": "2025-01-29T12:00:00Z",
  "version": 1,
  "status": "active"
}
```

### 2. Validate Against Schema

```bash
# TODO: Add JSON schema validation script
```

### 3. Register On-Chain

```bash
node scripts/add_who_facts.js
```

The script automatically:
- ✅ Computes canonical hash
- ✅ Checks for duplicates
- ✅ Submits to blockchain
- ✅ Emits events

---

## Smart Contract Utilities

### View Contract on Blockchain

Visit Somnia block explorer (check Somnia docs for URL):
```
https://somnia-explorer.com/address/<CONTRACT_ADDRESS>
```

### Query Contract Directly (Read-only)

```javascript
// Example: Get total facts
const totalFacts = await contract.totalFacts();
console.log(`Total WHO facts: ${totalFacts}`);

// Example: Get fact by ID
const fact = await contract.getFactById("who-2025-0001");
console.log(fact);
```

---

## Security Best Practices

### ⚠️ Private Key Security

- **NEVER** commit `.env` to git
- **NEVER** share your private key
- Use hardware wallets for production
- Rotate keys if compromised

### ✅ Contract Ownership

- Only contract owner (deployer) can add/update facts
- Transfer ownership if needed: `contract.transferOwnership(newAddress)`
- Ownership changes are logged via `OwnershipTransferred` event

### 🔒 Fact Immutability

- Fact hashes and IDs cannot be changed once added
- Facts can only be marked as `SUPERSEDED` or `WITHDRAWN` (not deleted)
- Version tracking maintains audit trail

---

## Next Steps

✅ Phases 1-5 Complete!

**Phase 6: Frontend Integration** (Optional):
- Add WHO verification badge to Truth Cards
- Display blockchain explorer links
- Show WHO fact ID prominently
- Create "WHO Blockchain Facts" page

See `implementation_plan.md` for Phase 6 details.

---

## Support Files Created

| File | Purpose |
|------|---------|
| `hardhat.config.js` | Hardhat configuration for Somnia |
| `scripts/deploy.js` | Contract deployment script |
| `scripts/add_who_facts.js` | WHO fact registration script |
| `backend/app/utils/canonical_hash.py` | Python hashing utilities |
| `backend/app/services/blockchain_client.py` | Web3 client service |
| `backend/app/config/contract_deployment.json` | Deployment metadata (auto-generated) |
| `backend/app/config/contract_abi.json` | Contract ABI (auto-generated) |

---

## Questions?

- Check contract source: `contracts/HealthFactRegistry.sol`
- Review implementation plan: `implementation_plan.md`
- See WHO facts: `backend/app/data/who_facts/`
- Test canonical hashing: `python backend/app/utils/canonical_hash.py`
