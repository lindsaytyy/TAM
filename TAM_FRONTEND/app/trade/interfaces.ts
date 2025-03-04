import {
    CryptoInput,
    type CryptoInputProps,
    type Token,
    useAccount,
} from "@ant-design/web3";
import { getTokenInfo } from "@/utils/contractsAddress"; export interface Pools {
    pool: string;
    token0: string;
    token1: string;
    index: number;
    fee: number;
    feeProtocol: number;
    tickLower: number;
    tickUpper: number;
    tick: number;
    sqrtPriceX96: bigint;
    liquidity: bigint;
}
export interface Pair {
    token0: string;
    token1: string;
}
export const defaultToken = {
    amount: BigInt(0),
    inputString: "",
    token: getTokenInfo("0x00"),
}
export interface SwapParams {
    _addressA: `0x${string}`;
    _addressB: `0x${string}`;
    _cryptoA?: CryptoInputProps["value"];
    _cryptoB?: CryptoInputProps["value"];
    _swapIndexPath: number[];
    _account?: `0x${string}`;
    _sqrtPriceLimitX96?: bigint;
}