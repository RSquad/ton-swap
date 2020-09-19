// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


interface ICryptoProvider {

    function calculateHash(uint _secret)
        external pure
        returns (uint o_hashSecret);

}
