module.exports = async ({
    deployments, getNamedAccounts
}) => {
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    await deploy("MockSwap", {
        contract: "MockSwap",
        args: [],
        from: deployer,
        log: true
    })
}
module.exports.tags = ["all", "MockSwap"]