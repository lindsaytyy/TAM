// global.d.ts
interface Window {
    ethereum?: any;
}
interface ImportMetaEnv {
    NEXT_PUBLIC_RPC_URL_HARDHAT: string
    NEXT_PUBLIC_RPC_URL_SEPOLIA: string
    NEXT_PUBLIC_RPC_URL_FUJI: string
    NEXT_PUBLIC_RPC_URL_AMOY: string
    DEV: boolean
}
interface ImportMeta {
    env: ImportMetaEnv
}