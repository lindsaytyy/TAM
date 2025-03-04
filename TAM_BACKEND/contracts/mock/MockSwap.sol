// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPool.sol";

contract MockSwap is ISwapCallback {
    //会被 Pool 合约调用
    function swapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        (address token0, address token1) = abi.decode(data, (address, address));
        if (amount0Delta > 0) {
            IERC20(token0).transfer(msg.sender, uint(amount0Delta));
        }
        if (amount1Delta > 0) {
            IERC20(token1).transfer(msg.sender, uint(amount1Delta));
        }
    }

    function testSwap(
        address recipient,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        address pool,
        address token0,
        address token1
    ) external returns (int256 amount0, int256 amount1) {
        (amount0, amount1) = IPool(pool).swap(
            recipient,
            true,
            amountSpecified,
            sqrtPriceLimitX96,
            abi.encode(token0, token1)
        );
    }
}
