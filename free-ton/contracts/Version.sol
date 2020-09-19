// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


abstract contract Version {

    function vBuild()
        external pure
        returns (uint o_vBuild)
    {
        return m_vBuild();
    }

    function m_vBuild()
        internal pure inline
        returns (uint o_vBuild)
    {
        return 8;
    }
}
