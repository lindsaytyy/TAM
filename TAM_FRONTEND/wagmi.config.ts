import { defineConfig } from "@wagmi/cli";
import { hardhat } from "@wagmi/cli/plugins";
import { react } from "@wagmi/cli/plugins";

export default defineConfig({
    out: "utils/contracts.ts",
    plugins: [
        hardhat({
            project: "../TAM_BACKEND",
        }),
        react(),
    ],
});
/**
 * 通过扫描 Hardhat 项目的合约 ABI，自动生成对应的 TypeScript 类型和 React Hooks;，与运行时 RPC 配置无关。
 */