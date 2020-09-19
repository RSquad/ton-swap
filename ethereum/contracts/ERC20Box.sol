// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./AbstractBox.sol";


contract ERC20Box is AbstractBox {

    IERC20 public immutable addrERC20;

    constructor (
        IERC20 _addrERC20,
        address payable _founder,
        address payable _recipient,
        uint _amount,
        uint _hashSecret,
        uint _timelock
    )
        public
        AbstractBox(
            _founder,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        )
    {
        addrERC20 = _addrERC20;
    }

    function transfer(
        address payable _target,
        uint amount
    )
        internal override
    {
        addrERC20.transfer(_target, amount);
    }
}
