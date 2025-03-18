"use client";
import React from "react";
import Image from "next/image";
import { Tabs } from "antd";
import Swap from "./components/Swap";
import ICONCANGAO from "@/public/assets/icons/cangao.png";
const tabsItems = [
  {
    key: "1",
    label: "Swap",
    children: <Swap></Swap>,
    icon: (
      <Image src={ICONCANGAO} alt="swap icon" className="custom-icons"></Image>
    ),
  },
];
const Trade: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "6%",
      }}
    >
      <Tabs defaultActiveKey="1" items={tabsItems} />
    </div>
  );
};

export default Trade;
