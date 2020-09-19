'use strict';

const { stripHexPrefix } = require('ethereumjs-util');
const { script, opcodes, address } = require('bitcoinjs-lib');

const secretSize = 32;

const completeHex = hex => hex.length % 2 ? `0${ hex }` : hex;
const asCompleteHex = n => completeHex(`${ n.toString(16) }`);
const fmtInt64 = n => Buffer.from(asCompleteHex(n), 'hex');
const fmtHash = h => Buffer.from(stripHexPrefix(h), 'hex');
const fmtAddr = a => address.fromBase58Check(stripHexPrefix(a)).hash;

function buildHTLCScript(addrFrom, addrTo, secretHash, locktime) {
  // Main HTLC Script
  return script.compile([
    opcodes.OP_IF, // Normal redeem path

    opcodes.OP_SIZE,
    fmtInt64(secretSize),
    opcodes.OP_EQUALVERIFY,

    opcodes.OP_SHA256,
    opcodes.OP_SHA256,
    fmtHash(secretHash),
    opcodes.OP_EQUALVERIFY,

    opcodes.OP_DUP,
    opcodes.OP_HASH160,
    fmtAddr(addrTo),

    opcodes.OP_ELSE, // Refund path

    script.number.encode(lockTime),
    opcodes.OP_CHECKLOCKTIMEVERIFY,
    opcodes.OP_DROP,

    opcodes.OP_DUP,
    opcodes.OP_HASH160,
    fmtAddr(addrFrom),

    opcodes.OP_ENDIF,

    // Complete the signature check.
    opcodes.OP_EQUALVERIFY,
    opcodes.OP_CHECKSIG,
  ]);
}

function buildRedeemHTLCScript(sig, pubkey, secret) {
  // Redeem by Recipient with public key (hashlock)
  return script.compile([
    fmtHash(sig),
    fmtHash(pubkey),
    fmtHash(secret),
    fmtInt64(1),
  ]);
}

function buildRefundHTLCScript(sig, pubkey) {
  // Refund by Sender with public key (timelock)
  return script.compile([
    fmtHash(sig),
    fmtHash(pubkey),
    fmtInt64(0),
  ]);
}

module.exports = {
  buildHTLCScript,
  buildRedeemHTLCScript,
  buildRefundHTLCScript,
};
