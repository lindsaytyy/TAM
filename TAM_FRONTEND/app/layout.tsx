"use client";
import { PropsWithChildren } from "react";
import dynamic from "next/dynamic";
import {
  MetaMask,
  OkxWallet,
  TokenPocket,
  WagmiWeb3ConfigProvider,
  WalletConnect,
  Hardhat,
  Mainnet,
  Sepolia,
} from "@ant-design/web3-wagmi";
import { useAccount, http } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import BreadCrumb from "@/components/breadcrumb/page";
import { RootStyleRegistry } from "./RootStyleRegistry";
import "@/styles/globals.css";
import "@/styles/variables.css";
const HeaderLayout = dynamic(() => import("@/components/header/page"), {
  ssr: false,
});
export default function RootLayout({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <html>
      <head>
        <title>TAM</title>
      </head>
      <body>
        <WagmiWeb3ConfigProvider
          eip6963={{
            autoAddInjectedWallets: true,
          }}
          chains={[Sepolia, Hardhat]}
          transports={{
            [Hardhat.id]: http("http://127.0.0.1:8545"),
            [Sepolia.id]: http("https://api.zan.top/public/eth-sepolia"),
          }}
          ens
          wallets={[
            MetaMask(),
            WalletConnect(),
            TokenPocket({
              group: "Popular",
            }),
            OkxWallet(),
          ]}
          queryClient={queryClient}
        >
          <RootStyleRegistry>
            <HeaderLayout />
            <div className="app-content-container">
              <BreadCrumb></BreadCrumb>
              {children}
            </div>
          </RootStyleRegistry>
        </WagmiWeb3ConfigProvider>
      </body>
    </html>
  );
}
