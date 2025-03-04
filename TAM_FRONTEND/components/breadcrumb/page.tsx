"use client";
import React from "react";
import Image from "next/image";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 使用新的导航钩子
import ICONCHAINQUAN from "@/public/assets/icons/chaiquan.png";
import "./page.scss";
const BreadCrumb: React.FC = () => {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((i) => i); // 过滤掉空字符串
  const pathToNameMap: { [key: string]: string } = {
    trade: "TRADE",
    pool: "VIEW POOLS",
    positions: "MY POSITIONS",
    add: "ADD LIQUIDITY",
    test: "MINT TOKEN",
  };

  // 构建面包屑项
  const breadcrumbItems: { title: React.ReactNode }[] = [
    {
      title: (
        <Link href="/">
          <Image src={ICONCHAINQUAN} alt="" className="custom-icons"></Image>
          HOME
        </Link>
      ), // 添加图标和文本
    },
  ];

  // 遍历路径片段并构建面包屑
  pathnames.forEach((name, index) => {
    const fullPath = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = pathToNameMap[name] || name; // 使用映射名称或默认名称
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
