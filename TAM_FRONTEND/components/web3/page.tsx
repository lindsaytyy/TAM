"use client"
import { PropsWithChildren } from "react";
import {
  MetaMask,
  OkxWallet,
  TokenPocket,
  WalletConnect,
  Hardhat,
  Sepolia,
  WagmiWeb3ConfigProvider,
} from "@ant-design/web3-wagmi";
import { QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";
import dynamic from "next/dynamic";
const Web3ProviderComponent = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient();
  return (
    <WagmiWeb3ConfigProvider
      eip6963={{
        autoAddInjectedWallets: true,
      }}
      chains={[Sepolia, Hardhat]}
      transports={{
        [Hardhat.id]: http(process.env.NEXT_PUBLIC_RPC_URL_HARDHAT), 
        [Sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA),
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
      {children}
    </WagmiWeb3ConfigProvider>
  );
};

export const WithWeb3 = dynamic(() => Promise.resolve(Web3ProviderComponent), {
  ssr: false,
});
