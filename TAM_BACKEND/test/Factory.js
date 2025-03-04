const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");
let contractFactory, deployer;
before(async () => {
    [deployer] = await ethers.getSigners()
    await deployments.fixture(["Factory"])
    contractFactory = await ethers.getContract("Factory", deployer)
})
describe("createPool", function () {
    it("should create pool correctly", async function () {
        const tokenA = "0xEcd0D12E21805803f70de03B72B1C162dB0898d9";
        const tokenB = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
        const tickLower = 1;
        const tickUpper = 100000;
        const fee = 3000;

        const tx = await contractFactory.createPool(tokenA, tokenB, tickLower, tickUpper, fee);
        const receipt = await tx.wait();
        const eventName = receipt.logs.find(e => e.fragment.name === "PoolCreated")
        expect(eventName).to.not.be.undefined;

        const [params1, params2] = eventName.args
        expect(params1).to.equal(tokenB)
        expect(params2).to.equal(tokenA)


    })
})

describe("getPool", function () {
    it("should get pool address correctly", async function () {
        it("should get pool address correctly", async function () {
            await expect(contractFactory.getPool("0x00", "0x00", 1))
                .to.be.revertedWith("Factory: identical address");
        });
    })
})