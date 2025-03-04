// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PoolManager.sol";
import "./interfaces/IPoolManager.sol";
import "./interfaces/IPositionManager.sol";
import "./interfaces/IPool.sol";

import "./libraries/LiquidityAmounts.sol";
contract PositionManager is IPositionManager, ERC721 {
    IPoolManager public insPoolManager;
    mapping(uint256 => PositionInfo) public positions;
    uint176 private _nextId = 1;
    constructor(address _addr) ERC721("PositionManager", "TAM") {
        insPoolManager = IPoolManager(_addr);
    }

    function getAllPositions()
        external
        view
        override
        returns (PositionInfo[] memory positionInfo)
    {
        //在 Solidity 中，直接访问或修改一个未初始化的动态数组元素会导致运行时错误
        positionInfo = new PositionInfo[](_nextId - 1);
        for (uint32 i; i < _nextId - 1; i++) {
            positionInfo[i] = positions[i + 1];
        }
        return positionInfo;
    }

    function mint(
        MintParams calldata params
    )
        external
        payable
        override
        returns (
            uint256 positionId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        //getPool inherit from Factory.sol
        address poolAddr = insPoolManager.getPool(
            params.token0,
            params.token1,
            params.index
        );
        IPool pool = IPool(poolAddr);
        uint160 _sqrtRatioX96 = pool.sqrtPriceX96();
        uint160 _sqrtRatioAX96 = TickMath.getSqrtPriceAtTick(pool.tickLower());
        uint160 _sqrtRatioBX96 = TickMath.getSqrtPriceAtTick(pool.tickUpper());

        liquidity = LiquidityAmounts.getLiquidityForAmounts(
            _sqrtRatioX96,
            _sqrtRatioAX96,
            _sqrtRatioBX96,
            params.amount0Desired,
            params.amount1Desired
        );
        //bytes 动态字节数组 calldata只能用于引用类型 bytes32是简单类型
        bytes memory _data = abi.encode(
            params.token0,
            params.token1,
            msg.sender,
            params.index
        );
        //mintCallback(amount0, amount1, _data) ==> transferFrom
        (amount0, amount1) = pool.mint(address(this), liquidity, _data);
        _mint(params.recipient, (positionId = _nextId++));
        (
            ,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            ,

        ) = pool.getPosition(address(this));
        positions[positionId] = PositionInfo({
            id: positionId,
            owner: params.recipient,
            token0: params.token0,
            token1: params.token1,
            index: params.index,
            fee: pool.fee(),
            liquidity: liquidity,
            tickLower: pool.tickLower(),
            tickUpper: pool.tickUpper(),
            tokensOwed0: 0,
            tokensOwed1: 0,
            feeGrowthInside0LastX128: feeGrowthInside0LastX128,
            feeGrowthInside1LastX128: feeGrowthInside1LastX128
        });
        emit Mint(positionId, params.recipient, liquidity);
    }
    event Mint(uint256 _id, address indexed _owner, uint128 _liquidity);

    /**
require(ERC721._isAuthorized(owner, address(this), _Id));
修改为： require(ERC721._isAuthorized(owner, msg.sender, _Id))
why? burn 函数通常由用户直接调用，用户需要证明自己有权操作该 NFT。
使用 msg.sender 可以确保只有 NFT 的所有者或被授权的地址可以调用 burn。
 */

    modifier _checkIfOwner(uint256 _Id) {
        address owner = ERC721.ownerOf(_Id);
        require(ERC721._isAuthorized(owner, msg.sender, _Id), "not the owner");
        _;
    }
    function burn(
        uint256 positionId
    )
        external
        override
        _checkIfOwner(positionId)
        returns (uint256 amount0, uint256 amount1)
    {
        PositionInfo storage positionInfo = positions[positionId];
        address poolAddr = insPoolManager.getPool(
            positionInfo.token0,
            positionInfo.token1,
            positionInfo.index
        );
        IPool pool = IPool(poolAddr);

        (amount0, amount1) = pool.burn(positionInfo.liquidity);
        //calculate fee; 上次提取手续费时的 feeGrowthGlobal0X128
        (
            ,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            ,

        ) = pool.getPosition(positionInfo.owner);
        positionInfo.tokensOwed0 +=
            uint128(amount0) +
            uint128(
                FullMath.mulDiv(
                    feeGrowthInside0LastX128 -
                        positionInfo.feeGrowthInside0LastX128,
                    positionInfo.liquidity,
                    FixedPoint128.Q128
                )
            );
        positionInfo.tokensOwed1 +=
            uint128(amount1) +
            uint128(
                FullMath.mulDiv(
                    feeGrowthInside1LastX128 -
                        positionInfo.feeGrowthInside1LastX128,
                    positionInfo.liquidity,
                    FixedPoint128.Q128
                )
            );
        positionInfo.feeGrowthInside0LastX128 = feeGrowthInside0LastX128;
        positionInfo.feeGrowthInside1LastX128 = feeGrowthInside1LastX128;
        positionInfo.liquidity = 0;
    }

    function collect(
        uint256 positionId,
        address recipient
    )
        external
        override
        _checkIfOwner(positionId)
        returns (uint256 amount0, uint256 amount1)
    {
        PositionInfo storage positionInfo = positions[positionId];
        address poolAddr = insPoolManager.getPool(
            positionInfo.token0,
            positionInfo.token1,
            positionInfo.index
        );
        IPool pool = IPool(poolAddr);
        (amount0, amount1) = pool.collect(
            recipient,
            positionInfo.tokensOwed0,
            positionInfo.tokensOwed1
        );
        positionInfo.tokensOwed0 = 0;
        positionInfo.tokensOwed1 = 0;
        _burn(positionId);
    }

    function mintCallback(
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external override {
        (address token0, address token1, address senderAddr, uint32 index) = abi
            .decode(data, (address, address, address, uint32));
        address poolAddr = insPoolManager.getPool(token0, token1, index);
        require(
            poolAddr == msg.sender,
            "PositionsManager:mintCallback not the right pool address"
        );
        if (amount0 > 0) {
            IERC20(token0).transferFrom(senderAddr, msg.sender, amount0);
        }
        if (amount1 > 0) {
            IERC20(token1).transferFrom(senderAddr, msg.sender, amount1);
        }
    }
}
