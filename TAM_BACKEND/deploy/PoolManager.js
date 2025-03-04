module.exports = async ({
    deployments, getNamedAccounts
}) => {
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    const addrPoolManager = await deploy("PoolManager", {
        contract: "PoolManager",
        from: deployer,
        log: true,
        args: [],
        gasLimit: 8000000,
    })

    const resSwapRouter = await deploy("SwapRouter", {
        contract: "SwapRouter",
        from: deployer,
        args: [addrPoolManager.address]
    })
    console.log("SwapRouter deployed to:", resSwapRouter.address);

    const resPositionManager = await deploy("PositionManager", {
        contract: "PositionManager",
        from: deployer,
        args: [addrPoolManager.address]
    })
    console.log("PositionManager deployed to:", resPositionManager.address);


}
module.exports.tags = ["PoolManager"]