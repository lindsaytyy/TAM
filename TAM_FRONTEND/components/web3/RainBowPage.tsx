"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { PropsWithChildren } from "react";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "d28107c2b0fcb1f3213227469d6fb9cf",
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});
export const RainBowProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
