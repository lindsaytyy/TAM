// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "./libraries/SqrtPriceMath.sol";
import "./libraries/TickMath.sol";
import "./libraries/LiquidityMath.sol";
import "./libraries/LowGasSafeMath.sol";
import "./libraries/SafeCast.sol";
import "./libraries/TransferHelper.sol";
import "./libraries/SwapMath.sol";
import "./libraries/FixedPoint128.sol";

import "./interfaces/IPool.sol";
import "./interfaces/IFactory.sol";
contract Pool is IPool {
    using LowGasSafeMath for uint256;

    address public immutable override factory;
    address public immutable override token0;
    address public immutable override token1;
    uint24 public immutable override fee;
    int24 public immutable override tickUpper;
    int24 public immutable override tickLower;

    int24 public override tick;
    uint160 public override sqrtPriceX96;
    uint128 public override liquidity;
    uint256 public override feeGrowthGlobal0X128;
    uint256 public override feeGrowthGlobal1X128;
    /**
    并没有显示的初始化positions，默认值0即可
    你不需要在合约的其他地方显式初始化 positions，
    只要通过 positions[params.owner] 访问，Solidity 就会自动创建并初始化它。
     */
    mapping(address => Position) public positions;
    constructor() {
        (factory, token0, token1, tickLower, tickUpper, fee) = IFactory(
            msg.sender
        ).parameters();
    }
    function getPosition(
        address owner
    )
        external
        view
        override
        returns (
            uint128 _liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        Position memory res = positions[owner];
        _liquidity = res.liquidity;
        feeGrowthInside0LastX128 = res.feeGrowthInside0LastX128;
        feeGrowthInside1LastX128 = res.feeGrowthInside1LastX128;
        tokensOwed0 = res.token0CouldWithdraw;
        tokensOwed1 = res.token1CouldWithdraw;
    }

    struct ModifyPositionParams {
        address owner;
        int128 liquidityChange;
    }
    //-----------------------utils function---------------
    function _modifyPosition(
        ModifyPositionParams memory params
    ) private returns (int256 amount0, int256 amount1) {
        //SqrtPriceMath.getAmount0Delta:计算由于新增流动性而需要多少 token0
        //sqrtPriceX96：当前的价格，已进行 sqrtPrice 处理（96 位）
        //TickMath.getSqrtPriceAtTick(tickUpper)：根据上限 tickUpper 获取该区间的价格（sqrtPrice）。
        //params.liquidityDelta：表示流动性变化的数量
        amount0 = SqrtPriceMath.getAmount0Delta(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickUpper),
            params.liquidityChange
        );

        amount1 = SqrtPriceMath.getAmount1Delta(
            sqrtPriceX96,
            TickMath.getSqrtPriceAtTick(tickLower),
            params.liquidityChange
        );
        Position storage position = positions[params.owner];
        // 提取手续费，计算从上一次提取到当前的手续费
        uint128 tokensOwed0 = uint128(
            FullMath.mulDiv(
                feeGrowthGlobal0X128 - position.feeGrowthInside0LastX128,
                position.liquidity,
                FixedPoint128.Q128
            )
        );
        uint128 tokensOwed1 = uint128(
            FullMath.mulDiv(
                feeGrowthGlobal1X128 - position.feeGrowthInside1LastX128,
                position.liquidity,
                FixedPoint128.Q128
            )
        );
        // 更新提取手续费的记录，同步到当前最新的 feeGrowthGlobal0X128，代表都提取完了
        position.feeGrowthInside0LastX128 = feeGrowthGlobal0X128;
        position.feeGrowthInside1LastX128 = feeGrowthGlobal1X128;

        liquidity = LiquidityMath.addDelta(liquidity, params.liquidityChange);
        if (tokensOwed0 > 0 || tokensOwed1 > 0) {
            position.token0CouldWithdraw += tokensOwed0;
            position.token1CouldWithdraw += tokensOwed1;
        }

        position.liquidity = LiquidityMath.addDelta(
            position.liquidity,
            params.liquidityChange
        );
    }
    function getThisContractBalance(
        address addr
    ) private view returns (uint256 balance) {
        IERC20 resAddr = addr == token0 ? IERC20(token0) : IERC20(token1);
        balance = resAddr.balanceOf(address(this));
    }

    //-----------------------------actual functions ----------------------
    function initialize(uint160 sqrtPriceX96_) external override {
        require(sqrtPriceX96 == 0, "INITIALIZED");
        // 通过价格获取 tick，判断 tick 是否在 tickLower 和 tickUpper 之间
        tick = TickMath.getTickAtSqrtPrice(sqrtPriceX96_);
        require(
            tick >= tickLower && tick < tickUpper,
            "sqrtPriceX96 should be within the range of [tickLower, tickUpper)"
        );
        // 初始化 Pool 的 sqrtPriceX96
        sqrtPriceX96 = sqrtPriceX96_;
    }

    //bytes 动态字节数组 calldata只能用于引用类型 bytes32是简单类型
    function mint(
        address _recipient,
        uint128 _amount,
        bytes calldata _data
    ) external override returns (uint256 amount0, uint256 amount1) {
        ModifyPositionParams memory params = ModifyPositionParams({
            owner: _recipient,
            liquidityChange: int128(_amount)
        });
        (int256 amount0Int, int256 amount1Int) = _modifyPosition(params);
        require(amount0Int > 0, "amount0Int is negative");
        require(amount1Int > 0, "amount1Int is negative");
        amount0 = uint256(amount0Int);
        amount1 = uint256(amount1Int);

        // to do  IMintCallback
        IMintCallback(msg.sender).mintCallback(amount0, amount1, _data);
        emit Mint(msg.sender, _recipient, _amount, amount0, amount1);
    }

    /**
mint：liquidity增加，可提取代币通过可提取手续费呈现增加  提取fee信息记录照旧
所以：_modifyPosition中收到正数int128(_amount) 并且  position.token0CouldWithdraw += tokensOwed0

 */
    /**
burn：liquidity减少 可提取代币0和1增加 提取fee信息记录照旧
所以：token0CouldWithdraw ++ ；
_modifyPosition中liquidity收到负数 -- ；

 */
    function burn(
        uint128 _amount
    ) external override returns (uint256 amount0, uint256 amount1) {
        require(_amount > 0, "_amount must greater than zero");
        require(
            _amount <= positions[msg.sender].liquidity,
            "insufficient balance"
        );
        ModifyPositionParams memory params = ModifyPositionParams({
            owner: msg.sender,
            liquidityChange: -int128(_amount)
        });
        (int256 _amount0, int256 _amount1) = _modifyPosition(params);
        amount0 = uint256(-_amount0);
        amount1 = uint256(-_amount1);

        if (amount0 > 0 || amount1 > 0) {
            positions[msg.sender].token0CouldWithdraw += uint128(amount0);
            positions[msg.sender].token1CouldWithdraw += uint128(amount1);
        }
        emit Burn(msg.sender, _amount, amount0, amount1);
    }

    function collect(
        address _recipient,
        uint128 _amount0Requested,
        uint128 _amount1Requested
    ) external override returns (uint128 amount0, uint128 amount1) {
        // Position memory position = positions[_recipient];
        /**
        problem1: 定义为memory的话意味着创建了一个副本，修改只是针对副本；不会影响合约的状态
        problem2: _recipient 还是  msg.sender ？
         */
        Position storage position = positions[msg.sender];
        amount0 = _amount0Requested > position.token0CouldWithdraw
            ? position.token0CouldWithdraw
            : _amount0Requested;
        amount1 = _amount1Requested > position.token1CouldWithdraw
            ? position.token1CouldWithdraw
            : _amount1Requested;

        if (amount0 > 0) {
            TransferHelper.safeTransfer(token0, _recipient, amount0);
            position.token0CouldWithdraw -= amount0;
        }
        if (amount1 > 0) {
            TransferHelper.safeTransfer(token1, _recipient, amount1);
            position.token1CouldWithdraw -= amount1;
        }
        emit Collect(msg.sender, _recipient, amount0, amount1);
    }
    //+++++++++++++  swap

    struct SwapState {
        int256 amountSpecifiedRemaining;
        int256 amountCalculated;
        uint160 sqrtPriceX96;
        uint256 feeGrowthGlobalX128;
        uint256 amountIn;
        uint256 amountOut; //always be negative
        uint256 feeAmount;
    }

    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external override returns (int256 amount0, int256 amount1) {
        /**
        amountSpecified:是用户最初输入的 swap 数量（买入或者卖出）
        sqrtPriceLimitX96：交易者输入的目标价格

        amountSpecified>0 : amount of token0， zeroForOne===true ,sqrtPriceLimitX96 < sqrtPriceX96
        amountSpecified<0 : amount of token1, zeroForOne===false, sqrtPriceLimitX96 > sqrtPriceX96
         */
        require(amountSpecified != 0, "amountSpecified cannot be zero");
        /**
       所以总结一下是这么理解的：sqrtPriceX96始终表示的是当前池子的价格，且始终是token0相对token1的价格；
       所以zeroForOne的时候，用户希望token0相对token1的价格是比较高的因为这样可以换取更多的token1，
       所以就有了条件【sqrtPriceLimitX96 < sqrtPriceX96】因为池子价格如果更低就不符合用户的预期了。
       而一旦交易开始，随着池子中涌入token1，会造成sqrtPriceX96降低，所以我们也需要保证最低不能低于系统最低值，
       于是有了条件【sqrtPriceLimitX96 > TickMath.MIN_SQRT_PRICE】
       
        TickMath.MIN_SQRT_PRICE：【这是系统允许的最小价格，表示 token1 相对于 token0 的最低价格。
        它是一个固定值，通常用于防止价格过低（例如，防止除零错误）】
        TickMath.getSqrtPriceAtTick(tickLower)：【这是当前流动性区间的最低价格，由 tickLower 决定。
        它表示当前流动性区间的下限价格。】
        流动性区间的价格范围必须在系统允许的范围内
         */
        require(
            zeroForOne
                ? sqrtPriceLimitX96 < sqrtPriceX96 &&
                    sqrtPriceLimitX96 > TickMath.MIN_SQRT_PRICE
                : sqrtPriceLimitX96 > sqrtPriceX96 &&
                    sqrtPriceLimitX96 < TickMath.MAX_SQRT_PRICE,
            "sqrtPriceLimitX96 insufficient"
        );

        SwapState memory state = SwapState({
            amountSpecifiedRemaining: amountSpecified,
            amountCalculated: 0,
            sqrtPriceX96: sqrtPriceX96,
            feeGrowthGlobalX128: zeroForOne
                ? feeGrowthGlobal0X128
                : feeGrowthGlobal1X128,
            amountIn: 0,
            amountOut: 0,
            feeAmount: 0
        });
        // 计算交易的上下限，基于 tick 计算价格
        uint160 sqrtPriceX96Lower = TickMath.getSqrtPriceAtTick(tickLower);
        uint160 sqrtPriceX96Upper = TickMath.getSqrtPriceAtTick(tickUpper);
        uint160 sqrtPriceNew;
        if (zeroForOne) {
            sqrtPriceNew = sqrtPriceX96Lower < sqrtPriceLimitX96
                ? sqrtPriceLimitX96
                : sqrtPriceX96Lower;
        } else {
            sqrtPriceNew = sqrtPriceX96Upper > sqrtPriceLimitX96
                ? sqrtPriceLimitX96
                : sqrtPriceX96Upper;
        }

        // uint160 final
        //计算 一次交换的结果
        (
            state.sqrtPriceX96,
            state.amountIn,
            state.amountOut,
            state.feeAmount
        ) = SwapMath.computeSwapStep(
            sqrtPriceX96,
            sqrtPriceNew,
            liquidity,
            amountSpecified,
            fee
        );
        sqrtPriceX96 = state.sqrtPriceX96;
        tick = TickMath.getTickAtSqrtPrice(state.sqrtPriceX96);

        // 计算手续费
        state.feeGrowthGlobalX128 += FullMath.mulDiv(
            state.feeAmount,
            FixedPoint128.Q128,
            liquidity
        );
        if (zeroForOne) {
            feeGrowthGlobal0X128 = state.feeGrowthGlobalX128;
        } else {
            feeGrowthGlobal1X128 = state.feeGrowthGlobalX128;
        }
        bool exactInput = amountSpecified > 0;

        if (exactInput) {
            //specified input
            state.amountSpecifiedRemaining -= SafeCast.toInt256(
                state.amountIn + state.feeAmount
            );
            state.amountCalculated -= SafeCast.toInt256(state.amountOut);
        } else {
            //specified output
            state.amountSpecifiedRemaining += SafeCast.toInt256(
                state.amountOut
            );
            state.amountCalculated += SafeCast.toInt256(
                state.amountIn + state.feeAmount
            );
        }

        if (zeroForOne == exactInput) {
            //amountSpecified positive
            amount0 = amountSpecified - state.amountSpecifiedRemaining;
            amount1 = state.amountCalculated;
        } else {
            //amountSpecified negative
            amount0 = state.amountCalculated;
            amount1 = amountSpecified - state.amountSpecifiedRemaining;
        }
        if (zeroForOne) {
            uint256 balanceBefore = getThisContractBalance(token0);
            //to do why
            ISwapCallback(msg.sender).swapCallback(amount0, amount1, data);
            require(
                balanceBefore + uint256(amount0) <=
                    getThisContractBalance(token0),
                "Pool swap:wrong balance of token0"
            );
            if (amount1 < 0) {
                TransferHelper.safeTransfer(
                    token1,
                    recipient,
                    uint256(-amount1)
                );
            }
        } else {
            uint256 balanceBefore = getThisContractBalance(token1);
            ISwapCallback(msg.sender).swapCallback(amount0, amount1, data);
            require(
                balanceBefore + uint256(amount1) <=
                    getThisContractBalance(token1)
            );
            if (amount0 < 0) {
                TransferHelper.safeTransfer(
                    token1,
                    recipient,
                    uint256(-amount0)
                );
            }
        }
        emit Swap(
            msg.sender,
            recipient,
            amount0,
            amount1,
            sqrtPriceX96,
            liquidity,
            tick
        );
    }
}
