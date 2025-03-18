import {
    type CryptoInputProps,
} from "@ant-design/web3";
import { getTokenInfo } from "@/utils/contractsAddress";
export interface Pools {
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
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    indexPath: number[];
    recipient?: `0x${string}`;
    sqrtPriceLimitX96?: bigint;
}
export interface QuoteParams {
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    indexPath: number[];
    sqrtPriceLimitX96: bigint;
}
export interface QuoteParamsIn extends QuoteParams {
    amountIn: bigint;
}
export interface QuoteParamsOut extends QuoteParams {
    amountOut: bigint;
}
export type FunctionToParams<T extends "quoteExactInput" | "quoteExactOutput"> =
    T extends "quoteExactInput" ? [QuoteParamsIn] : [QuoteParamsOut];

export type SwapState = {
    input: CryptoInputProps["value"];
    output: CryptoInputProps["value"];
    loading: boolean;
};