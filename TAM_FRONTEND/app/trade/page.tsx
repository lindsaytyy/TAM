"use client";
import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Tabs } from "antd";
import Swap from "./components/Swap";
import ICONCANGAO from "@/public/assets/icons/cangao.png";
const Send = dynamic(() => import("./components/Send"), {
  ssr: true,
});
const Buy = dynamic(() => import("./components/Buy"), {
  ssr: true,
});
const tabsItems = [
  {
    key: "1",
    label: "Swap",
    children: <Swap></Swap>,
    icon: (
      <Image src={ICONCANGAO} alt="swap icon" className="custom-icons"></Image>
    ),
  },
  {
    key: "2",
    label: "Send",
    children: <Send></Send>,
  },
  {
    key: "3",
    label: "Buy",
    children: <Buy></Buy>,
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
