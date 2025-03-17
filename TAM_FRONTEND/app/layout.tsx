import { Metadata } from "next";
import { PropsWithChildren, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { RainBowProvider } from "@/components/web3/RainBowPage";
import { RootStyleRegistry } from "./RootStyleRegistry";
import "../styles/globals.css";
import HeaderMemo from "@/components/header/page";
import BreadCrumb from "@/components/breadcrumb/page";
// const HeaderMemo = memo(HeaderLayout);
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
                position: "relative",
                display: "flex",
                height: "100vh",
                flexDirection: "column",
                padding: "0 40px 0 40px",
                //         background: `linear-gradient(rgba(255, 255, 255, 0.9) 30%, rgba(255, 255, 255, 0.5)),
                // url("/assets/home/homepage.webp") no-repeat center center`,
                backgroundSize: "cover",
              }}
            >
              {/* <Image
                src="/assets/home/homepage.webp"
                alt="Picture of the author"
                fill
                style={{
                  objectFit: "cover",
                  zIndex: -1,
                  position: "absolute",
                }}
                priority
              /> */}
              <BreadCrumb />
              {children}
            </div>
          </RainBowProvider>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
