require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("hardhat-deploy-ethers");
require("@openzeppelin/hardhat-upgrades");
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },

  },
  networks: {
    // hardhat: {
    //   forking: {
    //     url: `https://eth-mainnet.g.alchemy.com/v2/YnoZlMwsc4LQZQOiwqaNDqbGe7UTdX9f`,  // 或者使用 Infura URL
    //     blockNumber: 13000000,  // 可选：指定一个特定的区块号进行fork
    //   },
    // },
    // 其他网络配置
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: {
      sepolia: "KCW7972PFN6BTCF1BECD2BAHGPRK447Z25"
    }
  }
}
