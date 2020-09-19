const BitcoinJsLib = require('bitcoinjs-lib');
const EthUtils = require('ethereumjs-util');

export function sha256d (a) {
  const hash = EthUtils.sha256(EthUtils.sha256(a));
  return `0x${ hash.toString('hex') }`;
}

export const btcNetworks = BitcoinJsLib.networks;

export
function createBitcoinAddress(net?, wif?) {
  const {
    payments,
    ECPair,
  } = BitcoinJsLib;

  const network = net || btcNetworks.testnet;
  const WIF = wif || ECPair.makeRandom({ network }).toWIF();
  const ecpair = ECPair.fromWIF(WIF, network);

  return {
    ecpair,
    privateKey: EthUtils.bufferToHex(ecpair.privateKey),
    publicKey: ecpair.publicKey,
    address: payments.p2pkh({
      network,
      pubkey: ecpair.publicKey,
    }).address,
    WIF,
  };
}

export function signBtcTransaction(txUnsignedHex, privateKey, network) {
  const {
    ECPair,
    Transaction,
    TransactionBuilder,
  } = BitcoinJsLib;

  const keyPair = ECPair.fromPrivateKey(
    Buffer.from(EthUtils.stripHexPrefix(privateKey), 'hex'), {
      network,
    },
  );

  const tx = Transaction.fromHex(EthUtils.stripHexPrefix(txUnsignedHex));
  const txb = TransactionBuilder.fromTransaction(tx, network);

  for (let i = 0; i < tx.ins.length; i++) {
    txb.sign(i, keyPair);
  }

  const txSigned = txb.buildIncomplete();
  const txSignedHex = txSigned.toHex();
  return txSignedHex;
}
