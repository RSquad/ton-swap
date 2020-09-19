// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


abstract contract CryptoProvider {

    function calculateHash(uint _secret)
        external pure
        returns (uint o_hashSecret)
    {
        return m_calculateHash(_secret);
    }

    function m_calculateHash(uint _secret)
        internal pure inline
        returns (uint o_hashSecret)
    {
        bytes p = abi.encodePacked(_secret);
        bytes32 b = sha256(p);
        uint res = uint(b);
        p = abi.encodePacked(res);
        b = sha256(p);
        res = uint(b);
        return res;
    }

}
