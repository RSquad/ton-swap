import * as _ from 'lodash';
import * as BitcoinJs from 'bitcoinjs-lib';

import BlockcypherService from './blockcypher';
import {
  btcNetworks,
  createBitcoinAddress,
} from './utils';
import {
  buildHTLCScript,
  buildRedeemHTLCScript,
  buildRefundHTLCScript,
} from './btc-script';


const b2s = x => Math.round(x * 1000 * 1000 * 1000); // x / 0.00000001;


export const main = async () => {
  const btc = new BlockcypherService();

  const net = btcNetworks['testnet'];
  console.log('Network:', net);

  const user1 = createBitcoinAddress(
    net,
    'cP5cfqnitFMbtBfs8eLjce6GGbrdryySsTfm7S7ow8AtSFfbkcfz',
  );
  const user2 = createBitcoinAddress(
    net,
    'cV2sCdRgFmpocXxiv9o6mim2XWHMNjqKrJuTh1szzzBVAqdRA1yE',
  );

  const {
    payments,
    // ECPair,
    script,
    TransactionBuilder,
    Transaction,
  } = BitcoinJs;
  const network = net;

  type uint256 = string;
  const swapPreimage: uint256 =
    '0x2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b';
  const swapImage: uint256 =
    '0x1690316bcf298df9b9f082e155979c90a5cfd663c6aa9117ebf16bf49ee16b6e';

  const locktime = 1;
  const scriptHTLC = buildHTLCScript(
    user1.address,
    user2.address,
    swapImage,
    locktime,
  );

  const p2sh = payments.p2sh({
    network,
    redeem: {
      output: scriptHTLC,
      network,
    },
  });
  const { address } = p2sh;

  const strHTLC = scriptHTLC.toString('hex');

  const txParams = {
    inputs: [{
      addresses: [ user1.address ],
    }],
    outputs: [{
      addresses: [ user2.address ],
      value: 100 * 1000,
      script: strHTLC,
    }],
  };
  const skeleton = (await btc.createTxStub(txParams)).data;
  const { inputs, outputs } = skeleton.tx;

  const txb: BitcoinJs.TransactionBuilder = new TransactionBuilder();
  inputs.forEach(el => {
    txb.addInput(
      el.prev_hash,
      el.output_index,
    );
  });
  outputs.forEach(el => {
    txb.addOutput(
      el.prev_hash,
      el.output_index,
    );
  });
  for (let i = 0; i < inputs.length; i++) {
    txb.sign({
      prevOutScriptType: 'p2pkh',
      vin: 0,
      keyPair: user1.ecpair,
    });
  }

  async function sendRedeemTx (unspent) {
    const amount = b2s(0.0001) - 10000;
    const txb = new TransactionBuilder(network);
    txb.addInput(unspent.txId, unspent.vout, 0xfffffffe);
    txb.addOutput(user2.address, amount);

    const tx = txb.buildIncomplete();
    const signatureHash = tx.hashForSignature(
      0,
      redeemScript,
      Transaction.SIGHASH_ALL,
    );
    const sig = script.signature.encode(
      user2.ecpair.sign(signatureHash),
      Transaction.SIGHASH_ALL,
    );
    const p = payments.p2sh({
      network,
      redeem: {
        input: buildRedeemHTLCScript(
          sig,
          user2.publicKey,
          swapPreimage,
        ),
        output: redeemScript,
      }
    });

    const redeemScriptSig = p.input;
    tx.setInputScript(0, redeemScriptSig);
    const signedTx = tx.toHex();
    const txIdHTLCRedeem = await btc.sendSignedTransaction(signedTx);
    return txIdHTLCRedeem;
  }

  async function sendRefundTx(unspent2) {
    const amount2 = b2s(0.0001) - 10000;
    const txb2 = new TransactionBuilder(network);
    txb2.setLockTime(locktime);
    txb2.addInput(unspent2.txId, unspent2.vout, 0xfffffffe);
    txb2.addOutput(user1.address, amount2);

    const tx2 = txb2.buildIncomplete();
    const signatureHash2 = tx2.hashForSignature(
      0,
      redeemScript,
      Transaction.SIGHASH_ALL,
    );
    const sig2 = script.signature.encode(
      user1.ecpair.sign(signatureHash2),
      Transaction.SIGHASH_ALL,
    );
    const p2 = payments.p2sh({
      network,
      redeem: {
        input: buildRefundHTLCScript(
          sig2,
          user1.publicKey,
        ),
        output: redeemScript,
      }
    });

    const redeemScriptSig2 = p2.input;
    tx2.setInputScript(0, redeemScriptSig2);
    const signedTx2 = tx2.toHex();
    const txIdHTLCRefund = await btc.sendSignedTransaction(signedTx2);
    return txIdHTLCRefund;
  }
}
