// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./CryptoProvider.sol";
import "./Version.sol";


contract TONBox is CryptoProvider, Version {

    address private founder;
    address private recipient;

    uint private secret;
    uint private hashSecret;
    uint private timelock;
    uint128 private amount;

    constructor (
        address /* payable */ _founder,
        address /* payable */ _recipient,
        uint128 _amount,
        uint _hashSecret,
        uint _timelock
    )
        public
    {
        founder = _founder;
        recipient = _recipient;
        amount = _amount;
        hashSecret = _hashSecret;
        timelock = _timelock;
    }

    function getBoxData()
        public view
        returns (
            address o_founder,
            address o_recipient,
            uint o_hashSecret,
            uint o_timelock,
            uint128 o_amount
        )
    {
        return (
            founder,
            recipient,
            hashSecret,
            timelock,
            amount
        );
    }

    function getSecret()
        public view
        returns (uint o_secret)
    {
        return secret;
    }

    function complete(uint _secret)
        external
    {
        require(
            msg.sender == recipient,
            273 // "Only recipient can call this function."
        );
        require(
            hashSecret == m_calculateHash(_secret),
            666 // "Wrong secret."
        );

        recipient.transfer(amount);
        secret = _secret;
    }

    function reclaim()
        external
    {
        require(
            msg.sender == founder,
            274 // "Only founder can call this function."
        );
        require(
            // solium-disable-next-line security/no-block-members
            now > timelock,
            500 // "Wait for unlock."
        );

        founder.transfer(amount);
    }
}
