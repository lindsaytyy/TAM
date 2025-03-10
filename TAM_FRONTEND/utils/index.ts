"use client";
import { TickMath, encodeSqrtRatioX96 } from "@uniswap/v3-sdk";
import { maxBy, minBy } from "lodash-es";
import type { Token } from "@ant-design/web3";
import { useChainId } from "wagmi";
export const useTokenAddressInAvailableChains = (token?: Token) => {
    // 使用React Hook来获取chainId
    const chainId = useChainId();
    
    // 返回找到的合约地址或者undefined
    return token?.availableChains.find((item) => item.chain.id === chainId)
        ?.contract as `0x${string}` | undefined;
}
export function ensureTokenOrder(token0: `0x${string}`, token1: `0x${string}`) {
    if (token0.toLowerCase() > token1.toLowerCase()) {
        // 如果 token0 大于 token1，则交换它们
        return {
            token0: token1,
            token1: token0,
        };
    }
    return {
        token0: token0,
        token1: token1,
    }
}
export const renderType = {
    LINK: "link",
    COPY: "copy",
    BUTTON: "button"
}

export const computeSqrtPriceLimitX96 = (
    pools: {
        pool: `0x${string}`;
        token0: `0x${string}`;
        token1: `0x${string}`;
        index: number;
        fee: number;
        feeProtocol: number;
        tickLower: number;
        tickUpper: number;
        tick: number;
        sqrtPriceX96: bigint;
    }[],
    zeroForOne: boolean
): bigint => {
    if (zeroForOne) {
        // 如果是 token0 交换 token1，那么交易完成后价格 token0 变多，价格下降下限
        // 先找到交易池的最小 tick
        const minTick =
            minBy(pools, (pool) => pool.tick)?.tick ?? TickMath.MIN_TICK;
        // 价格限制为最小 tick - 10000，避免价格过低，在实际项目中应该按照用户设置的滑点来调整
        const limitTick = Math.max(minTick - 10000, TickMath.MIN_TICK);
        return BigInt(TickMath.getSqrtRatioAtTick(limitTick).toString());
    } else {
        // 反之，设置一个最大的价格
        // 先找到交易池的最大 tick
        const maxTick =
            maxBy(pools, (pool) => pool.tick)?.tick ?? TickMath.MAX_TICK;
        // 价格限制为最大 tick + 10000，避免价格过高，在实际项目中应该按照用户设置的滑点来调整
        const limitTick = Math.min(maxTick + 10000, TickMath.MAX_TICK);
        return BigInt(TickMath.getSqrtRatioAtTick(limitTick).toString());
    }
};


// 把大整数转化为数字，支持 4 位小数
export const parseBigIntToAmount = (amount: bigint, token?: Token): number => {
    return (
        Number((amount / BigInt(10 ** ((token?.decimal || 18) - 4))).toString()) /
        10000
    );
};
// 把数字转化为大整数，支持 4 位小数
export const parseAmountToBigInt = (amount: number, token?: Token): bigint => {
    return (
        BigInt(Math.floor(amount * 10000)) *
        BigInt(10 ** ((token?.decimal || 18) - 4))
    );
};

export function isValidObject(obj: any) {
    // 如果obj不是对象或者为null，则直接返回false
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    // 获取对象的所有键
    const keys = Object.keys(obj);

    // 如果对象没有任何键，则认为它是空的，返回false
    if (keys.length === 0) {
        return false;
    }

    // 遍历对象的所有键
    for (let key of keys) {
        const value = obj[key];
        if (!value) {
            return false;
        }

        // // 如果值是对象，则递归调用isValidObject
        // if (typeof value === 'object') {
        //     if (!isValidObject(value)) {
        //         return false;
        //     }
        // }
    }

    // 如果所有检查都通过，则返回true
    return true;
}

export const parsePriceToSqrtPriceX96 = (price: number): BigInt => {
    return BigInt(encodeSqrtRatioX96(price * 1000000, 1000000).toString());
};
export const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};