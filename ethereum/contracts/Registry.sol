// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Ownable.sol";

import "./ICryptoProvider.sol";
import "./IRegistry.sol";

import "./AbstractBox.sol";
import "./ERC20Box.sol";
import "./ETHBox.sol";


contract Registry
    is IRegistry,
    Ownable,
    ICryptoProvider
{
    event BoxCreated(
        IBox addrBox,
        address founder,
        address recipient
    );

    mapping(address => uint) public registry;

    constructor ()
        public
        Ownable()
    {
        //
    }

    // ERC20Box
    function createBox(
        IERC20 _addrERC20,
        address payable _recipient,
        uint _amount,
        uint _hashSecret,
        uint _timelock
    )
        public
        returns (IBox o_addrBox)
    {
        require(
            _amount <= _addrERC20.allowance(
                msg.sender,
                address(this)
            ),
            "not enought approved"
        );

        o_addrBox = new ERC20Box(
            _addrERC20,
            msg.sender,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        );
        registry[address(o_addrBox)] = 1;

        _addrERC20.transferFrom(
            msg.sender,
            address(o_addrBox),
            _amount
        );

        emit BoxCreated(o_addrBox, msg.sender, _recipient);
    }

    // ETHBox
    function createBox2(
        address payable _recipient,
        uint _amount,
        uint _hashSecret,
        uint _timelock
    )
        public payable
        returns (IBox o_addrBox)
    {
        require(
            _amount <= msg.value,
            "not enought approved"
        );

        o_addrBox = new ETHBox{ value: msg.value }(
            msg.sender,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        );
        registry[address(o_addrBox)] = 1;

        emit BoxCreated(o_addrBox, msg.sender, _recipient);
    }

    // IRegistry
    function getCryptoProvider(uint _cryptoProviderId)
        external view override
        returns (ICryptoProvider o_cryptoProvider)
    {
        require(
            _cryptoProviderId == 0,
            "Unknown cryptoProviderId"
        );

        return this;
    }

    // ICryptoProvider
    function calculateHash(uint _secret)
        external pure override
        returns (uint o_hashSecret)
    {
        o_hashSecret = sha256d(_secret);
    }

    function sha256d(
        uint _secret
    )
        public pure
        returns (
            uint o_hashSecret
        )
    {
        bytes memory p = abi.encodePacked(_secret);
        bytes32 b = sha256(p);
        uint res = uint(b);
        p = abi.encodePacked(res);
        b = sha256(p);
        res = uint(b);
        return res;
    }
}
