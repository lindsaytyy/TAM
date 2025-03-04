// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
import "./interfaces/IFactory.sol";
import "./Pool.sol";

contract Factory is IFactory {
    //set a limitation to each pool list
    uint256 public constant MAX_POOLS_PER_PAIR = 100;
    mapping(address => mapping(address => address[])) pools;
    mapping(bytes32 => address) onlyPool;

    function sortAddress(
        address _addrA,
        address _addrB
    ) private pure returns (address, address) {
        return _addrA < _addrB ? (_addrA, _addrB) : (_addrB, _addrA);
    }

    function validateAddress(address _addrA, address _addrB) private pure {
        require(_addrA != _addrB, "Factory: identical address");
        require(
            _addrA != address(0) && _addrB != address(0),
            "Factory: address zero"
        );
    }
    Parameters public override parameters;
    function getPool(
        address _tokenA,
        address _tokenB,
        uint32 _index
    ) external view override returns (address poolAddr) {
        validateAddress(_tokenA, _tokenB);
        address token0;
        address token1;
        (token0, token1) = sortAddress(_tokenA, _tokenB);
        poolAddr = pools[token0][token1][_index];
    }

    function createPool(
        address _tokenA,
        address _tokenB,
        int24 _tickLower,
        int24 _tickUpper,
        uint24 _fee
    ) external override returns (address poolAddr) {
        validateAddress(_tokenA, _tokenB);
        address token0;
        address token1;
        (token0, token1) = sortAddress(_tokenA, _tokenB);

        address[] storage poolList = pools[token0][token1];
        require(
            poolList.length < MAX_POOLS_PER_PAIR,
            "Factory: too many pools for this pair"
        );

        // for (uint24 i; i < poolList.length; i++) {
        //     IPool pool = IPool(poolList[i]);
        //     bool condition = (pool.fee() == _fee) &&
        //         (pool.tickLower() == _tickLower) &&
        //         ((pool.tickUpper() == _tickUpper));

        //     if (condition) return poolList[i];
        // }
        parameters = Parameters(
            address(this),
            token0,
            token1,
            _tickLower,
            _tickUpper,
            _fee
        );
        bytes32 _salt = keccak256(
            abi.encode(token0, token1, _tickLower, _tickUpper, _fee)
        );
        require(onlyPool[_salt] == address(0), "Factory:address already exist");
        poolAddr = address(new Pool{salt: _salt}());
        onlyPool[_salt] = poolAddr;
        pools[token0][token1].push(poolAddr);
        // delete pool info
        delete parameters;
        emit PoolCreated(
            token0,
            token1,
            uint32(poolList.length),
            _tickLower,
            _tickUpper,
            _fee,
            poolAddr
        );
    }
}
