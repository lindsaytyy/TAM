const { expect } = require("chai")
const { encodeSqrtRatioX96, TickMath } = require("@uniswap/v3-sdk")
const { ethers, deployments } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers");;
const { tickLower, tickUpper, fee, sqrtPriceX96, initBalanceValue, deadline } = require("../utils/config");

describe("SwapRouter", function () {
    async function initFn() {
        let deployer
        [deployer] = await ethers.getSigners();
        await deployments.fixture(["PoolManager", "TestTokenA", "TestTokenB", "MockLP"])

        const contractPoolManager = await ethers.getContract("PoolManager", deployer)
        await deployments.deploy("SwapRouter", {
            contract: "SwapRouter",
            from: deployer.address,
            log: true,
            args: [contractPoolManager.target]
        })
        console.log("SwapRouter deployed");
        const contractSwapRouter = await ethers.getContract("SwapRouter", deployer)
        const contractTokenA = await ethers.getContract("TestTokenA", deployer)
        const contractTokenB = await ethers.getContract("TestTokenB", deployer)
        const contractMockLP = await ethers.getContract("MockLP", deployer)
        const [token0, token1] = contractTokenA.target < contractTokenB.target ? [contractTokenA, contractTokenB] :
            [contractTokenB, contractTokenA]
        await contractPoolManager.createAndInitializePoolIfNecessary(
            {
                token0: token0.target,
                token1: token1.target,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                sqrtPriceX96: sqrtPriceX96
            }
        )
        await contractPoolManager.createAndInitializePoolIfNecessary(
            {
                token0: token0.target,
                token1: token1.target,
                fee: 10000,
                tickLower: tickLower,
                tickUpper: tickUpper,
                sqrtPriceX96: sqrtPriceX96
            }
        )
        const poolAddr1 = await contractPoolManager.getPool(
            token0.target,
            token1.target,
            0
        )
        const poolAddr2 = await contractPoolManager.getPool(
            token0.target,
            token1.target,
            1
        )
        const contractPool1 = await ethers.getContractAt("Pool", poolAddr1)
        const contractPool2 = await ethers.getContractAt("Pool", poolAddr2)
        await token0.mint(contractMockLP.target, initBalanceValue);
        await token1.mint(contractMockLP.target, initBalanceValue);
        const txMint1 = await contractMockLP.mint(
            contractMockLP.target,
            50000n * 10n ** 18n,
            poolAddr1,
            token0.target,
            token1.target
        )
        const txMint2 = await contractMockLP.mint(
            contractMockLP.target,
            50000n * 10n ** 18n,
            poolAddr2,
            token0.target,
            token1.target
        )
        await txMint1.wait()
        await txMint2.wait()
        console.log("end");

        return {
            token0,
            token1,
            contractPool1,
            contractPool2,
            deployer,
            contractSwapRouter,
            contractMockLP
        }
    }
    it("should exactInput exactOutput correct", async function () {
        const {
            token0,
            token1,
            deployer, contractSwapRouter } = await loadFixture(initFn)
        await token0.mint(deployer.address, initBalanceValue)
        expect(await token0.balanceOf(deployer.address)).to.equal(initBalanceValue)
        expect(await token1.balanceOf(deployer.address)).to.equal(0n)
        await token0.approve(contractSwapRouter.target, initBalanceValue);
        expect(await token0.allowance(deployer.address, contractSwapRouter.target)).to.equal(initBalanceValue)
        const txExactInput = await contractSwapRouter.exactInput(
            {
                tokenIn: token0,
                tokenOut: token1,
                indexPath: [0, 1],
                recipient: deployer.address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
                amountIn: 10n * 10n ** 18n,
                amountOutMinimum: 0n,
                sqrtPriceLimitX96: BigInt(encodeSqrtRatioX96(100, 1).toString())
            }
        )
        const resExactInput = await txExactInput.wait()
        // const eventName = resExactInput.logs.find(e => e.fragment.name === "Swap")
        // expect(eventName).to.not.be.undefined;

        const eventExactInput = resExactInput.logs.find(e => e.fragment && e.fragment.name === "Swap");
        if (eventExactInput) {
            console.log("exactInput:", eventExactInput.args);
        } else {
            console.log("eventExactInput event not found");
        }
        const [sender, zeroForOne, amountIn, _amountIn, amountOut] = eventExactInput.args
        expect(await token0.balanceOf(deployer.address)).to.lessThan(initBalanceValue)
        expect(await token1.balanceOf(deployer.address)).to.greaterThan(0n)
        expect(await token1.balanceOf(deployer.address)).to.equal(amountOut)


    })

    it("should exactOutput correctly", async function () {
        const {
            token0,
            token1,
            deployer, contractSwapRouter } = await loadFixture(initFn)
        await token0.mint(deployer.address, initBalanceValue)
        expect(await token0.balanceOf(deployer.address)).to.equal(initBalanceValue)
        expect(await token1.balanceOf(deployer.address)).to.equal(0n)
        await token0.approve(contractSwapRouter.target, initBalanceValue);
        expect(await token0.allowance(deployer.address, contractSwapRouter.target)).to.equal(initBalanceValue)

        const txExactOutput = await contractSwapRouter.exactOutput(
            {
                tokenIn: token0.target,
                tokenOut: token1.target,
                amountOut: 10000n * 10n ** 18n,
                amountInMaximum: 10000n * 10n ** 18n,
                indexPath: [0, 1],
                sqrtPriceLimitX96: BigInt(encodeSqrtRatioX96(100, 1).toString()),
                recipient: deployer.address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 1000),
            },
        )
        const resExactOutput = await txExactOutput.wait()
        const eventExactOutput = resExactOutput.logs.find(e => e.fragment && e.fragment.name === "Swap");
        if (eventExactOutput) {
            console.log("exactOutput", eventExactOutput.args);

        }
        const [recipient, zeroForOne, amountOut, _amountOut, amountIn] = eventExactOutput.args
        expect(await token0.balanceOf(deployer.address)).to.equal(initBalanceValue - amountIn)
        expect(await token1.balanceOf(deployer.address)).to.greaterThan(0n)
        expect(await token1.balanceOf(deployer.address)).to.equal(amountOut - _amountOut)
    })

    it("should quoteExactInput correctly", async function () {
        const {
            token0,
            token1,
            deployer, contractSwapRouter } = await loadFixture(initFn)

        const tx = await contractSwapRouter.quoteExactInput({
            tokenIn: token0.target,
            tokenOut: token1.target,
            indexPath: [0, 1],
            amountIn: 10n * 10n ** 18n,
            sqrtPriceLimitX96: BigInt(encodeSqrtRatioX96(100, 1).toString())
        });
        const res = await tx.wait()
        // 查找事件中的结果
        const swapEvent = res.logs.find(event => event.fragment && event.fragment.name === "Swap");
        if (swapEvent) {
            const { amountOut } = swapEvent.args;
            console.log("quoteExactInput Result from event:", swapEvent.args, amountOut.toString());
        } else {
            console.log("No Swap event found in transaction receipt.");
        }
    })
    it("should quoteExactOutput correctly", async function () {
        const {
            token0,
            token1,
            deployer, contractSwapRouter } = await loadFixture(initFn)
        const tx = await contractSwapRouter.quoteExactOutput({
            tokenIn: token0.target,
            tokenOut: token1.target,
            indexPath: [0, 1],
            amountOut: 10000n * 10n ** 18n,
            sqrtPriceLimitX96: BigInt(encodeSqrtRatioX96(100, 1).toString())
        });
        const res = await tx.wait()
        const swapEvent = res.logs.find(event => event.fragment && event.fragment.name === "Swap");
        if (swapEvent) {
            const { amountIn } = swapEvent.args;
            console.log("quoteExactOutput Result from event:", swapEvent.args, amountIn);
        } else {
            console.log("No Swap event found in transaction receipt.");
        }
    })
})
