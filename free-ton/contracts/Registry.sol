// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./CryptoProvider.sol";
import "./BoxFactory.sol";
import "./Version.sol";


contract Registry is BoxFactory, CryptoProvider, Version {

    event BoxCreated(
        TONBox indexed addrBox,
        address indexed founder,
        address indexed recipient
    );

    struct BoxDescriptor {
        address addr;
    }

    uint private m_boxesCount = 0;
    BoxDescriptor[] private m_boxes;
    mapping(address => uint) private registry;

    constructor (TvmCell _boxStateInit)
        public
        BoxFactory(_boxStateInit)
    {
        tvm.accept();
    }

    function createBox(
        address /* payable */ _recipient,
        uint128 _amount,
        uint _hashSecret,
        uint _timelock
    )
        public // payable
        returns (TONBox o_addrBox)
    {
        require(
            (_amount + 100 milliton) <= msg.value,
            123 // "not enought approved"
        );

        o_addrBox = deploy(
            now,
            msg.sender,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        );
        m_boxes.push(BoxDescriptor(
            o_addrBox
        ));
        m_boxesCount++;
        registry[address(o_addrBox)] = m_boxesCount;

        emit BoxCreated(o_addrBox, msg.sender, _recipient);
    }

    function getBoxByIndex(uint idx)
        public view
        returns (BoxDescriptor o_box)
    {
        return m_boxes[idx];
    }

    function getBoxByAddress(address _address)
        public view
        returns (BoxDescriptor o_box)
    {
        return m_boxes[registry[_address] - 1];
    }

    function getBoxesCount()
        public view
        returns (uint)
    {
        return m_boxesCount;
    }
}
