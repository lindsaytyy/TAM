"use client";
import React, { useState, CSSProperties } from "react";
import { Button } from "antd";
import type { ConfigProviderProps } from "antd";
import "./page.scss";
type SizeType = ConfigProviderProps["componentSize"];
interface CommonButtonProps {
  children: React.ReactNode; // 用于接收按钮文本或其它嵌套内容
  onClick?: () => void; // 点击按钮时触发的回调函数，可选参数
  size?: SizeType;
  style?: CSSProperties;
  dis?: boolean;
}
const CommonButton: React.FC<CommonButtonProps> = ({
  children,
  onClick,
  size,
  style,
  dis = false,
}) => {
  //   const clickBtnFn = () => {};
  //   if (onClick) {
  //     clickBtnFn();
  //   }
  const clickBtnFn = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <div style={{ width: "100%" }}>
      <Button
        type="primary"
        style={style}
        size={size ? size : "large"}
        className="rightBox-btn"
        onClick={clickBtnFn}
        disabled={dis}
      >
        {children}
      </Button>
    </div>
  );
};
export default CommonButton;
