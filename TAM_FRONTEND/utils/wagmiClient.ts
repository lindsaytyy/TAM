// src/config/wagmi.ts
import { createConfig, http } from '@wagmi/core'
import { SUPPORTED_CHAINS, getRpcUrl } from './wagmiClientRpc'

export const config = createConfig({
    chains: SUPPORTED_CHAINS,
    transports: {
        // 动态生成 Transport 配置
        // [1]: http(getRpcUrl(1), {
        //     timeout: 30_000, // 生产环境增加超时时间
        //     retryCount: import.meta.env.PROD ? 3 : 1
        // }),
        [11155111]: http(getRpcUrl(11155111)),
    },
})