import React from "react";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

// 定义MenuItem的类型
interface MenuItem {
    label: string;
    key: string;
    icon?: any; // 使用React.ReactNode来允许任何有效的JSX元素
    children?: MenuItem[]; // 子菜单项是可选的，并且可以递归地包含MenuItem
}

// 定义NetItem的类型
interface NetItem {
    key: string;
    label: string;
}

export const menuItems: MenuItem[] = [
    {
        label: 'TRADE',
        key: 'tradeKey',
        children: [
            { label: 'SWAP', key: 'trade' }
        ],
    },
    {
        label: 'POOL',
        key: 'poolKey',
        children: [
            { label: 'VIEW POOLS', key: 'pool' }
        ],
    },
    {
        label: "POSITIONS",
        key: "positionsKey",
        children: [
            { label: 'MY POSITIONS', key: 'positions' },
            { label: 'ADD LIQUIDITY', key: 'positions/add' },
        ],
    },
    {
        label: 'TEST',
        key: 'mint',
        children: [
            { label: 'MINT TOKEN', key: 'test' }
        ],
    },
];

export const netItems: NetItem[] = [
    {
        key: '0x1',
        label: "Ethereum Mainnet"  // Ethereum Mainnet
    },
    {
        key: '0x3',
        label: "Ropsten Testnet"  // Ethereum's Ropsten Testnet
    },
    {
        key: '0x4',
        label: "Rinkeby Testnet"  // Ethereum's Rinkeby Testnet
    },
    {
        key: '0x2a',
        label: "Kovan Testnet"  // Ethereum's Kovan Testnet
    },
    {
        key: '0x89',
        label: "Polygon (Matic) Mainnet"  // Polygon (formerly Matic) Mainnet
    },
    {
        key: '0x13882',
        label: "Amoy"  // Polygon's Mumbai Testnet
    },
    {
        key: '0x38',
        label: "Binance Smart Chain"  // Binance Smart Chain (BSC)
    },
    {
        key: '0x61',
        label: "Binance Smart Chain Testnet"  // Binance Smart Chain Testnet
    },
]