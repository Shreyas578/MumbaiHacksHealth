// Contract ABI for HealthFactRegistry
export const HEALTH_FACT_REGISTRY_ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_factHash", "type": "bytes32" },
            { "internalType": "string", "name": "_factId", "type": "string" },
            { "internalType": "uint8", "name": "_verdict", "type": "uint8" },
            { "internalType": "uint8", "name": "_severity", "type": "uint8" },
            { "internalType": "uint64", "name": "_issuedAt", "type": "uint64" },
            { "internalType": "uint64", "name": "_lastReviewedAt", "type": "uint64" },
            { "internalType": "uint16", "name": "_version", "type": "uint16" }
        ],
        "name": "addFact",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_factHash", "type": "bytes32" }
        ],
        "name": "getFactByHash",
        "outputs": [
            {
                "components": [
                    { "internalType": "bytes32", "name": "factHash", "type": "bytes32" },
                    { "internalType": "string", "name": "factId", "type": "string" },
                    { "internalType": "uint8", "name": "verdict", "type": "uint8" },
                    { "internalType": "uint8", "name": "severity", "type": "uint8" },
                    { "internalType": "uint64", "name": "issuedAt", "type": "uint64" },
                    { "internalType": "uint64", "name": "lastReviewedAt", "type": "uint64" },
                    { "internalType": "uint16", "name": "version", "type": "uint16" },
                    { "internalType": "uint8", "name": "status", "type": "uint8" },
                    { "internalType": "address", "name": "addedBy", "type": "address" },
                    { "internalType": "uint64", "name": "addedAtBlock", "type": "uint64" }
                ],
                "internalType": "struct HealthFactRegistry.HealthFact",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFacts",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "bytes32", "name": "factHash", "type": "bytes32" },
            { "indexed": true, "internalType": "string", "name": "factId", "type": "string" },
            { "indexed": false, "internalType": "uint8", "name": "verdict", "type": "uint8" },
            { "indexed": false, "internalType": "address", "name": "addedBy", "type": "address" }
        ],
        "name": "FactAdded",
        "type": "event"
    }
]
