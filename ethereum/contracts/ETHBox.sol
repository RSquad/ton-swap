// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./AbstractBox.sol";


contract ETHBox
    is AbstractBox
{
    constructor (
        address payable _founder,
        address payable _recipient,
        uint _amount,
        uint _hashSecret,
        uint _timelock
    )
        public payable
        AbstractBox(
            _founder,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        )
    {
        require(
            msg.value == _amount,
            "Incorrect value"
        );
    }

    function transfer(
        address payable _target,
        uint _amount
    )
        internal override
    {
        require(_amount == amount, "Incorrect amount");
        require(address(this).balance >= _amount, "insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = _target.call{ value: _amount }("");
        require(success, "unable to send value, recipient may have reverted");
    }
}
