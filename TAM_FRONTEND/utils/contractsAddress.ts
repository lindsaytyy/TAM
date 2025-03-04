import { Hardhat, Sepolia } from "@ant-design/web3-wagmi";
import { Token, type CryptoInputProps } from "@ant-design/web3";
// 定义包含所有合约地址的对象
type ContractName = 'Owner' | 'Factory' | 'TestTokenA' | 'TestTokenB' | 'MockLP' | 'MockSwap' | 'PoolManager' | 'PositionManager' | 'SwapRouter';
const contractAddresses: { [key in ContractName]: string } = {
    Factory: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    TestTokenA: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    TestTokenB: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    MockLP: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    MockSwap: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    PoolManager: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    PositionManager: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    SwapRouter: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    Owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
};

// 提供一个函数来获取合约地址
export const getContractAddr = (contractName: ContractName): string => {
    return contractAddresses[contractName];
};

// 如果需要，也可以导出整个对象
export { contractAddresses };

export const tokenList = {
    [contractAddresses["TestTokenA"]]: {
        name: "Token A",
        symbol: "TKA",
        icon: null,
        decimal: 18,
        availableChains: [
            {
                chain: Hardhat,
                contract: contractAddresses["TestTokenA"]
            }
        ]

    },
    [contractAddresses["TestTokenB"]]: {
        name: "Token B",
        symbol: "TKB",
        icon: null,
        decimal: 18,
        availableChains: [
            {
                chain: Hardhat,
                contract: contractAddresses["TestTokenB"]
            }
        ]

    }
}

export const getTokenInfo = (address: string): Token => {
    if (tokenList[address]) {
        return tokenList[address];
    }
    return {
        icon: null,
        symbol: " ",
        decimal: 18,
        name: address,
        availableChains: [
            {
                chain: Hardhat,
                contract: address,
            },
            {
                chain: Sepolia,
                contract: address,
            },
        ],

    };
};