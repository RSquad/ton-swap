// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./ICryptoProvider.sol";


interface IRegistry {

    function getCryptoProvider(uint _cryptoProviderId)
        external view
        returns (ICryptoProvider o_cryptoProvider);

}
