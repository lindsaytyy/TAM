"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Menu } from "antd";
import { ConnectButton, Connector } from "@ant-design/web3";
import { useRouter } from "next/navigation";
import { menuItems } from "./config";
import ICON from "@/public/assets/home/icon.webp";
import "./header.scss";
// async function connectWallet(
//   messageApi: ReturnType<typeof message.useMessage>[0]
// ) {
//   if (window.ethereum) {
//     try {
//       const provider = new BrowserProvider(window.ethereum);
//       //For a method like eth_sendTransaction, the second argument would be an array containing an object with transaction details.
//       const accounts = await provider.send("eth_requestAccounts", []);
//       const chainId = window.ethereum.chainId;
//       if (accounts.length > 0) {
//         return {
//           account: accounts[0],
//           chainId,
//         };
//       } else {
//         alert("No accounts found. Please check your wallet.");
//         return null;
//       }
//     } catch (error) {
//       console.log("error", error);
//       messageApi.open({
//         type: "error",
//         content: "Please connect your wallet",
//       });
//     }
//   }
// }
// interface WalletInfoProps {
//   info: string;
//   _chainName: string;
// }
// function WalletInfo({ info, _chainName }: WalletInfoProps) {
//   const [chainName, setChainName] = useState(_chainName);
//   const clickDropDown = (e: { key: string }) => {
//     const res = netItems.find((v) => v.key === e.key);
//     if (res) {
//       setChainName(res.label);
//     }
//   };
//   return (
//     <div className="rightBox-info">
//       <Dropdown
//         menu={{
//           items: netItems,
//           onClick: clickDropDown,
//         }}
//       >
//         <a onClick={(e) => e.preventDefault()} className="rightBox-info-drop">
//           {chainName} <DownOutlined />
//         </a>
//       </Dropdown>
//       <div className="rightBox-info-addr">
//         <span>{info}</span>
//       </div>
//     </div>
//   );
// }
function Header() {
  const [current, setCurrent] = useState<string>();
  const router = useRouter();
  const clickMenuItem = (e: { key: string }) => {
    const path = e.key === "create" ? `/pool/${e.key}` : `/${e.key}`;
    router.replace(path);
  };

  const clickIconInHome = () => {
    router.replace(`/`);
  };
  return (
    <div className="headerStyle">
      <Image
        src={ICON}
        alt="icon"
        className="headerStyle-iconStyle"
        width={50}
        height={50}
        onClick={clickIconInHome}
      />
      <Menu
        items={menuItems}
        mode="horizontal"
        onClick={clickMenuItem}
      ></Menu>
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
