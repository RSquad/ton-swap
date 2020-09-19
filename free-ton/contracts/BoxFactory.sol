// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./TONBox.sol";


abstract contract BoxFactory {
	TvmCell boxStateInit;

	constructor(TvmCell _boxStateInit)
        internal
    {
		tvm.accept();
		boxStateInit = _boxStateInit;
	}

	function deploy(
        uint256 pubkey,
        address /* payable */ _founder,
        address /* payable */ _recipient,
        uint128 _amount,
        uint _hashSecret,
        uint _timelock
    )
        internal // inline
        returns (TONBox addrBox)
    {
		TvmCell state = tvm.insertPubkey(boxStateInit, pubkey);

		TONBox box = new TONBox{
            stateInit: state,
            value: _amount + 10 milliton
        }(
            _founder,
            _recipient,
            _amount,
            _hashSecret,
            _timelock
        );

		return box;
	}
}
