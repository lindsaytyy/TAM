module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    // 部署第一个 TestToken 实例（Token A）
    await deploy("TestTokenA", {
        contract: "TestToken",
        args: ["Token A", "TKA"],
        log: true,
        from: deployer,
    });

    // 部署第二个 TestToken 实例（Token B）
    await deploy("TestTokenB", {
        contract: "TestToken",
        args: ["Token B", "TKB"],
        log: true,
        from: deployer,
    });

    // 部署 MockLP 合约
    await deploy("MockLP", {
        contract: "MockLP",
        args: [],
        log: true,
        from: deployer,
    });
};

module.exports.tags = ["TestTokenA", "TestTokenB", "MockLP", "all"];