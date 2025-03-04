// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IPool.sol";

contract SwapRouter is ISwapRouter {
    IPoolManager public insPoolManager;
    constructor(address _addr) {
        insPoolManager = IPoolManager(_addr);
    }

    /// @dev Parses a revert reason that should contain the numeric quote
    function parseRevertReason(
        bytes memory reason
    ) private pure returns (int256, int256) {
        if (reason.length != 64) {
            if (reason.length < 68) revert("Unexpected error");
            assembly {
                reason := add(reason, 0x04)
            }
            revert(abi.decode(reason, (string)));
        }
        return abi.decode(reason, (int256, int256));
    }
    function swapInPool(
        IPool pool,
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1) {
        try
            pool.swap(
                recipient,
                zeroForOne,
                amountSpecified,
                sqrtPriceLimitX96,
                data
            )
        returns (int256 _amount0, int256 _amount1) {
            return (_amount0, _amount1);
        } catch (bytes memory reason) {
            return parseRevertReason(reason);
        }
    }
    function exactInput(
        ExactInputParams calldata params
    ) external payable override returns (uint256 amountOut) {
        uint256 _amountIn = params.amountIn;
        bool zeroForOne = params.tokenIn < params.tokenOut;
        for (uint32 i; i < params.indexPath.length; i++) {
            address poolAddr = insPoolManager.getPool(
                params.tokenIn,
                params.tokenOut,
                params.indexPath[i]
            );
            require(
                poolAddr != address(0),
                "SWapRouter:exactInput poolAddr cannot be address zero "
            );
            IPool pool = IPool(poolAddr);

            // 构造 swapCallback 函数需要的参数
            bytes memory data = abi.encode(
                params.tokenIn,
                params.tokenOut,
                params.indexPath[i],
                params.recipient == address(0) ? address(0) : msg.sender
            );
            (int256 amount0, int256 amount1) = this.swapInPool(
                pool,
                params.recipient,
                zeroForOne,
                int256(_amountIn),
                params.sqrtPriceLimitX96,
                data
            );
            if (zeroForOne) {
                _amountIn -= uint256(amount0);
                amountOut += uint256(-amount1);
            } else {
                _amountIn -= uint256(amount1);
                amountOut += uint256(-amount0);
            }
            if (_amountIn == 0) {
                break;
            }
        }
        require(amountOut >= params.amountOutMinimum, "slippage exceeded");
        emit Swap(
            msg.sender,
            zeroForOne,
            params.amountIn,
            _amountIn,
            amountOut
        );
        return amountOut;
    }

    function exactOutput(
        ExactOutputParams calldata params
    ) external payable override returns (uint256 amountIn) {
        uint256 _amountOut = params.amountOut;
        bool zeroForOne = params.tokenIn < params.tokenOut;
        for (uint32 i; i < params.indexPath.length; i++) {
            address poolAddr = insPoolManager.getPool(
                params.tokenIn,
                params.tokenOut,
                params.indexPath[i]
            );
            require(
                poolAddr != address(0),
                "SWapRouter:exactInput poolAddr cannot be address zero"
            );
            IPool pool = IPool(poolAddr);
            bytes memory _data = abi.encode(
                params.tokenIn,
                params.tokenOut,
                params.indexPath[i],
                params.recipient == address(0) ? address(0) : msg.sender
            );
            (int256 amount0, int256 amount1) = this.swapInPool(
                pool,
                params.recipient,
                zeroForOne,
                -int256(_amountOut),
                params.sqrtPriceLimitX96,
                _data
            );
            /**
              // 更新 amountOut 和 amountIn
            _amountOut -= uint256(zeroForOne ? -amount1 : -amount0);
            amountIn += uint256(zeroForOne ? amount0 : amount1);
             */
            if (zeroForOne) {
                _amountOut -= uint256(-amount1);
                amountIn += uint256(amount0);
            } else {
                amountIn += uint256(amount1);
                _amountOut -= uint256(-amount0);
            }

            if (_amountOut == 0) {
                break;
            }
        }
        require(amountIn <= params.amountInMaximum, "slippage exceeded");
        emit Swap(
            params.recipient,
            zeroForOne,
            params.amountOut,
            _amountOut,
            amountIn
        );
        return amountIn;
    }

    function quoteExactInput(
        QuoteExactInputParams calldata params
    ) external override returns (uint256 amountOut) {
        return
            this.exactInput(
                ExactInputParams({
                    tokenIn: params.tokenIn,
                    tokenOut: params.tokenOut,
                    indexPath: params.indexPath,
                    recipient: address(0),
                    deadline: block.timestamp + 1 hours,
                    amountIn: params.amountIn,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: params.sqrtPriceLimitX96
                })
            );
    }

    function quoteExactOutput(
        QuoteExactOutputParams calldata params
    ) external override returns (uint256 amountIn) {
        return
            this.exactOutput(
                ExactOutputParams({
                    tokenIn: params.tokenIn,
                    tokenOut: params.tokenOut,
                    indexPath: params.indexPath,
                    recipient: address(0),
                    deadline: block.timestamp + 1 hours,
                    amountOut: params.amountOut,
                    amountInMaximum: type(uint256).max,
                    sqrtPriceLimitX96: params.sqrtPriceLimitX96
                })
            );
    }

    function swapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        (
            address tokenIn,
            address tokenOut,
            uint32 index,
            address recipient
        ) = abi.decode(data, (address, address, uint32, address));
        address poolAddr = insPoolManager.getPool(tokenIn, tokenOut, index);
        require(
            msg.sender == poolAddr,
            "SWapRouter:swapCallback msg.sender not equal to pool address"
        );
        uint256 amountToTrans = amount0Delta > 0
            ? uint256(amount0Delta)
            : uint256(amount1Delta);
        if (recipient == address(0)) {
            assembly {
                let ptr := mload(0x40)
                mstore(ptr, amount0Delta)
                mstore(add(ptr, 0x20), amount1Delta)
                revert(ptr, 64)
            }
        }
        /**
            前端页面是确定了addressA就是需要放入池子的 addressB是需要换出的，所以这里确定是tokenIn
             */
        if (amountToTrans > 0) {
            IERC20(tokenIn).transferFrom(
                recipient,
                poolAddr,
                uint256(amountToTrans)
            );
        }
    }
}
