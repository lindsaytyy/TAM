import { PropsWithChildren, useEffect } from "react";
import dynamic from "next/dynamic";
// import BreadCrumb from "@/components/breadcrumb/page";
import { WithWeb3 } from "@/components/web3/page";
import { RootStyleRegistry } from "./RootStyleRegistry";
import "../styles/globals.css";
import "./layout.scss";
const HeaderLayout = dynamic(() => import("@/components/header/page"), {
  ssr: false,
});
const BreadCrumb = dynamic(() => import("@/components/breadcrumb/page"), {
  ssr: false,
});
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <title>TAM</title>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA} />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA}
        />
        <link rel="preload" href="/assets/home/homepage.webp" as="image"></link>
      </head>
      <body>
        <RootStyleRegistry>
          <WithWeb3>
            {" "}
            <HeaderLayout />
          </WithWeb3>
          <div className="app-content-container">
            <BreadCrumb></BreadCrumb>
            <WithWeb3>{children}</WithWeb3>
          </div>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
