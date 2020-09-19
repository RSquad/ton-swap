import { multisigPackage } from '../thrd-party/ton-labs';

import {
  nodeSeGiverAddress,
  nodeSeGiverAbi,
} from '../src/giver';


export const crystal = 1000 * 1000 * 1000;


export
async function waitForResultXN (ton, result, N) {
  let child = result.transaction;
  let restN = N;
  while (--restN && (child.out_messages || []).length > 0) {
    for (const msg of child.out_messages || []) {
      if (msg.msg_type === 0) {
        child = await ton.queries.transactions.waitFor(
          {
            in_msg: { eq: msg.id },
            status: { eq: 3 },
          },
          "out_messages { msg_type id }",
          undefined,
          60 * 1000
        );
      }
    }
  }
  for (const msg of child.out_messages || []) {
    if (msg.msg_type === 0) {
      await ton.queries.transactions.waitFor(
        {
          in_msg: { eq: msg.id },
          status: { eq: 3 },
        },
        "lt",
        undefined,
        60 * 1000
      );
    }
  }
}

export
async function deploy(ton, conf, contract, keys, options = {}) {
  const futureAddress = (await ton.contracts.createDeployMessage({
      package: contract,
      constructorParams: options,
      keyPair: keys ? keys : contract.keys,
  })).address;
  if (conf.verbose) {
    console.log('[Test]: future address', futureAddress);
  }

  if (conf.localNode) {
    try {
      const result =
      await ton.contracts.run({
          address: nodeSeGiverAddress,
          abi: nodeSeGiverAbi,
          functionName: 'sendGrams',
          input: {dest: futureAddress, amount: conf.value || 1 * crystal},
      });
      await waitForResultXN(ton, result, 1);
    } catch (ex) {
      console.log({ ex });
    }
  } else {
    try {
      const result =
      await ton.contracts.run({
        address: conf.giverAddr,
        abi: multisigPackage.abi,
        functionName: 'sendTransaction',
        input: {
          dest: futureAddress,
          value: conf.value || 1 * crystal,
          bounce: false,
          flags: 3,
          payload: '',
        },
        keyPair: conf.giverKeys,
      });
      await waitForResultXN(ton, result, 1);
    } catch (ex) {
      console.log({ ex });
    }
  }
  const balance = await getBalance(ton, futureAddress);
  if (conf.verbose) {
    console.log('[Test]: giver sent grams, balance', balance);
  }

  let txn;
  try {
    txn = await ton.contracts.deploy({
        package: contract,
        constructorParams: options,
        keyPair: keys,
    });
  } catch (ex) {
    console.log({ ex });
  }

  return txn.address;
}

export
async function deployMultisig(ton, conf) {
  const multisigKeys = await ton.crypto.ed25519Keypair();
  if (conf.verbose) {
      console.log(`[Test] multisig keys:`, multisigKeys);
  }
  let ctorParams = {reqConfirms: 1, owners: ['0x' + multisigKeys.public]};
  const multisigAddress = await deploy(ton, conf, multisigPackage, multisigKeys, ctorParams);
  if (conf.verbose) {
      console.log('[Test]: multisig address', multisigAddress);
  }
  return {addr: multisigAddress, keys: multisigKeys};
}

export
async function getBalance(ton, addr) {
  const queryResult = await ton.queries.accounts.query({id: {eq: addr}}, 'id balance')

  if (queryResult.length) {
      const accountData = queryResult[0]
      if (accountData.id !== addr) {
          console.debug(`Something wrong: requested addr = ${addr}, received addr = ${accountData.id}`)
          return null
      }
      return accountData.balance / 1e9
  }
  return null
}
