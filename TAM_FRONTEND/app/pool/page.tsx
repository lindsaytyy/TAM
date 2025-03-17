"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReadPoolManagerGetAllPools,
  useWritePoolManagerCreateAndInitializePoolIfNecessary,
} from "@/utils/contracts";
import { initialPoolsColumns } from "./utils/data";
import { getContractAddr } from "@/utils/contractsAddress";
import InitPool from "./components/InitPool";
import CommonButton from "@/components/commonButton/page";
import MyPositionsTable from "@/components/table/page";
import "./page.scss";
import { message } from "antd";

const Pools: React.FC = () => {
  const { writeContractAsync: writeCreateAndInit } =
    useWritePoolManagerCreateAndInitializePoolIfNecessary();
  const router = useRouter();
  const handleInit = () => {
    setOpenInit(true);
  };
  const { data = [], refetch } = useReadPoolManagerGetAllPools({
    address: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  });
  const formatData = data.map((v) => {
    return {
      key: v.index,
      index: v.index,
      pool: v.pool,
      fee: v.fee,
    };
  });
  refetch();
  const columnsWithRender = useMemo(
    () =>
      (initialPoolsColumns ?? []).map((col) => ({
        ...col,
        render:
          col.key === "pool" ? (text: string) => <a>{text}</a> : undefined,
      })),
    []
  );
  const [openInit, setOpenInit] = useState(false);
  return (
    <div className="pool-container">
      <InitPool
        openInit={openInit}
        cancelInit={() => setOpenInit(false)}
        handleInit={async (createParams) => {
          await writeCreateAndInit({
            address: getContractAddr("PoolManager") as `0x${string}`,
            args: [createParams],
          });
          setOpenInit(false);
          message.success("create and init pool success");
        }}
      ></InitPool>
      <div className="create-div">
        <CommonButton onClick={handleInit}>INIT POOL</CommonButton>
      </div>
      <MyPositionsTable
        poolData={formatData}
        initialColumns={columnsWithRender}
      />
    </div>
  );
};
export default Pools;
