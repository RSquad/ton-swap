// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;


contract Ownable {
    address public immutable owner;

    constructor () internal {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            owner == msg.sender,
            "Caller is not the owner"
        );
        _;
    }
}
