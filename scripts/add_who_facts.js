const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const canonicalize = require("json-canonicalize");
const crypto = require("crypto");

/**
 * Script to add WHO facts to the HealthFactRegistry smart contract
 * This script:
 * 1. Loads WHO fact JSON files
 * 2. Computes canonical SHA-256 hashes
 * 3. Submits facts to the on-chain registry
 */

/**
 * Compute canonical SHA-256 hash of a WHO fact JSON object
 * @param {Object} factJson - The WHO fact object
 * @returns {string} - Hex-encoded SHA-256 hash with 0x prefix
 */
function computeFactHash(factJson) {
    // Canonicalize JSON per RFC 8785
    const canonical = canonicalize(factJson);

    // Compute SHA-256 hash
    const hash = crypto.createHash("sha256").update(canonical, "utf8").digest("hex");

    return "0x" + hash;
}

/**
 * Convert verdict string to enum value
 */
function verdictToEnum(verdict) {
    const mapping = {
        "true": 0,
        "false": 1,
        "misleading": 2,
        "unproven": 3,
        "partially_true": 4
    };
    return mapping[verdict];
}

/**
 * Convert severity string to enum value
 */
function severityToEnum(severity) {
    const mapping = {
        "low": 0,
        "medium": 1,
        "high": 2,
        "critical": 3
    };
    return mapping[severity];
}

/**
 * Convert ISO 8601 timestamp to Unix timestamp
 */
function isoToUnix(isoString) {
    return Math.floor(new Date(isoString).getTime() / 1000);
}

/**
 * Main execution function
 */
async function main() {
    console.log("🔐 Starting WHO Fact Registration Process...\n");

    // Load contract deployment info
    const deploymentInfoPath = path.join(__dirname, "..", "backend", "app", "config", "contract_deployment.json");
    if (!fs.existsSync(deploymentInfoPath)) {
        throw new Error("❌ Contract deployment info not found. Please run deploy.js first.");
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf8"));
    const contractAddress = deploymentInfo.contractAddress;

    console.log(`📋 Contract Address: ${contractAddress}`);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log(`👤 Signer Address: ${signer.address}\n`);

    // Load contract
    const HealthFactRegistry = await hre.ethers.getContractFactory("HealthFactRegistry");
    const registry = HealthFactRegistry.attach(contractAddress);

    // Verify owner
    const owner = await registry.owner();
    console.log(`👑 Contract Owner: ${owner}`);

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        throw new Error("❌ Signer is not the contract owner. Only WHO authority can add facts.");
    }

    // Load WHO fact JSON files
    const whoFactsDir = path.join(__dirname, "..", "backend", "app", "data", "who_facts");
    const factFiles = fs.readdirSync(whoFactsDir).filter(f => f.endsWith(".json"));

    console.log(`\n📂 Found ${factFiles.length} WHO fact file(s) to process\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const filename of factFiles) {
        const filePath = path.join(whoFactsDir, filename);
        const factJson = JSON.parse(fs.readFileSync(filePath, "utf8"));

        console.log("━".repeat(60));
        console.log(`📝 Processing: ${factJson.id} - ${filename}`);
        console.log("━".repeat(60));

        // Compute canonical hash
        const factHash = computeFactHash(factJson);
        console.log(`🔐 Canonical Hash: ${factHash}`);

        // Check if fact already exists
        const [exists, status] = await registry.checkFactExists(factHash);

        if (exists) {
            console.log(`⚠️  Fact already registered (Status: ${status})`);
            console.log(`⏭️  Skipping...\n`);
            skipCount++;
            continue;
        }

        // Prepare transaction parameters
        const verdictEnum = verdictToEnum(factJson.verdict);
        const severityEnum = severityToEnum(factJson.severity);
        const issuedAt = isoToUnix(factJson.issued_at);
        const lastReviewedAt = isoToUnix(factJson.last_reviewed_at);
        const version = factJson.version;

        console.log(`📊 Fact Details:`);
        console.log(`   - ID: ${factJson.id}`);
        console.log(`   - Claim: ${factJson.claim_text.substring(0, 80)}...`);
        console.log(`   - Verdict: ${factJson.verdict} (enum: ${verdictEnum})`);
        console.log(`   - Severity: ${factJson.severity} (enum: ${severityEnum})`);
        console.log(`   - Version: ${version}`);

        // Submit transaction
        console.log(`\n🚀 Submitting transaction...`);

        try {
            const tx = await registry.addFact(
                factHash,
                factJson.id,
                verdictEnum,
                severityEnum,
                issuedAt,
                lastReviewedAt,
                version
            );

            console.log(`📋 Transaction Hash: ${tx.hash}`);
            console.log(`⏳ Waiting for confirmation...`);

            const receipt = await tx.wait();

            console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
            console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

            // Parse event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = registry.interface.parseLog(log);
                    return parsed.name === "FactAdded";
                } catch {
                    return false;
                }
            });

            if (event) {
                const parsed = registry.interface.parseLog(event);
                console.log(`📡 Event FactAdded emitted:`);
                console.log(`   - Fact Hash: ${parsed.args.factHash}`);
                console.log(`   - Fact ID: ${parsed.args.factId}`);
            }

            successCount++;
            console.log(`✅ Successfully registered!\n`);

        } catch (error) {
            console.error(`❌ Failed to register fact: ${error.message}\n`);
        }
    }

    // Final summary
    console.log("═".repeat(60));
    console.log("📊 REGISTRATION SUMMARY");
    console.log("═".repeat(60));
    console.log(`✅ Successfully registered: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`📁 Total facts processed: ${factFiles.length}`);

    // Verify total on-chain
    const totalFacts = await registry.totalFacts();
    console.log(`\n🔗 Total facts on-chain: ${totalFacts}`);
    console.log("═".repeat(60));
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:");
        console.error(error);
        process.exit(1);
    });
