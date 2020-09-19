import { TONClient } from 'ton-client-node-js';

import { multisigPackage } from '../thrd-party/ton-labs';

import RegistryPackage from '../src/RegistryPackage';
import TONBoxPackage from '../src/TONBoxPackage';
import {
  crystal,
  deploy,
  deployMultisig,
  getBalance,
  waitForResultXN,
} from '../src/utils';


const localNode = true;
const envTest = {
  localNode,
  servers: localNode
    ? [ 'http://localhost' ]
    : [ 'https://net.ton.dev' ],
  addrAdmin: '0:7cde61a14ae4267c800e446d7032726da7327f3917f8060742dcb571ae07b5b0',
  keysAdmin: {
    public: '62618b1f0a8fcf44cde47d8adf7dc1a37d3940103613a2778a47b7026ee17e9a',
    secret: '6f32190558062532c25b62e3071996a40f939d8ad179e887db63e568f482fb7a',
  },
}

describe('Factory', () => {
  let ton;

  let { addrAdmin, keysAdmin } = envTest;

  const secret = Date.now();

  let addrBoxFactory;
  let keysWallet1;
  let addrWallet1;
  let keysWallet2;
  let addrWallet2;
  let hashSecret;

  before(async () => {
    console.log('before');
    ton = await TONClient.create({ servers: envTest.servers });

    if( envTest.localNode ) {
      try {
        const { addr } = await deployMultisig(ton, {
          localNode: envTest.localNode,
          verbose: true,
          value: 1 * crystal,
        });
        envTest.addrAdmin = addr;
        addrAdmin = addr;
      } catch (ex) {
        console.log({ ex });
      }
    }

    console.log({
      'Admin keys': keysAdmin,
      'Admin addr': addrAdmin,
      balance: await getBalance(ton, addrAdmin),
    });

    try {
      const { addr, keys } = await deployMultisig(ton, {
        localNode: envTest.localNode,
        verbose: true,
        giverAddr: addrAdmin,
        giverKeys: keysAdmin,
        value: 5 * crystal,
      });
      addrWallet1 = addr;
      keysWallet1 = keys;
      const balance = await getBalance(ton, addrWallet1);
      console.log({ addrWallet1, balance });
    } catch (ex) {
      console.log({ ex });
    }

    try {
      const { addr, keys } = await deployMultisig(ton, {
        localNode: envTest.localNode,
        verbose: true,
        giverAddr: addrAdmin,
        giverKeys: keysAdmin,
        value: 5 * crystal,
      });
      addrWallet2 = addr;
      keysWallet2 = keys;
      const balance = await getBalance(ton, addrWallet2);
      console.log({ addrWallet2, balance });
    } catch (ex) {
      console.log({ ex });
    }

  });

  it('deploy', async () => {
    console.log('deploy');

    addrBoxFactory = await deploy(ton, {
      localNode: envTest.localNode,
      verbose: true,
      giverAddr: addrAdmin,
      giverKeys: keysAdmin,
    },
      RegistryPackage, keysAdmin, {
        _boxStateInit: TONBoxPackage.imageBase64,
    });

    try {
      const { output: { o_hashSecret }} = await ton.contracts.runLocal({
        abi: RegistryPackage.abi,
        address: addrBoxFactory,
        functionName: 'calculateHash',
        input: {
          _secret: secret,
        },
      });
      hashSecret = o_hashSecret;
    } catch (ex) {
      console.log({ ex });
    }
  });

  it('createBox', async () => {
    console.log('createBox');

    console.log({
      balanceWallet1: await getBalance(ton, addrWallet1),
      balanceWallet2: await getBalance(ton, addrWallet2),
      balanceBoxFactory: await getBalance(ton, addrBoxFactory),
    });

    let count0;
    try {
      count0 = await ton.contracts.runLocal({
        abi: RegistryPackage.abi,
        address: addrBoxFactory,
        functionName: 'getBoxesCount',
        input: { },
      });
    } catch (ex) {
      console.log({ ex });
    }

    try {
      const runBody = await ton.contracts.createRunBody({
        abi: RegistryPackage.abi,
        function: 'createBox',
        params: {
          _recipient: addrWallet2,
          _amount: 1 * crystal,
          _hashSecret: hashSecret,
          _timelock: 1,
        },
        internal: true,
      });

      const result = await ton.contracts.run({
        address: addrWallet1,
        abi: multisigPackage.abi,
        functionName: 'sendTransaction',
        input: {
          dest: addrBoxFactory,
          value: 1.5 * crystal,
          bounce: true,
          flags: 3,
          payload: runBody.bodyBase64,
        },
        keyPair: keysWallet1,
      });

      await waitForResultXN(ton, result, 3);

    } catch (ex) {
      console.log({ ex });
    }

    let count1;
    try {
      count1 = await ton.contracts.runLocal({
        abi: RegistryPackage.abi,
        address: addrBoxFactory,
        functionName: 'getBoxesCount',
        input: { },
      });
      console.log({ count0, count1 });
    } catch (ex) {
      console.log({ ex });
    }

    let addr;
    try {
      const res = await ton.contracts.runLocal({
        abi: RegistryPackage.abi,
        address: addrBoxFactory,
        functionName: 'getBoxByIndex',
        input: {
          idx: 0,
        },
      });

      const { output: { o_box: { addr: addrBox }}} = res;
      addr = addrBox;

      console.log({
        balanceBox: await getBalance(ton, addr),
        balanceWallet1: await getBalance(ton, addrWallet1),
        balanceWallet2: await getBalance(ton, addrWallet2),
        balanceBoxFactory: await getBalance(ton, addrBoxFactory),
      });

    } catch (ex) {
      console.log({ ex });
    }

    try {
      const runBody = await ton.contracts.createRunBody({
        abi: TONBoxPackage.abi,
        function: 'complete',
        params: {
          _secret: secret,
        },
        internal: true,
      });

      const result = await ton.contracts.run({
        address: addrWallet2,
        abi: multisigPackage.abi,
        functionName: 'sendTransaction',
        input: {
          dest: addr,
          value: 0.1 * crystal,
          bounce: true,
          flags: 3,
          payload: runBody.bodyBase64,
        },
        keyPair: keysWallet2,
      });

      await waitForResultXN(ton, result, 2);

      console.log({
        balanceBox: await getBalance(ton, addr),
        balanceWallet1: await getBalance(ton, addrWallet1),
        balanceWallet2: await getBalance(ton, addrWallet2),
        balanceBoxFactory: await getBalance(ton, addrBoxFactory),
      });

    } catch (ex) {
      console.log({ ex });
    }
  });
});
