"use client";
import React, { useState, useMemo } from "react";
import { message } from "antd";
import {
  useReadPoolManagerGetAllPools,
  useWritePoolManagerCreateAndInitializePoolIfNecessary,
} from "@/utils/contracts";
import { initialPoolsColumns } from "./utils/data";
import { getContractAddr } from "@/utils/contractsAddress";
import InitPool from "./components/InitPool";
import CommonButton from "@/components/commonButton/page";
import MyPositionsTable from "@/components/table/page";

const Pools: React.FC = () => {
  const { writeContractAsync: writeCreateAndInit } =
    useWritePoolManagerCreateAndInitializePoolIfNecessary();
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
    <div style={{ padding: "4vh 10px 0 10px" }}>
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
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          marginBottom: "10px",
        }}
      >
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
