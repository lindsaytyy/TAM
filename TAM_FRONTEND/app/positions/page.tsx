"use client";
import React, { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MyPositionsTable, { RenderTypeInColumn } from "@/components/table/page";
import CommonButton from "@/components/commonButton/page";
import { initialMyPositionsColumns } from "./utils/data";
import {
  useReadPositionManagerGetAllPositions,
  useWritePositionManagerBurn,
  useWritePositionManagerCollect,
} from "@/utils/contracts";
import { getContractAddr } from "@/utils/contractsAddress";

import "./page.scss";
import { message } from "antd";

const PositionsPage: React.FC = () => {
  const column = useMemo(
    () => [
      ...initialMyPositionsColumns,
      {
        title: "Action",
        key: "operation",
        fixed: "right",
        width: 180,
        renderType: RenderTypeInColumn.LINK,
        actions: [
          {
            label: "COLLECT",
            onClick: handleCollect,
          },
          {
            label: "BURN",
            onClick: handleBurn,
          },
        ],
      },
    ],
    []
  );
  const { writeContractAsync: writeCollect } = useWritePositionManagerCollect();
  async function handleCollect(record: any) {
    await writeCollect({
      address: getContractAddr("PositionManager") as `0x${string}`,
      args: [record.id, record.owner],
    });
    refetchTableData();
    message.success("collect success");
  }
  const { writeContractAsync: writeBurn } = useWritePositionManagerBurn();
  async function handleBurn(record: any) {
    await writeBurn({
      address: getContractAddr("PositionManager") as `0x${string}`,
      args: [record.id],
    });
    refetchTableData();
    message.success("burn success");
  }
  const { data = [] as any, refetch: refetchTableData } =
    useReadPositionManagerGetAllPositions({
      address: getContractAddr("PositionManager") as `0x${string}`,
    });
  const poolData = data.map((v: any) => {
    return {
      ...v,
      key: v.index,
      liquidity: v.liquidity.toString(),
      tokensOwed0: v.tokensOwed0.toString(),
      tokensOwed1: v.tokensOwed1.toString(),
    };
  });
  const router = useRouter();
  const handleCreate = () => {
    router.push("/pool/create");
  };
  return (
    <div className="positions-container">
      <div className="create-div">
        <CommonButton onClick={handleCreate}>CREATE POSITIONS</CommonButton>
      </div>
      <MyPositionsTable poolData={poolData} initialColumns={column} />
    </div>
  );
};
export default PositionsPage;
