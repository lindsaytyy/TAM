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
import { uniq, debounce } from "lodash-es";
import { usePublicClient } from "wagmi";
import { getContractAddr, getTokenInfo } from "@/utils/contractsAddress";
import {
  useWriteSwapRouterExactInput,
  useWriteSwapRouterExactOutput,
  useReadPoolManagerGetPairs,
  useReadPoolManagerGetAllPools,
  useWriteErc20Approve,
  swapRouterAbi,
} from "@/utils/contracts";
import {
  ensureTokenOrder,
  getTokenAddressInAvailableChains,
  computeSqrtPriceLimitX96,
  parseBigIntToAmount,
  parseAmountToBigInt,
} from "@/utils/index";
import { Pools, Pair, defaultToken, SwapParams } from "../interfaces";
import CommonButton from "@/components/commonButton/page";
import "../page.scss";
const Swap: React.FC = () => {
  const [pairs, setPairs] = useState<Token[]>([]);
  const [cryptoA, setCryptoA] = useState<CryptoInputProps["value"]>({
    ...defaultToken,
  });
  const [cryptoB, setCryptoB] = useState<CryptoInputProps["value"]>({
    ...defaultToken,
  });
  const addressA = getTokenAddressInAvailableChains(cryptoA?.token) || "0x00";
  const addressB = getTokenAddressInAvailableChains(cryptoB?.token) || "0x00";
  const zeroForOne = addressA < addressB; //false
  const { token0, token1 } = ensureTokenOrder(addressA, addressB);
  const [disabledSwap, setDisabledSwap] = useState<boolean>(true);
  const [isExactInput, setIsExactInput] = useState(true);
  /**
   * get token pairs
   */
  const { data: dataPairs = [] } = useReadPoolManagerGetPairs({
    address: getContractAddr("PoolManager") as `0x${string}`,
  });
  const memoizedDataPairs = useMemo(() => {
    return dataPairs.map((pair) => ({
      token0: pair.token0,
      token1: pair.token1,
    }));
  }, [dataPairs]);
  useEffect(() => {
    if (memoizedDataPairs.length !== 0) {
      const res = uniq(
        memoizedDataPairs
          .map((pair: Pair) => [pair.token0, pair.token1])
          .flat()
          .map((addr: string) => getTokenInfo(addr))
      );
      setPairs(res);
      setCryptoA({
        amount: BigInt(0),
        inputString: "0",
        token: res[1],
      });
      setCryptoB({
        amount: BigInt(0),
        inputString: "0",
        token: res[0],
      });
    }
  }, [memoizedDataPairs]);

  const availableTokensForB = useMemo(
    () => pairs.filter((token) => token.symbol !== cryptoA?.token?.symbol),
    [pairs, cryptoA?.token?.symbol]
  );
  const availableTokensForA = pairs.filter((token) => {
    if (!cryptoB?.token) return true;
    return token.symbol !== cryptoB.token.symbol;
  });
  /**
   * get pools and calculate
   */

  const { data: dataPools = [] } = useReadPoolManagerGetAllPools({
    address: getContractAddr("PoolManager") as `0x${string}`,
  });
  const swapPools = dataPools.filter((pool: Pools) => {
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
  const publicClient = usePublicClient();
  const fetchAmountB = useRef(
    debounce(async (params: SwapParams) => {
      const {
        _addressA,
        _addressB,
        _cryptoA,
        _swapIndexPath,
        _sqrtPriceLimitX96,
      } = params;
      try {
        const res = (await publicClient?.simulateContract({
          address: getContractAddr("SwapRouter") as `0x${string}`,
          abi: swapRouterAbi,
          functionName: "quoteExactInput",
          args: [
            {
              tokenIn: _addressA,
              tokenOut: _addressB,
              indexPath: _swapIndexPath,
              amountIn: _cryptoA?.amount || BigInt(100000),
              sqrtPriceLimitX96: _sqrtPriceLimitX96 as bigint,
            },
          ],
        })) || {
          result: BigInt(0),
        };
        setCryptoB((prev) => ({
          amount: res.result,
          inputString: parseBigIntToAmount(res.result, prev?.token).toString(),
          token: prev?.token,
        }));
      } catch (error) {
        console.log("error in fetchAmountB", error);
      }
    }, 300)
  ).current;
  const fetchAmountA = useRef(
    debounce(async (params: SwapParams) => {
      const {
        _addressA,
        _addressB,
        _cryptoB,
        _swapIndexPath,
        _sqrtPriceLimitX96,
      } = params;
      try {
        const res = (await publicClient?.simulateContract({
          address: getContractAddr("SwapRouter") as `0x${string}`,
          abi: swapRouterAbi,
          functionName: "quoteExactOutput",
          args: [
            {
              tokenIn: _addressA,
              tokenOut: _addressB,
              indexPath: _swapIndexPath,
              amountOut: _cryptoB?.amount || BigInt(100000),
              sqrtPriceLimitX96: _sqrtPriceLimitX96 as bigint,
            },
          ],
        })) || {
          result: BigInt(0),
        };
        setCryptoA((prev) => ({
          amount: res.result,
          inputString: parseBigIntToAmount(res.result, prev?.token).toString(),
          token: prev?.token,
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
      try {
        if (isExactInput) {
          if (cryptoA?.inputString && cryptoA?.inputString !== "0") {
            await fetchAmountB({
              _addressA,
              _addressB,
              _cryptoA: cryptoA,
              _swapIndexPath,
              _sqrtPriceLimitX96: sqrtPriceLimitX96,
            });
          } else if (cryptoA && cryptoA?.inputString == undefined) {
            setCryptoB({
              amount: BigInt(0),
              inputString: "0",
              token: cryptoB?.token,
            });
          }
        } else {
          if (cryptoB?.inputString && cryptoB?.inputString !== "0") {
            await fetchAmountA({
              _addressA,
              _addressB,
              _cryptoB: cryptoB,
              _swapIndexPath,
              _sqrtPriceLimitX96: sqrtPriceLimitX96,
            });
          } else if (cryptoB && cryptoB?.inputString == undefined) {
            setCryptoA({
              amount: BigInt(0),
              inputString: "0",
              token: cryptoA?.token,
            });
          }
        }
      } catch (error) {
        console.error("Error during quote handling:", error);
      }
    },
    [isExactInput, cryptoA, cryptoB, sqrtPriceLimitX96]
  );
  useEffect(() => {
    if (
      !publicClient ||
      !addressA ||
      !addressB ||
      addressA == "0x00" ||
      addressB == "0x00"
    )
      return;
    if (swapIndexPath.length == 0) return message.warning("no available pool");
    handleQuote(addressA, addressB, swapIndexPath);
  }, [handleQuote, addressA, addressB, swapIndexPath, publicClient]);
  /**
   *
   * */
  const [tokenBalances, setTokenBalances] = useState<
    CryptoInputProps["balance"][]
  >([]);
  const clickSwapIcon = useCallback(async () => {
    setIsExactInput((prev) => !prev);
    setCryptoA((prevA) => ({ ...prevA, ...cryptoB }));
    setCryptoB((prevB) => ({ ...prevB, ...cryptoA }));
    setTokenBalances((prev) => [prev[1], prev[0]]); // 函数式更新
  }, [cryptoA, cryptoB]);

  /**
   * ==============writeQuoteExactInput
   */
  const { account } = useAccount();
  const { writeContractAsync: writeApprove } = useWriteErc20Approve();
  const { writeContractAsync: writeQuoteExactInput } =
    useWriteSwapRouterExactInput();
  const { writeContractAsync: writeQuoteExactOutput } =
    useWriteSwapRouterExactOutput();
  const swapTokenB = useCallback(
    async ({
      _addressA,
      _cryptoA,
      _addressB,
      _swapIndexPath,
      _account,
    }: SwapParams) => {
      await writeApprove({
        address: _addressA,
        args: [
          getContractAddr("SwapRouter") as `0x${string}`,
          _cryptoA?.amount as bigint,
        ],
      });
      await writeQuoteExactInput({
        address: getContractAddr("SwapRouter") as `0x${string}`,
        args: [
          {
            tokenIn: _addressA,
            tokenOut: _addressB,
            indexPath: _swapIndexPath,
            recipient: _account as `0x${string}`,
            amountIn: _cryptoA?.amount as bigint,
            amountOutMinimum: BigInt(0),
            sqrtPriceLimitX96,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
          },
        ],
      });
    },
    [sqrtPriceLimitX96, writeApprove, writeQuoteExactInput]
  );

  const swapTokenA = useCallback(
    async ({
      _addressA,
      _cryptoB,
      _cryptoA,
      _addressB,
      _swapIndexPath,
      _account,
    }: SwapParams) => {
      await writeApprove({
        address: _addressA,
        args: [
          getContractAddr("SwapRouter") as `0x${string}`,
          parseAmountToBigInt(
            Math.ceil(Number(_cryptoA?.inputString)),
            _cryptoB?.token
          ),
        ],
      });
      await writeQuoteExactOutput({
        address: getContractAddr("SwapRouter") as `0x${string}`,
        args: [
          {
            tokenIn: _addressA,
            tokenOut: _addressB,
            indexPath: _swapIndexPath,
            recipient: _account as `0x${string}`,
            amountOut: parseAmountToBigInt(Number(_cryptoB?.inputString)),
            amountInMaximum: parseAmountToBigInt(
              Math.ceil(Number(_cryptoB?.inputString)),
              _cryptoB?.token
            ),
            sqrtPriceLimitX96,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
          },
        ],
      });
    },
    [sqrtPriceLimitX96, writeApprove, writeQuoteExactOutput]
  );

  const handleSwap = useCallback(async () => {
    if (swapIndexPath.length == 0) return message.warning("no available pool");
    if (!account?.address)
      return message.warning("please connect to wallet first");
    if (isExactInput && cryptoA?.inputString) {
      await swapTokenB({
        _addressA: addressA,
        _cryptoA: cryptoA,
        _addressB: addressB,
        _swapIndexPath: swapIndexPath,
        _account: account?.address as `0x${string}`,
      });
    } else if (isExactInput === false && cryptoB?.inputString) {
      await swapTokenA({
        _addressA: addressA,
        _cryptoA: cryptoA,
        _cryptoB: cryptoB,
        _addressB: addressB,
        _swapIndexPath: swapIndexPath,
        _account: account?.address as `0x${string}`,
      });
    }
  }, [
    swapIndexPath,
    account,
    addressA,
    addressB,
    cryptoA,
    cryptoB,
    isExactInput,
    swapTokenA,
    swapTokenB,
  ]);

  /**
     * 
    template
     */

  const handleQueryCrypto = async (crptoIndex: number, token?: Token) => {
    const newTokenBalances = [...tokenBalances];
    if (!token) {
      newTokenBalances[crptoIndex] = undefined;
      return setTokenBalances(newTokenBalances);
    }

    setTimeout(() => {
      newTokenBalances[crptoIndex] = {
        amount: BigInt(
          new Decimal(1000).times(Decimal.pow(10, token.decimal)).toFixed()
        ),
        unit: "$",
        price: token.name.includes("USD") ? 0.99 : 3984.57,
      };

      setTokenBalances(newTokenBalances);
    }, 500);
  };

  const handleChangeCryptoA = useRef((crypto: CryptoInputProps["value"]) => {
    setCryptoA(crypto);
    if (crypto?.inputString) {
      setDisabledSwap(false);
      setIsExactInput(true);
    }
    if (crypto?.token?.symbol !== cryptoA?.token?.symbol) {
      handleQueryCrypto(0, crypto?.token);
    }
  }).current;

  const handleChangeCryptoB = useRef((crypto: CryptoInputProps["value"]) => {
    setCryptoB(crypto);
    if (crypto?.inputString) {
      setDisabledSwap(false);
      setIsExactInput(false);
    }
    if (crypto?.token?.symbol !== cryptoB?.token?.symbol) {
      handleQueryCrypto(1, crypto?.token);
    }
  }).current;
  return (
    <Flex vertical align="center" style={{ width: 456 }} gap={16}>
      <CryptoInput
        header={"Sell"}
        value={cryptoA}
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
        value={cryptoB}
        balance={tokenBalances[1]}
        onChange={(crypto) => handleChangeCryptoB(crypto)}
        options={availableTokensForB}
      />
      <CommonButton
        style={{ width: "100%" }}
        onClick={handleSwap}
        dis={disabledSwap}
      >
        Swap
      </CommonButton>
    </Flex>
  );
};
export default Swap;
