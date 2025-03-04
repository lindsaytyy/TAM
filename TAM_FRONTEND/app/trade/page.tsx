"use client";
import React from "react";
import Image from "next/image";
import { Tabs } from "antd";
import Swap from "./components/Swap";
import Send from "./components/Swap";
import Buy from "./components/Buy";
import ICONCANGAO from "@/public/assets/icons/cangao.png";
import ICONCANGSHU from "@/public/assets/icons/cangshu.png";
import ICONHASHIQI from "@/public/assets/icons/hashiqi.png";
import "./page.scss";

const tabsItems = [
  {
    key: "1",
    label: "Swap",
    children: <Swap></Swap>,
    icon: <Image src={ICONCANGAO} alt="" className="custom-icons"></Image>,
  },
  {
    key: "2",
    label: "Send",
    children: <Send></Send>,
    icon: <Image src={ICONCANGSHU} alt="" className="custom-icons"></Image>,
  },
  {
    key: "3",
    label: "Buy",
    children: <Buy></Buy>,
    icon: <Image src={ICONHASHIQI} alt="" className="custom-icons"></Image>,
  },
];
const Trade: React.FC = () => {
  return (
    <div className="trade-container">
      <Tabs defaultActiveKey="1" items={tabsItems} />
    </div>
  );
};

export default Trade;
