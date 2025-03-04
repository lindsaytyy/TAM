// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
pragma abicoder v2;

import "./IPool.sol";

interface ISwapRouter is ISwapCallback {
    struct ExactInputParams {
        address tokenIn;
        address tokenOut;
        uint32[] indexPath;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    struct ExactOutputParams {
        address tokenIn;
        address tokenOut;
        uint32[] indexPath;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    struct QuoteExactInputParams {
        address tokenIn;
        address tokenOut;
        uint32[] indexPath;
        uint256 amountIn;
        uint160 sqrtPriceLimitX96;
    }

    struct QuoteExactOutputParams {
        address tokenIn;
        address tokenOut;
        uint32[] indexPath;
        uint256 amountOut;
        uint160 sqrtPriceLimitX96;
    }

    function exactInput(
        ExactInputParams calldata params
    ) external payable returns (uint256 amountOut);

    function exactOutput(
        ExactOutputParams calldata params
    ) external payable returns (uint256 amountIn);

    function quoteExactInput(
        QuoteExactInputParams calldata params
    ) external returns (uint256 amountOut);

    function quoteExactOutput(
        QuoteExactOutputParams calldata params
    ) external returns (uint256 amountIn);

    event Swap(
        address indexed sender,
        bool zeroForOne,
        uint256 amountIn,
        uint256 amountInRemaining,
        uint256 amountOut
    );
}
