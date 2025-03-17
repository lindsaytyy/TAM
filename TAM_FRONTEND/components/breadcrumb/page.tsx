"use client";
import React from "react";
import Image from "next/image";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ICONCHAINQUAN from "@/public/assets/icons/chaiquan.png";
import "./page.scss";
const BreadCrumb: React.FC = () => {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((i) => i);
  const pathToNameMap: { [key: string]: string } = {
    trade: "TRADE",
    pool: "VIEW POOLS",
    positions: "MY POSITIONS",
    add: "ADD LIQUIDITY",
    test: "MINT TOKEN",
  };
  const breadcrumbItems: { title: React.ReactNode }[] = [
    {
      title: (
        <Link href="/">
          <Image
            src={ICONCHAINQUAN}
            alt="home icon"
            className="custom-icons"
            priority
          ></Image>
          HOME
        </Link>
      ),
    },
  ];

  pathnames.forEach((name, index) => {
    const fullPath = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = pathToNameMap[name] || name;
    breadcrumbItems.push({
      title:
        index === pathnames.length - 1 ? (
          displayName
        ) : (
          <Link href={fullPath}>{displayName}</Link>
        ),
    });
  });

  return (
    <div className="breadcrumb-container">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};

export default BreadCrumb;
