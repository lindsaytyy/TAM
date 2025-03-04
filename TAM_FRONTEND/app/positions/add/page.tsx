"use client";
import React, { useState, useEffect } from "react";
import { Button, message, Steps, theme } from "antd";
import { useAccount } from "@ant-design/web3";
import CommonButton from "@/components/commonButton/page";
import { useWritePositionManagerMint } from "@/utils/contracts";
import { getContractAddr } from "@/utils/contractsAddress";
import { isValidObject } from "@/utils/index";
import { defaultToken } from "./data";
import { StepOne, StepTwo, StepThree } from "../components/AddLiquiditySteps";
import "./page.scss";

const Create: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };
  const { token } = theme.useToken();
  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const { writeContractAsync: writePositionManagerMint } =
    useWritePositionManagerMint();
  const { account } = useAccount();
  const handleMint = async () => {
    if (account?.address === undefined) {
      message.error("Please connect wallet first");
      return;
    }
    try {
      await writePositionManagerMint({
        address: getContractAddr("PositionManager") as `0x${string}`,
        args: [
          {
            token0: formData[1]?.tokenA?.availableChains[0]
              .contract as `0x${string}`,
            token1: formData[1]?.tokenB?.availableChains[0]
              .contract as `0x${string}`,
            index: 0,
            amount0Desired: BigInt(formData[3].inputMintTokenA),
            amount1Desired: BigInt(formData[3].inputMintTokenB),
            recipient: account?.address as `0x${string}`,
            deadline: BigInt(Date.now() + 100000),
          },
        ],
      });
      message.success("add liquidity success");
    } catch (error) {
      console.log("erroe in adding", error);
    }
  };

  const [formData, setFormData] = useState({
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

  //isValidObject
  const [disNextBtn, setDisNextBtn] = useState(true);
  const [disStepTwoBtn, setDisStepTwoBtn] = useState(true);
  const [disCreateBtn, setDisCreateBtn] = useState(true);
  useEffect(() => {
    if (current === 0) {
      isValidObject(formData[1]) ? setDisNextBtn(false) : setDisNextBtn(true);
    } else if (current === 1) {
      isValidObject(formData[2])
        ? setDisStepTwoBtn(false)
        : setDisStepTwoBtn(true);
    } else {
      isValidObject(formData[3])
        ? setDisCreateBtn(false)
        : setDisCreateBtn(true);
    }
  }, [formData]);
  const handleStepUpdate = (stepKey: number, data: any) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };
  const steps = [
    {
      title: "Step1",
      description: "Select token pair and fees",
      content: (
        <StepOne onUpdate={(data: any) => handleStepUpdate(1, data)}></StepOne>
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
  ];
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
            dis={current ? disStepTwoBtn : disNextBtn}
          >
            Next
          </CommonButton>
        )}
        {current === steps.length - 1 && (
          <div>
            <CommonButton onClick={handleMint} dis={disCreateBtn}>
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
