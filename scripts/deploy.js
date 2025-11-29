const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for HealthFactRegistry smart contract on Somnia Testnet
 */
async function main() {
    console.log("🚀 Starting HealthFactRegistry deployment on Somnia Testnet...\n");

    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name}`);
    console.log(`🔗 Chain ID: ${network.chainId}`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`👤 Deployer address: ${deployer.address}`);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} STT\n`);

    if (balance === 0n) {
        throw new Error("❌ Deployer account has zero balance. Please fund with STT tokens.");
    }

    // Deploy contract
    console.log("📝 Deploying HealthFactRegistry contract...");
    const HealthFactRegistry = await hre.ethers.getContractFactory("HealthFactRegistry");
    const registry = await HealthFactRegistry.deploy();

    await registry.waitForDeployment();

    const contractAddress = await registry.getAddress();
    console.log(`✅ Contract deployed to: ${contractAddress}`);

    // Get deployment transaction
    const deployTx = registry.deploymentTransaction();
    console.log(`📋 Deployment transaction hash: ${deployTx.hash}`);
    console.log(`⛽ Gas used: ${deployTx.gasLimit.toString()}\n`);

    // Verify contract owner
    const owner = await registry.owner();
    console.log(`👑 Contract owner: ${owner}`);
    console.log(`✓ Owner matches deployer: ${owner.toLowerCase() === deployer.address.toLowerCase()}\n`);

    // Get total facts (should be 0 initially)
    const totalFacts = await registry.totalFacts();
    console.log(`📊 Total facts registered: ${totalFacts}\n`);

    // Prepare deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: Number(network.chainId),
        contractAddress: contractAddress,
        owner: owner,
        deployer: deployer.address,
        deploymentTxHash: deployTx.hash,
        blockNumber: deployTx.blockNumber,
        timestamp: new Date().toISOString(),
        compiler: {
            solidity: "0.8.20",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

    // Save deployment info to JSON
    const deploymentDir = path.join(__dirname, "..", "backend", "app", "config");
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentDir, "contract_deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);

    // Save contract ABI
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "HealthFactRegistry.sol", "HealthFactRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const abiPath = path.join(deploymentDir, "contract_abi.json");
    fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`💾 Contract ABI saved to: ${abiPath}\n`);

    // Summary
    console.log("=".repeat(60));
    console.log("✨ DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: Somnia Testnet (Chain ID: ${network.chainId})`);
    console.log(`Owner: ${owner}`);
    console.log(`Transaction: ${deployTx.hash}`);
    console.log("=".repeat(60));
    console.log("\n📝 Next steps:");
    console.log("1. Add contract address to .env file:");
    console.log(`   HEALTH_FACT_REGISTRY_ADDRESS=${contractAddress}`);
    console.log("2. Run: node scripts/add_who_facts.js");
    console.log("3. Verify deployment on Somnia block explorer\n");
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
