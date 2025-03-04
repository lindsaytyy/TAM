const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { TickMath, encodeSqrtRatioX96 } = require("@uniswap/v3-sdk");
let contractPoolManager, deployer;
const tokenA = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
const tokenB = "0xEcd0D12E21805803f70de03B72B1C162dB0898d9"
const tokenC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
const tokenD = "0x6B175474E89094C44Da98b954EedeAC495271d0F"

before(async () => {
    console.log("test contractPoolManager starting...");
    [deployer] = await ethers.getSigners()
    await deployments.fixture(["PoolManager", "Factory"]);
    contractPoolManager = await ethers.getContract("PoolManager", deployer)
})

describe("createAndInitializePoolIfNecessary", function () {
    it("should create and init pool correctly", async function () {
        await contractPoolManager.createAndInitializePoolIfNecessary(
            {
                token0: tokenA,
                token1: tokenB,
                fee: 3000,
                tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1)),
                tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(10000, 1)),
                sqrtPriceX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
            }
        );

        const res = await contractPoolManager.createAndInitializePoolIfNecessary(
            {
                token0: tokenC,
                token1: tokenD,
                fee: 2000,
                tickLower: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(100, 1)),
                tickUpper: TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(5000, 1)),
                sqrtPriceX96: BigInt(encodeSqrtRatioX96(200, 1).toString()),
            }
        )
        const resPairs = await contractPoolManager.getPairs()
        expect(resPairs.length).to.equal(2)
        const resPools = await contractPoolManager.getAllPools()
        expect(resPools.length).to.equal(2)
    })
})