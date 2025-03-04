"use client";
import React, { use, useState, useEffect, useMemo } from "react";
import { Select, Input, message } from "antd";
import { useAccount } from "@ant-design/web3";
import CommonButton from "@/components/commonButton/page";
import { useWriteTestTokenMint, useWriteErc20Approve } from "@/utils/contracts";
import { getContractAddr } from "@/utils/contractsAddress";
import { isValidEthereumAddress } from "@/utils/index";
import "./page.scss";

const Mint: React.FC = () => {
  const { writeContractAsync: mint } = useWriteTestTokenMint();
  const { writeContractAsync: approve } = useWriteErc20Approve();

  const [valueA, setValueA] = useState([getContractAddr("TestTokenA")]);
  const [owner, setOwner] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000000000000000000000");
  const { account } = useAccount();
  useEffect(() => {
    if (account?.address) {
      setOwner(account?.address as `0x${string}`);
    }
  }, [account]);

  const handleMint = async () => {
    if (!isValidEthereumAddress(owner))
      return message.warning("Invalid recipient address");
    for (let i = 0; i < valueA.length; i++) {
      await mint({
        address: valueA[i] as `0x${string}`,
        args: [owner as `0x${string}`, BigInt(Number(amount))],
      });
      message.success(`mint ${valueA[i]} success`);
    }
    await handleApprove();
  };
  const handleApprove = async () => {
    for (let i = 0; i < valueA.length; i++) {
      await approve({
        address: valueA[i] as `0x${string}`,
        args: [
          getContractAddr("PositionManager") as `0x${string}`,
          BigInt(Number(amount)),
        ],
      });
      message.success(`approve ${valueA[i]} success`);
    }
  };

  return (
    <div className="test-container">
      <Select
        mode="multiple"
        allowClear
        value={valueA}
        defaultValue={valueA}
        style={{ width: 250, marginRight: 8 }}
        onChange={(value) => setValueA(value)}
        options={[
          {
            value: getContractAddr("TestTokenA"),
            label: "TOKENA",
          },
          {
            value: getContractAddr("TestTokenB"),
            label: "TOKENB",
          },
        ]}
      />

      <div style={{ marginTop: 20 }}>
        <Input
          style={{ width: 250 }}
          placeholder="recipient address"
          value={owner}
          onChange={(e) => setOwner(e.target.value as `0x${string}`)}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <Input
          style={{ width: 250 }}
          placeholder="mint amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <CommonButton
          onClick={handleMint}
          size="small"
          dis={valueA.length === 0}
        >
          MINT
        </CommonButton>
      </div>
      {/* <div style={{ marginTop: 20 }}>
        <CommonButton
          onClick={handleApprove}
          size="small"
          dis={valueA.length === 0}
        >
          APPROVE
        </CommonButton>
      </div> */}
    </div>
  );
};
export default Mint;
