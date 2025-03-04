// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TamPool is ERC20 {
    address public tokenA;
    address public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;
    constructor(address _tokenA, address _tokenB) ERC20("TamPool", "pool") {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function getAmountOut(uint256 amountIn) public view returns (uint256) {
        // 通过常见的 AMM 公式计算交换比例
        return (amountIn * reserveB) / reserveA;
    }
    function swap(uint256 _amountA) external {
        uint256 _amountB = getAmountOut(_amountA);
        //Solidity 中的 uint256 类型只能处理整数，除法会丢弃小数部分
        uint256 fee = _amountB / 1000; //0.1%
        bool resA = IERC20(tokenA).transferFrom(
            msg.sender,
            address(this),
            _amountA
        );
        bool resB = IERC20(tokenB).transfer(msg.sender, (_amountB - fee));
        require(resA, "transferFrom failed");
        require(resB, "transfer failed");
        reserveA += _amountA;
        reserveB += _amountB;
    }
}
