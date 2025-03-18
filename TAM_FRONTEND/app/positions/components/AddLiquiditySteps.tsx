"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, Col, Row, Input } from "antd";
import { TokenSelect, type Token } from "@ant-design/web3";
import { uniq } from "lodash-es";
import { getContractAddr } from "@/utils/contractsAddress";
import { feeList, Fee, defaultToken } from "../add/data";
import { getTokenInfo } from "@/utils/contractsAddress";
import { useReadPoolManagerGetPairs } from "@/utils/contracts";
import "../add/page.scss";
import "./AddLiquiditySteps.scss";
const FeesCard = ({ onUpdate }: { onUpdate: (data: any) => void }) => {
  const [fee, setFee] = useState<string>("");
  const clickFeeCard = (card: Fee) => {
    setFee(card.id);
    onUpdate(card.id);
  };
  return (
    <Row gutter={16}>
      {feeList.map((card) => (
        <Col key={card.id} span={4} style={{ minWidth: 200 }}>
          <Card
            title={card.title}
            variant="borderless"
            style={{
              height: "140px",
              boxShadow: "none",
            }}
            className={card.id === fee ? "active-card" : ""}
            onClick={() => clickFeeCard(card)}
          >
            {card.description}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

interface Pair {
  token0: string;
  token1: string;
}
const Tokens = ({ onUpdate }: { onUpdate: (data: any) => void }) => {
  const { data: dataPairs = [] } = useReadPoolManagerGetPairs({
    address: getContractAddr("PoolManager") as `0x${string}`,
  });
  const memoizedDataPairs = useMemo(() => {
    return dataPairs.map((pair) => ({
      token0: pair.token0,
      token1: pair.token1,
    }));
  }, [dataPairs]);

  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (memoizedDataPairs.length > 0) {
      const res = uniq(
        memoizedDataPairs
          .map((pair: Pair) => [pair.token0, pair.token1])
          .flat()
          .map((addr: string) => getTokenInfo(addr))
      );
      setTokens(res);
      setTokenIn(res[0]);
      setTokenOut(res[1]);
    }
  }, [memoizedDataPairs]);
  const [tokenIn, setTokenIn] = useState<Token>();
  const [tokenOut, setTokenOut] = useState<Token>();

  useEffect(() => {
    onUpdate({
      tokenA: tokenIn,
      tokenB: tokenOut,
    });
  }, [tokenIn, tokenOut, onUpdate]);

  const availableTokensForIn = tokens.filter((token) => {
    if (!tokenOut) return true;
    return token.symbol !== tokenOut.symbol;
  });
  const availableTokensForOut = tokens.filter((token) => {
    if (!tokenIn) return true;
    return token.symbol !== tokenIn.symbol;
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "row",
        height: "246px",
        alignItems: "center",
      }}
    >
      <TokenSelect
        allowClear={true}
        showSearch
        value={tokenIn}
        onChange={setTokenIn}
        placeholder={"Choose Token In"}
        options={availableTokensForIn}
        className="token-in"
      />
      <TokenSelect
        allowClear={true}
        showSearch
        value={tokenOut}
        onChange={setTokenOut}
        placeholder={"Choose Token Out"}
        options={availableTokensForOut}
        className="token-out"
      />
    </div>
  );
};
export const StepOne = ({ onUpdate }: { onUpdate: (data: any) => void }) => {
  const [tokens, setTokens] = useState({
    tokenA: defaultToken,
    tokenB: defaultToken,
  });
  const [fee, setFee] = useState();
  useEffect(() => {
    onUpdate({
      ...tokens,
      fee,
    });
  }, [tokens, fee, onUpdate]);

  return (
    <div className="step-one">
      <Tokens onUpdate={(_token) => setTokens(_token)}></Tokens>
      <FeesCard onUpdate={(_fee) => setFee(_fee)}></FeesCard>
    </div>
  );
};

interface PreInfoOfStepOne {
  tokenA: Token;
  tokenB: Token;
  fee: string;
}
export const StepTwo = ({
  onUpdate,
  preInfo,
}: {
  onUpdate: (data: any) => void;
  preInfo: PreInfoOfStepOne;
}) => {
  const [inputMin, setInputMin] = useState("");
  const [inputMax, setInputMax] = useState("");
  useEffect(() => {
    onUpdate({
      inputMin,
      inputMax,
    });
  }, [inputMin, inputMax, onUpdate]);
  return (
    <div className="step-two">
      <Row gutter={16}>
        <Col span={16}>
          <div className="price-info-card">
            <Card variant="borderless">
              <div>Fee tier:{preInfo?.fee}</div>
              <div>tokenA:{preInfo["tokenA"].symbol}</div>
              <div>tokenB:{preInfo["tokenB"].symbol}</div>
            </Card>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="Minimum Price" variant="borderless">
            <Input
              value={inputMin}
              placeholder="Input Minimum Price"
              className="price-card-input"
              onChange={(e) => setInputMin(e.target.value)}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Maximum Price" variant="borderless">
            <Input
              value={inputMax}
              placeholder="Input Maximum Price"
              className="price-card-input"
              onChange={(e) => setInputMax(e.target.value)}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
interface PreInfoOfStepOneTwo extends PreInfoOfStepOne {
  inputMin: string;
  inputMax: string;
}
export const StepThree = ({
  onUpdate,
  preInfo,
}: {
  onUpdate: (data: any) => void;
  preInfo: PreInfoOfStepOneTwo;
}) => {
  const [inputMintTokenA, setInputSwapIn] = useState("");
  const [inputMintTokenB, setInputSwapOut] = useState("");
  useEffect(() => {
    onUpdate({
      inputMintTokenA,
      inputMintTokenB,
    });
  }, [inputMintTokenA, inputMintTokenB, onUpdate]);
  return (
    <div className="step-three">
      <div>
        <Row gutter={16}>
          <Col span={16}>
            <div className="price-info-card">
              <Card variant="borderless">
                <div>Fee tier:{preInfo?.fee}</div>
                <div>tokenA:{preInfo["tokenA"].symbol}</div>
                <div>tokenB:{preInfo["tokenB"].symbol}</div>
                <div>
                  {preInfo?.inputMin}~{preInfo?.inputMax}
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Card variant="borderless">
              <Input
                value={inputMintTokenA}
                placeholder="input the amount of TokenA"
                className="price-card-input"
                onChange={(e) => setInputSwapIn(e.target.value)}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card variant="borderless">
              <Input
                value={inputMintTokenB}
                placeholder="input the amount of TokenB"
                className="price-card-input"
                onChange={(e) => setInputSwapOut(e.target.value)}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
