require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
      chainId: 50312,
      accounts: process.env.SOMNIA_PRIVATE_KEY ? [process.env.SOMNIA_PRIVATE_KEY] : [],
      gasPrice: "auto"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
