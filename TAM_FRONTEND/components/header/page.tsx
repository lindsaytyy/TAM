"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu } from "antd";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { menuItems } from "./config";
import "./header.scss";
function Header() {
  const router = useRouter();
  const clickMenuItem = (e: { key: string }) => {
    router.replace(`/${e.key}`);
  };
  const clickIconInHome = () => {
    router.replace(`/`);
  };

  return (
    <div className="headerStyle">
      {/* <Image
        src={"/assets/home/icon.webp"}
        alt="icon"
        className="headerStyle-iconStyle"
        width={50}
        height={50}
        onClick={clickIconInHome}
        priority
      /> */}
      <Menu items={menuItems} mode="horizontal" onClick={clickMenuItem} />
      <div>
        <ConnectButton label="connect wallet" />
      </div>
    </div>
  );
}

export default Header;
