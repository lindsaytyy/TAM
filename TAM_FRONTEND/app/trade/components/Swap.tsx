"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Flex, message } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import {
  CryptoInput,
  type CryptoInputProps,
  type Token,
  useAccount,
} from "@ant-design/web3";
import Decimal from "decimal.js";
import { debounce } from "lodash-es";
import { usePublicClient, useChainId } from "wagmi";
import {
  ensureTokenOrder,
  useTokenAddressInAvailableChains,
  computeSqrtPriceLimitX96,
  parseBigIntToAmount,
  parseAmountToBigInt,
} from "@/utils/index";
import { SUPPORTED_CHAINS } from "@/utils/wagmiClientRpc";
import {
  Pools,
  defaultToken,
  SwapParams,
  SwapState,
  QuoteParamsIn,
  QuoteParamsOut,
} from "../interfaces";
import { useSwapData, useSwapQuote, useSwap } from "../hooks/useSwapData";
import CommonButton from "@/components/commonButton/page";
const Swap: React.FC = () => {
  const [pairs, setPairs] = useState<Token[]>([]);
  const [swapState, setSwapState] = useState<SwapState>({
    input: { ...defaultToken },
    output: { ...defaultToken },
    loading: false,
  });
  const addressA =
    useTokenAddressInAvailableChains(swapState.input?.token) || "0x00";
  const addressB =
    useTokenAddressInAvailableChains(swapState.output?.token) || "0x00";
  const zeroForOne = addressA < addressB; //false
  const { token0, token1 } = ensureTokenOrder(addressA, addressB);
  const [disabledSwap, setDisabledSwap] = useState<boolean>(true);
  const [isExactInput, setIsExactInput] = useState(true);
  /**
   * get token pairs
   */
  const { memoPairs, memoPools } = useSwapData();
  useEffect(() => {
    if (memoPairs.length === 0) return;
    setPairs(memoPairs);
    setSwapState(() => {
      return {
        input: { amount: BigInt(0), inputString: "0", token: memoPairs[1] },
        output: { amount: BigInt(0), inputString: "0", token: memoPairs[0] },
        loading: false,
      };
    });
  }, [memoPairs]);

  const availableTokensForB = useMemo(
    () =>
      pairs.filter((token) => token.symbol !== swapState.input?.token?.symbol),
    [pairs, swapState.input?.token?.symbol]
  );
  const availableTokensForA = useMemo(
    () =>
      pairs.filter((token) => {
        if (!swapState.output?.token) return true;
        return token.symbol !== swapState.output.token.symbol;
      }),
    [pairs, swapState.output?.token]
  );

  /**
   * get pools and calculate
   */

  const swapPools = memoPools.filter((pool: Pools) => {
    return (
      pool.token0 === token0 && pool.token1 === token1 && pool.liquidity > 0
    );
  });
  // 计算本次交易的价格限制
  const sqrtPriceLimitX96 = useMemo(
    () => computeSqrtPriceLimitX96(swapPools, zeroForOne),
    [swapPools, zeroForOne]
  );

  const swapIndexPath: number[] = useMemo(
    () =>
      swapPools
        .sort((a, b) => {
          if (a.tick !== b.tick) {
            if (zeroForOne) {
              // token0 交换 token1 时，tick 越大意味着 token0 价格越高，所以要把 tick 大的放前面
              return b.tick > a.tick ? 1 : -1;
            }
            return a.tick > b.tick ? 1 : -1;
          }
          return a.fee - b.fee;
        })
        .map((pool) => pool.index),
    [swapPools, zeroForOne]
  );

  /**
   * simulateContract
   */
  const { getQuote } = useSwapQuote();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const fetchAmountB = useRef(
    debounce(async (params: QuoteParamsIn[]) => {
      try {
        const res = await getQuote("quoteExactInput", params);
        setSwapState((prev) => ({
          ...prev,
          output: {
            amount: res,
            inputString: parseBigIntToAmount(
              res,
              prev.output?.token
            ).toString(),
            token: prev.output?.token,
          },
          loading: false,
        }));
      } catch (error) {
        console.log("error in fetchAmountB", error);
      }
    }, 300)
  ).current;
  const fetchAmountA = useRef(
    debounce(async (params: QuoteParamsOut[]) => {
      try {
        const res = await getQuote("quoteExactOutput", params);
        setSwapState((prev) => ({
          ...prev,
          input: {
            amount: res,
            inputString: parseBigIntToAmount(res, prev.input?.token).toString(),
            token: prev.input?.token,
          },
          loading: false,
        }));
      } catch (error) {
        console.log("error in fetchAmountA", error);
      }
    }, 300)
  ).current;

  const handleQuote = useCallback(
    async (
      _addressA: `0x${string}`,
      _addressB: `0x${string}`,
      _swapIndexPath: number[]
    ) => {
      const basicParams = {
        tokenIn: _addressA,
        tokenOut: _addressB,
        sqrtPriceLimitX96,
        indexPath: _swapIndexPath,
      };
      try {
        if (isExactInput) {
          if (
            swapState.input?.inputString &&
            swapState.input?.inputString !== "0"
          ) {
            await fetchAmountB([
              {
                ...basicParams,
                amountIn: swapState.input?.amount || BigInt(100000),
              },
            ]);
          } else if (
            swapState.input &&
            swapState.input?.inputString == undefined
          ) {
            setSwapState((prev) => ({
              ...prev,
              output: {
                amount: BigInt(0),
                inputString: "0",
                token: prev.output?.token,
              },
            }));
          }
        } else {
          if (
            swapState.output?.inputString &&
            swapState.output?.inputString !== "0"
          ) {
            await fetchAmountA([
              {
                ...basicParams,
                amountOut: swapState.output?.amount || BigInt(100000),
              },
            ]);
          } else if (
            swapState.output &&
            swapState.output?.inputString == undefined
          ) {
            setSwapState((prev) => ({
              ...prev,
              input: {
                amount: BigInt(0),
                inputString: "0",
                token: prev.input?.token,
              },
            }));
          }
        }
      } catch (error) {
        console.error("Error during quote handling:", error);
      }
    },
    [
      isExactInput,
      swapState.input,
      swapState.output,
      sqrtPriceLimitX96,
      fetchAmountA,
      fetchAmountB,
    ]
  );
  useEffect(() => {
    if (
      !publicClient ||
      !chainId ||
      !addressA ||
      !addressB ||
      addressA == "0x00" ||
      addressB == "0x00"
    )
      return;
    if (!SUPPORTED_CHAINS.some((c) => c.id === chainId)) {
      console.error("不支持的链:", chainId);
      return;
    }
    if (swapIndexPath.length == 0) return message.warning("no available pool");
    handleQuote(addressA, addressB, swapIndexPath);
  }, [handleQuote, addressA, addressB, swapIndexPath, publicClient, chainId]);
  /**
   *
   * */
  const [tokenBalances, setTokenBalances] = useState<
    CryptoInputProps["balance"][]
  >([]);
  const clickSwapIcon = async () => {
    setIsExactInput((prev) => !prev);
    setSwapState((prev) => ({
      input: prev.output,
      output: prev.input,
      loading: false,
    }));
    setTokenBalances((prev) => [prev[1], prev[0]]);
  };

  /**
   * ==============writeQuoteExactInput
   */
  const { getSwap } = useSwap();
  const { account } = useAccount();
  const swapTokenB = useCallback(
    async (args: SwapParams) => {
      await getSwap("writeExactInput", {
        ...args,
        amountIn: swapState.input?.amount as bigint,
        amountOutMinimum: BigInt(0),
      });
    },
    [getSwap, swapState.input?.amount]
  );

  const swapTokenA = useCallback(
    async (args: SwapParams) => {
      await getSwap("writeExactOutput", {
        ...args,
        amountOut: parseAmountToBigInt(Number(swapState.output?.inputString)),
        amountInMaximum: parseAmountToBigInt(
          Math.ceil(Number(swapState.output?.inputString)),
          swapState.output?.token
        ),
      });
    },
    [getSwap, swapState.output]
  );

  const handleSwap = useCallback(async () => {
    if (!account?.address) return message.warning("Please connect wallet");
    if (swapIndexPath.length === 0) return message.warning("No available pool");
    setSwapState((prev) => ({ ...prev, loading: true }));
    try {
      const baseParams = {
        tokenIn: addressA,
        tokenOut: addressB,
        indexPath: swapIndexPath,
        recipient: account.address as `0x${string}`,
        sqrtPriceLimitX96,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
      };

      if (isExactInput) {
        await swapTokenB(baseParams);
      } else {
        await swapTokenA(baseParams);
      }
      message.success("Swap completed!");
    } catch (error) {
      console.error("Swap error:", error);
      message.error(error instanceof Error ? error.message : "Swap failed");
    } finally {
      setSwapState((prev) => ({ ...prev, loading: false }));
    }
  }, [
    account?.address,
    addressA,
    addressB,
    isExactInput,
    swapIndexPath,
    sqrtPriceLimitX96,
    swapTokenA,
    swapTokenB,
  ]);

  /**
     * 
    template
     */

  const handleQueryCrypto = async (cryptoIndex: number, token?: Token) => {
    const newTokenBalances = [...tokenBalances];
    if (!token) {
      newTokenBalances[cryptoIndex] = undefined;
      return setTokenBalances(newTokenBalances);
    }

    setTimeout(() => {
      newTokenBalances[cryptoIndex] = {
        amount: BigInt(
          new Decimal(1000).times(Decimal.pow(10, token.decimal)).toFixed()
        ),
        unit: "$",
        price: token.name.includes("USD") ? 0.99 : 3984.57,
      };

      setTokenBalances(newTokenBalances);
    }, 500);
  };

  const handleChangeCryptoA = (crypto: CryptoInputProps["value"]) => {
    setSwapState((prev) => ({
      ...prev,
      input: crypto,
    }));
    if (crypto?.inputString) {
      setDisabledSwap(false);
      setIsExactInput(true);
    }
    if (crypto?.token?.symbol !== swapState.input?.token?.symbol) {
      handleQueryCrypto(0, crypto?.token);
    }
  };

  const handleChangeCryptoB = (crypto: CryptoInputProps["value"]) => {
    setSwapState((prev) => ({
      ...prev,
      output: crypto,
    }));
    if (crypto?.inputString) {
      setDisabledSwap(false);
      setIsExactInput(false);
    }
    if (crypto?.token?.symbol !== swapState.output?.token?.symbol) {
      handleQueryCrypto(1, crypto?.token);
    }
  };

  const validateInputs = useCallback(() => {
    const { input, output } = swapState;
    const validInput = Number(input?.inputString) > 0;
    const validOutput = Number(output?.inputString) > 0;
    const validTokens = input?.token && output?.token;
    return validTokens && (isExactInput ? validInput : validOutput);
  }, [swapState, isExactInput]);

  useEffect(() => {
    setDisabledSwap(!validateInputs());
  }, [validateInputs]);
  return (
    <Flex vertical align="center" style={{ width: 456 }} gap={16}>
      <CryptoInput
        header={"Sell"}
        value={swapState.input}
        balance={tokenBalances[0]}
        onChange={(crypto) => handleChangeCryptoA(crypto)}
        options={availableTokensForA}
      />
      <span
        style={{
          width: 30,
          height: 30,
          background: "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          marginBlock: -24,
          zIndex: 2,
          textAlign: "center",
          cursor: "pointer",
          boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        }}
        onClick={clickSwapIcon}
      >
        <SwapOutlined
          style={{
            fontSize: 18,
            transform: "rotate(90deg)",
            marginBlockStart: 6,
          }}
        />
      </span>
      <CryptoInput
        header={"Buy"}
        value={swapState.output}
        balance={tokenBalances[1]}
        onChange={(crypto) => handleChangeCryptoB(crypto)}
        options={availableTokensForB}
      />
      <CommonButton
        style={{ width: "100%" }}
        onClick={handleSwap}
        dis={disabledSwap}
      >
        {swapState.loading ? "Processing..." : "Swap"}
      </CommonButton>
    </Flex>
  );
};
export default Swap;
