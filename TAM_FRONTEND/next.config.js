/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@ant-design", "antd", "rc-util", "rc-pagination", "rc-picker", "rc-input"],
    images: {
        formats: ['image/webp'],
        remotePatterns: [{
            protocol: 'https',
            hostname: '**.example.com',
        }],
    },
    experimental: {
        optimizePackageImports: [
            '@ant-design/web3',
            'antd'
        ]
    }
};

module.exports = nextConfig;