import { hardhat } from '@wagmi/core/chains'
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
        chain: hardhat,
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

export const initialPoolsColumns = [
    {
        title: "INDEX",
        dataIndex: "index",
        key: "index",
        width: "4%",
    },
    {
        title: "POOL",
        dataIndex: "pool",
        key: "pool",
    },

    {
        title: "FEES",
        dataIndex: "fee",
        key: "fee",
    },
];
export const renderType = {
    LINK: "link",
    COPY: "copy",
    BUTTON: "button"
}
export let initialMyPositionsColumns = [
    {
        title: "INDEX",
        dataIndex: "index",
        key: "index",
        width: 100,
        fixed: 'left',
    },
    {
        title: "owner",
        dataIndex: "owner",
        key: "owner",
    },
    {
        title: "tokensOwed0",
        dataIndex: "tokensOwed0",
        key: "tokensOwed0",
    },
    {
        title: "tokensOwed1",
        dataIndex: "tokensOwed1",
        key: "tokensOwed1",
    },
    {
        title: "token0",
        dataIndex: "token0",
        key: "token0",
    },
    {
        title: "token1",
        dataIndex: "token1",
        key: "token1",

    },
    {
        title: "liquidity",
        dataIndex: "liquidity",
        key: "liquidity",
    },

]

