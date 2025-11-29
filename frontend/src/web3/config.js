// Somnia Testnet configuration for wagmi
import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'

// Define Somnia Testnet as a custom chain
export const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: {
        name: 'Somnia Test Token',
        symbol: 'STT',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://dream-rpc.somnia.network'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Somnia Explorer',
            url: 'https://somnia-explorer.com',
        },
    },
    testnet: true,
})

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [somniaTestnet],
    transports: {
        [somniaTestnet.id]: http(),
    },
})

// Contract configuration
export const HEALTH_FACT_REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xc31Fd2D4D7dED1dDFD0814B5dB58a5a67A446849'
