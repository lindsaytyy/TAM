// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
pragma abicoder v2;

import "./interfaces/IPoolManager.sol";
import "./Factory.sol";

contract PoolManager is Factory, IPoolManager {
    //if u set pairs with "public" there will be an automatic getter function
    //but for dynamic array, better build a function to return it
    Pair[] private pairs;
    uint256 private pairsLength;

    function getPairs() external view override returns (Pair[] memory) {
        return pairs;
    }
    //memory 定义的数组需要提前分配好内存
    function getAllPools()
        external
        view
        override
        returns (PoolInfo[] memory poolsInfo)
    {
        uint32 initLength = 0;
        if (pairsLength == 0) {
            return new PoolInfo[](0);
        }
        for (uint32 i = 0; i < pairsLength; i++) {
            initLength += uint32(
                pools[pairs[i].token0][pairs[i].token1].length
            );
        }

        // 再填充数据
        poolsInfo = new PoolInfo[](initLength);
        uint256 poolsIndex;
        for (uint32 i; i < pairsLength; i++) {
            address[] memory _pool = pools[pairs[i].token0][pairs[i].token1];
            uint256 _length = _pool.length;
            for (uint32 j; j < _length; j++) {
                IPool res = IPool(_pool[j]);
                poolsInfo[poolsIndex] = PoolInfo({
                    pool: _pool[j],
                    token0: res.token0(),
                    token1: res.token1(),
                    index: j,
                    fee: res.fee(),
                    tickLower: res.tickLower(),
                    tickUpper: res.tickUpper(),
                    tick: res.tick(),
                    sqrtPriceX96: res.sqrtPriceX96(),
                    feeProtocol: 0,
                    liquidity: res.liquidity()
                });
                poolsIndex++;
            }
        }
    }

    function createAndInitializePoolIfNecessary(
        CreateAndInitializeParams calldata params
    ) external payable override returns (address pool) {
        require(
            params.token0 < params.token1,
            "token0 must be less than token1"
        );
        pool = this.createPool(
            params.token0,
            params.token1,
            params.tickLower,
            params.tickUpper,
            params.fee
        );
        IPool res = IPool(pool);
        if (res.sqrtPriceX96() == 0) {
            res.initialize(params.sqrtPriceX96);
            uint256 isNewToken = pools[res.token0()][res.token1()].length;
            //createPool中就已经pools[token0][token1].push(poolAddr);所以这里isNewToken不能用0判断
            if (isNewToken == 1) {
                pairs.push(
                    Pair({token0: params.token0, token1: params.token1})
                );
                pairsLength = pairs.length;
            }
        }
    }
}
