import { Metadata } from "next";
import { PropsWithChildren, memo } from "react";
import { RainBowProvider } from "@/components/web3/RainBowPage";
import { RootStyleRegistry } from "./RootStyleRegistry";
import "../styles/globals.css";
import HeaderMemo from "@/components/header/page";
import BreadCrumb from "@/components/breadcrumb/page";
export const metadata: Metadata = {
  title: {
    default: "TAM",
    template: "%s | TAM",
  },
  description: "a simple demo of web3",
  keywords: ["Next.js", "React", "TypeScript", "Web3", "Solidity"],
  authors: [
    {
      name: "LindsayTam",
    },
  ],
  creator: "LindsayTam",
  publisher: "LindsayTam",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <RootStyleRegistry>
          <RainBowProvider>
            <HeaderMemo />
            <div
              style={{
                display: "flex",
                height: "100vh",
                flexDirection: "column",
                padding: "0 40px 0 40px",
              }}
            >
            
              <BreadCrumb />
              {children}
            </div>
          </RainBowProvider>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
