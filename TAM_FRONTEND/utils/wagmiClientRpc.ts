// src/config/rpc.ts
import { Chain } from 'viem/chains'
export const SUPPORTED_CHAINS: [Chain, ...Chain[]] = [
  // {
  //   id: 1,
  //   name: 'Ethereum',
  //   nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  //   rpcUrls: {
  //     default: { http: [import.meta.env.VITE_RPC_URL_MAINNET] },
  //   },
  //   blockExplorers: {
  //     default: { name: 'Etherscan', url: 'https://etherscan.io' },
  //   },
  // },
  {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || " "] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
  },
]

// 获取当前链的 RPC URL
export function getRpcUrl(chainId: number): string {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
  if (!chain) throw new Error(`Unsupported chainId: ${chainId}`)

  // 开发环境下强制检查本地节点
  if (import.meta.env.DEV) {
    const isLocalNode = chain.rpcUrls.default.http.some(url => url.includes('localhost'))
    if (isLocalNode && !window.ethereum?.isMetaMask) {
      console.warn('本地节点未启动，请运行 `npx hardhat node`')
    }
  }

  return chain.rpcUrls.default.http[0]
}