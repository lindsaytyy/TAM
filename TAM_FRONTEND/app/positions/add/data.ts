import { Hardhat, Sepolia } from "@ant-design/web3-wagmi";

export interface Fee {
    title: string;
    description: string;
    id: string;
}

export const defaultToken = {
    name: "TokenDefault",
    symbol: "TKD",
    icon: null,
    decimal: 8,
    availableChains: [{
        chain: Hardhat,
        contract: "0x00"
    }]
};
interface TokenInfo {
    availableChains: {
        contract: `0x${string}`;
        decimal: number;
    }[];
    symbol: string;
    name: string;
}

interface StepFormData {
    1: {
        fee: string;
        tokenA: TokenInfo;
        tokenB: TokenInfo;
    };
    2: {
        inputMin: string;
        inputMax: string;
    };
    3: {
        inputMintTokenA: string;
        inputMintTokenB: string;
    };
}
type StepKeys = keyof StepFormData;
export const feeList: Fee[] = [
    { title: "0.01% Fee tier", description: "Best for very stable pairs.", id: "0.01" },
    { title: "0.05% Fee tier", description: "Best for stable pairs.", id: "0.05" },
    { title: "0.3% Fee tier", description: "Best for most pairs.", id: "0.3" },
    { title: "1% Fee tier", description: "Best for exotic pairs.", id: "1" },
]
