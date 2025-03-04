const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers");
const { ethers, deployments } = require("hardhat");
const { TickMath, encodeSqrtRatioX96 } = require("@uniswap/v3-sdk");

async function createAndInitPool() {
    let contractMockLP,
        contractMockSwap,
        contractTokenA,
        contractTokenB,
        contractPool,
        deployer;
    [deployer] = await ethers.getSigners();
    await deployments.fixture(["Factory", "TestTokenA", "TestTokenB", "MockLP", "MockSwap"], { fallbackToGlobal: false });
    const contractFactory = await ethers.getContract("Factory", deployer)
    contractMockLP = await ethers.getContract("MockLP", deployer)
    contractMockSwap = await ethers.getContract("MockSwap", deployer)
    contractTokenA = await ethers.getContract("TestTokenA", deployer)
    contractTokenB = await ethers.getContract("TestTokenB", deployer)
    const [token0, token1] = contractTokenA.target < contractTokenB.target
        ? [contractTokenA, contractTokenB]
        : [contractTokenB, contractTokenA];
    const tickLower = TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1));
    const tickUpper = TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(40000, 1));
    const fee = 3000;

    const factoryTx = await contractFactory.createPool(token0.target, token1.target, tickLower, tickUpper, fee);
    const factoryRes = await factoryTx.wait();
    const factoryEvent = factoryRes.logs.find(e => e.fragment.name === "PoolCreated")
    const poolAddr = factoryEvent.args[6]

    contractPool = await ethers.getContractAt("Pool", poolAddr)
    // 计算一个初始化的价格，按照 1 个 token0 换 10000 个 token1 来算，其实就是 10000
    const sqrtPriceX96 = BigInt(encodeSqrtRatioX96(10000, 1).toString());
    await contractPool.initialize(sqrtPriceX96);
    return {
        token0,
        token1,
        tickLower,
        tickUpper,
        fee,
        sqrtPriceX96,
        contractMockLP,
        contractPool,
        contractMockSwap
    }

}
describe("Pool", function () {
    it("should have correct pool info", async function () {
        const { token0, token1, tickLower, tickUpper, fee, sqrtPriceX96, contractPool } = await loadFixture(createAndInitPool);
        expect(await contractPool.token0()).to.equal(token0);
        expect(await contractPool.token1()).to.equal(token1);
        expect(await contractPool.tickLower()).to.equal(tickLower);
        expect(await contractPool.tickUpper()).to.equal(tickUpper);
        expect(await contractPool.fee()).to.equal(fee);
        expect(await contractPool.sqrtPriceX96()).to.equal(sqrtPriceX96);

    })

    it("should mint burn collect correctly", async function () {
        const { token0, token1, contractMockLP, contractPool } = await loadFixture(createAndInitPool);
        const initBalanceValue = 1000n * 10n ** 18n;
        await token0.mint(contractMockLP.target, initBalanceValue)
        await token1.mint(contractMockLP.target, initBalanceValue)
        const txMint = await contractMockLP.mint(
            contractMockLP.target,
            20000000n,
            contractPool.target,
            token0.target,
            token1.target
        )
        await txMint.wait()
        const balanceAMock = await token0.balanceOf(contractMockLP.target)
        const balanceBMock = await token1.balanceOf(contractMockLP.target)
        const balanceAPool = await token0.balanceOf(contractPool.target)
        const balanceBPool = await token1.balanceOf(contractPool.target)
        const resLiquidity = await contractPool.liquidity();
        expect(balanceAPool).to.equal(initBalanceValue - balanceAMock)
        expect(balanceBPool).to.equal(initBalanceValue - balanceBMock)
        expect(resLiquidity).to.equal(20000000n)


        const txBurn = await contractMockLP.burn(10000000n, contractPool.target);
        await txBurn.wait()
        const resLiquidityAfterBurn = await contractPool.liquidity();
        expect(resLiquidityAfterBurn).to.equal(20000000n - 10000000n)
        const resPositions = await contractPool.getPosition(contractMockLP.target)
        console.log(resPositions);
        expect(resPositions[0]).to.equal(20000000n - 10000000n)

        //collect
        const txCollect = await contractMockLP.collect(contractMockLP.target, contractPool.target)
        await txCollect.wait()
        const positions = await contractPool.positions(contractMockLP.target)
        console.log("positions", positions);
        expect(positions[3]).to.equal(0n)
        expect(positions[4]).to.equal(0n)
    })

    it("should swap correctly", async function () {
        const { token0, token1, contractMockLP, contractPool, contractMockSwap } = await loadFixture(createAndInitPool);
        const initBalanceValue = 100000000000n * 10n ** 18n;
        await token0.mint(contractMockLP.target, initBalanceValue)
        await token1.mint(contractMockLP.target, initBalanceValue)
        //
        await token0.mint(contractMockSwap.target, 300n * 10n ** 18n)
        const balanceSwap0 = await token0.balanceOf(contractMockSwap.target)
        const balanceSwap1 = await token1.balanceOf(contractMockSwap.target)
        expect(balanceSwap0).to.equal(300n * 10n ** 18n)
        expect(balanceSwap1).to.equal(0n)
        const liquidityDelta = 1000000000000000000000000000n;
        await contractMockLP.mint(
            contractMockLP.target,
            liquidityDelta,
            contractPool.target,
            token0.target,
            token1.target
        )
        const balancePool0 = await token0.balanceOf(contractPool.target);
        const balancePool1 = await token1.balanceOf(contractPool.target);
        const minPrice = 1000;
        const minSqrtPriceX96 = BigInt(
            encodeSqrtRatioX96(minPrice, 1).toString()
        );
        const txSwap = await contractMockSwap.testSwap(
            contractMockSwap.target,
            100n * 10n ** 18n,
            minSqrtPriceX96,
            contractPool.target,
            token0.target,
            token1.target,
        )
        await txSwap.wait()
        const balancePool0After = await token0.balanceOf(contractPool.target)
        const balancePool1After = await token1.balanceOf(contractPool.target)
        const balanceSwap0After = await token0.balanceOf(contractMockSwap.target)
        const balanceSwap1After = await token1.balanceOf(contractMockSwap.target)
        expect(balancePool0After - balancePool0).to.equal(balanceSwap0 - balanceSwap0After)
        expect(balanceSwap1After).to.equal(balancePool1 - balancePool1After)
        expect(await contractPool.liquidity()).to.equal(liquidityDelta)
    })

})
