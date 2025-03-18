"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button, message, Steps, theme } from "antd";
import { useAccount } from "wagmi";
import CommonButton from "@/components/commonButton/page";
import { useWritePositionManagerMint } from "@/utils/contracts";
import { getContractAddr } from "@/utils/contractsAddress";
import { isValidObject } from "@/utils/index";
import { defaultToken } from "../utils/data";
import { StepOne } from "../components/AddLiquiditySteps";
const StepTwo = dynamic(
  () => import("../components/AddLiquiditySteps").then((mod) => mod.StepTwo),
  { ssr: false }
);
const StepThree = dynamic(
  () => import("../components/AddLiquiditySteps").then((mod) => mod.StepThree),
  { ssr: false }
);
import "./page.scss";

const Create: React.FC = () => {
  const { token } = theme.useToken();
  const contentStyle: React.CSSProperties = useMemo(
    () => ({
      lineHeight: "260px",
      textAlign: "center",
      color: token.colorTextTertiary,
      backgroundColor: token.colorFillAlter,
      borderRadius: token.borderRadiusLG,
      border: `1px dashed ${token.colorBorder}`,
      marginTop: 16,
    }),
    [token]
  );
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const { writeContractAsync: writePositionManagerMint } =
    useWritePositionManagerMint();
  const { address } = useAccount();

  const [formData, setFormData] = useState<FormData>({
    1: {
      fee: "0",
      tokenA: defaultToken,
      tokenB: defaultToken,
    },
    2: {
      inputMin: "0",
      inputMax: "0",
    },
    3: {
      inputMintTokenA: "0",
      inputMintTokenB: "0",
    },
  });
  const handleMint = async () => {
    if (address === undefined) {
      message.error("Please connect wallet first");
      return;
    }
    try {
      const { tokenA, tokenB } = formData[1];
      const { inputMintTokenA, inputMintTokenB } = formData[3];
      await writePositionManagerMint({
        address: getContractAddr("PositionManager") as `0x${string}`,
        args: [
          {
            token0: tokenA.availableChains[0].contract as `0x${string}`,
            token1: tokenB.availableChains[0].contract as `0x${string}`,
            index: 0,
            amount0Desired: BigInt(inputMintTokenA),
            amount1Desired: BigInt(inputMintTokenB),
            recipient: address as `0x${string}`,
            deadline: BigInt(Date.now() + 100000),
          },
        ],
      });
      message.success("Liquidity added successfully");
    } catch (error) {
      console.error("Add liquidity error:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to add liquidity"
      );
    }
  };
  interface FormData {
    [key: number]: any;
  }

  const getButtonState = (step: number) => {
    const stepData = formData[step + 1];
    return !isValidObject(stepData);
  };

  const buttonStates = {
    nextBtn: getButtonState(0),
    stepTwoBtn: getButtonState(1),
    createBtn: getButtonState(2),
  };

  const handleStepUpdate = (stepKey: number, data: any) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };
  const steps = useMemo(
    () => [
      {
        title: "Step1",
        description: "Select token pair and fees",
        content: (
          <StepOne
            onUpdate={(data: any) => handleStepUpdate(1, data)}
          ></StepOne>
        ),
      },
      {
        title: "Step2",
        description: "Set price range",
        content: (
          <StepTwo
            onUpdate={(data: any) => handleStepUpdate(2, data)}
            preInfo={formData[1]}
          ></StepTwo>
        ),
      },
      {
        title: "Step3",
        description: "Enter deposit amounts",
        content: (
          <StepThree
            onUpdate={(data: any) => handleStepUpdate(3, data)}
            preInfo={{ ...formData[1], ...formData[2] }}
          ></StepThree>
        ),
      },
    ],
    [formData]
  );
  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
    description: item.description,
  }));
  return (
    <div className="create-container">
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        {current < steps.length - 1 && (
          <CommonButton
            onClick={() => next()}
            dis={current ? buttonStates.stepTwoBtn : buttonStates.nextBtn}
          >
            Next
          </CommonButton>
        )}
        {current === steps.length - 1 && (
          <div>
            <CommonButton onClick={handleMint} dis={buttonStates.createBtn}>
              {" "}
              MINT LIQUIDITY
            </CommonButton>
          </div>
        )}
        {current > 0 && (
          <Button
            size="large"
            style={{ margin: "0 8px" }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
      </div>
    </div>
  );
};

export default Create;
