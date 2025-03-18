/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@ant-design", "antd", "rc-util", "rc-pagination", "rc-picker", "rc-input"],
    images: {
        formats: ['image/webp'],
    },
    experimental: {
        optimizePackageImports: [
            '@ant-design/web3',
            'antd'
        ]
    },
};

module.exports = withBundleAnalyzer(nextConfig);;