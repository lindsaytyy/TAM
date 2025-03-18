"use client";
import React, { useState, useEffect } from "react";
import { Select, Input, message } from "antd";
import { useAccount } from "wagmi";
import CommonButton from "@/components/commonButton/page";
import { useWriteTestTokenMint, useWriteErc20Approve } from "@/utils/contracts";
import { getContractAddr } from "@/utils/contractsAddress";
import { isValidEthereumAddress } from "@/utils/index";
const Mint: React.FC = () => {
  const { writeContractAsync: mint } = useWriteTestTokenMint();
  const { writeContractAsync: approve } = useWriteErc20Approve();

  const [valueA, setValueA] = useState([getContractAddr("TestTokenA")]);
  const [owner, setOwner] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000000000000000000000");
  const { address } = useAccount();
  useEffect(() => {
    if (address) {
      setOwner(address as `0x${string}`);
    }
  }, [address]);

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
    <div style={{ paddingTop: "4%" }}>
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
            label: "TOKEN-A",
          },
          {
            value: getContractAddr("TestTokenB"),
            label: "TOKEN-B",
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
    </div>
  );
};
export default Mint;
