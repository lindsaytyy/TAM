const { expect } = require("chai");
const { ethers, deployments } = require("hardhat")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers");;
const { tickLower, tickUpper, fee, sqrtPriceX96, initBalanceValue, deadline } = require("../utils/config");
describe("PositionManager", function () {
    async function initFn() {
        const [deployer] = await ethers.getSigners();
        await deployments.fixture(["PoolManager", "TestTokenA", "TestTokenB"]);
        const contractTokenA = await ethers.getContract("TestTokenA", deployer)
        const contractTokenB = await ethers.getContract("TestTokenB", deployer)
        const [token0, token1] = contractTokenA.target < contractTokenB.target
            ? [contractTokenA, contractTokenB]
            : [contractTokenB, contractTokenA];
        const contractPoolManager = await ethers.getContract("PoolManager", deployer);
        await deployments.deploy("PositionManager", {
            from: deployer.address,
            args: [contractPoolManager.target], // 如果有多个参数，可以传入数组
            log: true,
        });
        const contractPositions = await ethers.getContract("PositionManager", deployer);
        const txPositions = await contractPoolManager.createAndInitializePoolIfNecessary(
            {
                token0,
                token1,
                fee,
                tickLower,
                tickUpper,
                sqrtPriceX96,
            }
        )
        const resPositions = await txPositions.wait()
        const eventPositions = resPositions.logs.find(e => e.fragment.name === "PoolCreated")
        const poolAddr = eventPositions.args[6]
        const contractPool = await ethers.getContractAt("Pool", poolAddr)

        return {
            contractPool,
            contractPoolManager,
            contractPositions,
            token0,
            token1,
            deployer
        }
    }
    it("should mint burn collect correctly in PositionManager", async function () {
        const { contractPool, contractPositions, deployer, token0, token1 } = await loadFixture(initFn)
        await token0.mint(deployer.address, initBalanceValue)
        await token1.mint(deployer.address, initBalanceValue)
        expect(await token0.balanceOf(deployer.address)).to.equal(initBalanceValue)
        expect(await token1.balanceOf(deployer.address)).to.equal(initBalanceValue)
        await token0.approve(contractPositions.target, initBalanceValue);
        await token1.approve(contractPositions.target, initBalanceValue);

        await contractPositions.mint(
            {
                token0: token0.target,
                token1: token1.target,
                index: 0,
                amount0Desired: initBalanceValue,
                amount1Desired: initBalanceValue,
                recipient: deployer.address,
                deadline: deadline
            }
        )
        const resMint = await contractPositions.positions(1)
        expect(resMint[1]).to.equal(deployer.address)
        const balancePool0 = await token0.balanceOf(contractPool.target)
        const balanceDeployer0 = await token0.balanceOf(deployer.address)
        console.log("balancePool0", balancePool0, balanceDeployer0);

        const [, secondDeployer] = await ethers.getSigners()
        // expect(await contractPositions.connect(secondDeployer).burn(1)).to.revertedWith("not the owner")
        await contractPositions.connect(deployer).burn(1)
        const resBurn = await contractPositions.positions(1)
        expect(resBurn[6]).to.equal(0n);


        await contractPositions.collect(1, deployer.address)
        const resCollect = await contractPositions.positions(1)
        expect(resCollect[9]).to.equal(0n)
        expect(resCollect[10]).to.equal(0n)

    })



})