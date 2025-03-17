import { uniq, debounce } from "lodash-es";
import { usePublicClient, useChainId } from "wagmi";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  useWriteSwapRouterExactInput,
  useWriteSwapRouterExactOutput,
  useReadPoolManagerGetPairs,
  useReadPoolManagerGetAllPools,
  useWriteErc20Approve,
  swapRouterAbi,
} from "@/utils/contracts";
import { getContractAddr, getTokenInfo } from "@/utils/contractsAddress";
import { SUPPORTED_CHAINS, getRpcUrl } from "@/utils/wagmiClientRpc";
import { Pools, Pair } from "../interfaces";
export const useSwapData = () => {
  const { data: dataPairs = [] } = useReadPoolManagerGetPairs({
    address: getContractAddr("PoolManager") as `0x${string}`,
  });
  const { data: dataPools = [] } = useReadPoolManagerGetAllPools({
    address: getContractAddr("PoolManager") as `0x${string}`,
  });

  return useMemo(
    () => ({
      memoPairs: uniq(
        dataPairs
          .map((pair: Pair) => [pair.token0, pair.token1])
          .flat()
          .map(getTokenInfo)
      ),
      memoPools: dataPools,
    }),
    [dataPairs, dataPools]
  );
};
export const useSwapQuote = () => {
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const getQuote = useCallback(
    async (functionName: "quoteExactInput" | "quoteExactOutput", args: any) => {
      if (
        !publicClient ||
        !chainId ||
        !SUPPORTED_CHAINS.some((c) => c.id === chainId)
      ) {
        throw new Error("Unsupported network");
      }
      try {
        const { result } = await publicClient.simulateContract({
          address: getContractAddr("SwapRouter") as `0x${string}`,
          abi: swapRouterAbi,
          functionName,
          args,
        });
        return result;
      } catch (error) {
        console.error(`Quote error (${functionName}):`, error);
        throw error;
      }
    },
    [publicClient, chainId]
  );
  return { getQuote };
};

export const useSwap = () => {
  const { writeContractAsync: writeApprove } = useWriteErc20Approve();
  const { writeContractAsync: writeExactInput } =
    useWriteSwapRouterExactInput();
  const { writeContractAsync: writeExactOutput } =
    useWriteSwapRouterExactOutput();

  const getSwap = useCallback(
    async (functionName: "writeExactInput" | "writeExactOutput", args: any) => {
      try {
        await writeApprove({
          address: args.tokenIn as `0x${string}`,
          args: [
            getContractAddr("SwapRouter") as `0x${string}`,
            functionName === "writeExactInput"
              ? args.amountIn
              : args.amountOut,
          ],
        });
      } catch (error) {
        console.error('Approve error ("SwapRouter")', error);
        throw error;
      }
      try {
        const fnName =
          functionName === "writeExactInput"
            ? writeExactInput
            : writeExactOutput;
        await fnName({
          address: getContractAddr("SwapRouter") as `0x${string}`,
          args: [args],
        });
      } catch (error) {
        console.error('Swap error ("SwapRouter")', error);
        throw error;
      }
    },
    [writeExactInput, writeExactOutput, writeApprove]
  );
  return { getSwap };
};
