// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


interface IBox {

    function complete(uint _secret)
        external;

    function reclaim()
        external;

}
