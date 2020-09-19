// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ICryptoProvider.sol";
import "./IRegistry.sol";
import "./IBox.sol";


contract AbstractBox is IBox {

    address payable public immutable founder;
    address payable public immutable recipient;

    IRegistry public immutable registry;

    uint public secret;
    uint public immutable hashSecret;
    uint public immutable timelock;
    uint public immutable amount;

    constructor(
        address payable _founder,
        address payable _recipient,
        uint _amount,
        uint _hashSecret,
        uint _timelock
    )
        public
    {
        registry = IRegistry(msg.sender);
        founder = _founder;
        recipient = _recipient;
        amount = _amount;
        hashSecret = _hashSecret;
        timelock = _timelock;
    }

    function transfer(address payable _target, uint _amount)
        internal virtual
    { /* abstract */ }

    // IBox
    function complete(uint _secret) external override {
        require(
            msg.sender == recipient,
            "Only recipient can call this function."
        );
        ICryptoProvider provider = registry.getCryptoProvider(0);
        require(
            hashSecret == provider.calculateHash(_secret),
            "Wrong secret."
        );

        transfer(recipient, amount);
        secret = _secret;
    }

    function reclaim() external override {
        require(
            msg.sender == founder,
            "Only founder can call this function."
        );
        require(
            // solium-disable-next-line security/no-block-members
            now > timelock,
            "Wait for unlock."
        );

        transfer(founder, amount);
    }
}
