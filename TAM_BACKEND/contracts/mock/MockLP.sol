// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IPool.sol";

contract MockLP is IMintCallback {
    function mintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external override {
        (address token0, address token1) = abi.decode(data, (address, address));
        if (amount0Owed > 0) {
            IERC20(token0).transfer(msg.sender, amount0Owed);
        }
        if (amount1Owed > 0) {
            IERC20(token1).transfer(msg.sender, amount1Owed);
        }
    }

    function sortToken(
        address tokenA,
        address tokenB
    ) private pure returns (address, address) {
        return tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }
    event Mint(address, uint128, address, address, address);
    function mint(
        address recipient,
        uint128 amount,
        address pool,
        address tokenA,
        address tokenB
    ) external returns (uint256 amount0, uint256 amount1) {
        emit Mint(recipient, amount, pool, tokenA, tokenB);

        (address token0, address token1) = sortToken(tokenA, tokenB);

        (amount0, amount1) = IPool(pool).mint(
            recipient,
            amount,
            abi.encode(token0, token1)
        );
    }

    function burn(
        uint128 amount,
        address pool
    ) external returns (uint256 amount0, uint256 amount1) {
        (amount0, amount1) = IPool(pool).burn(amount);
    }

    function collect(
        address recipient,
        address pool
    ) external returns (uint256 amount0, uint256 amount1) {
        (, , , uint128 tokensOwed0, uint128 tokensOwed1) = IPool(pool)
            .getPosition(address(this));
        (amount0, amount1) = IPool(pool).collect(
            recipient,
            tokensOwed0,
            tokensOwed1
        );
    }
}
