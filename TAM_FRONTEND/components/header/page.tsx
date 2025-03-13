"use client";
import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { menuItems } from "./config";
import "./header.scss";

const Menu = dynamic(() => import("antd").then((mod) => mod.Menu), {
  ssr: false,
});
const ConnectButton = dynamic(
  () =>
    import("@ant-design/web3").then((mod) => ({
      default: mod.ConnectButton,
    })),
  {
    ssr: false,
  }
);
const Connector = dynamic(
  () => import("@ant-design/web3").then((mod) => mod.Connector),
  { ssr: false }
);

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
      <Image
        src={"/assets/home/icon.webp"}
        alt="icon"
        className="headerStyle-iconStyle"
        width={50}
        height={50}
        onClick={clickIconInHome}
        priority
      />
      <Menu items={menuItems} mode="horizontal" onClick={clickMenuItem} />
      <div>
        <Connector>
          <ConnectButton
            quickConnect
            type="text"
            size="large"
            className="rightBox-btn"
          />
        </Connector>
      </div>
    </div>
  );
}

export default Header;
