const { TickMath, encodeSqrtRatioX96 } = require("@uniswap/v3-sdk");
const tickLower = TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 1));
const tickUpper = TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(40000, 1));
const fee = 3000;
const sqrtPriceX96 = BigInt(encodeSqrtRatioX96(10000, 1).toString())
const initBalanceValue = 1000000000000n * 10n ** 18n;
const deadline = BigInt(Date.now() + 3000)

module.exports = {
    tickLower,
    tickUpper,
    sqrtPriceX96,
    fee,
    initBalanceValue,
    deadline
};