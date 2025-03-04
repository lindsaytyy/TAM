const { ethers } = require("hardhat");
module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    // const provider = ethers.provider
    // console.log("provider", provider);

    // const network = await provider.getNetwork();
    // console.log("Connected to chain with id:", network.chainId);
    await deploy("Factory", {
        contract: "Factory",
        from: deployer,
        args: [],
        log: true
    })

}
module.exports.tags = ["all", "Factory"]