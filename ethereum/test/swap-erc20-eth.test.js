const AsyncParam = require('../lib/async-param');

const RegistryContract = artifacts.require("Registry");
const IBox = artifacts.require("AbstractBox");
const ERC20TokenContract = artifacts.require("ERC20Token");

const utcTimeSpan = sec => Math.floor(Date.now() / 1000) + sec;

const nanos = 1000 * 1000 * 1000;

contract("Swap ERC20-ETH", accounts => {
  const admin = accounts[0];
  const user1 = accounts[3];
  const user2 = accounts[4];

  const web3 = RegistryContract.web3;

  let boxERC20 = new AsyncParam();
  let boxEth = new AsyncParam();

  const secret = Date.now();

  let registry;
  let ERC20Token;
  let hashSecret;

  before(async () => {
    registry = await RegistryContract.deployed();
    ERC20Token = await ERC20TokenContract.deployed();

    // const amount = 100;
    const tx1 = await ERC20Token.transfer(
      user1,
      100, // amount,
      { from: admin },
    );

    hashSecret = await registry.sha256d(secret);
    // console.log({ hashSecret });

    const amount = 30;

    const tx2 = await ERC20Token.approve(
      registry.address,
      amount,
      { from: user1 },
    );

    const tx3 = await registry.createBox(
      /* IERC20 _addrERC20          */ ERC20Token.address,
      /* address payable _recipient */ user2,
      /* uint _amount               */ amount,
      /* uint _hashSecret           */ hashSecret,
      /* uint _timelock             */ utcTimeSpan(1 * 60 * 60),
      { from: user1 },
    );

    const { event, args: { addrBox } } = tx3.logs[0];

    boxERC20 = await IBox.at(addrBox);
  });

  it("User1 should create ETH box", async () => {
    const amount = 75000; // * nanos;

    const tx1 = await registry.createBox2(
      /* address payable _recipient */ user2,
      /* uint _amount               */ amount,
      /* uint _hashSecret           */ hashSecret,
      /* uint _timelock             */ utcTimeSpan(1 * 60 * 60),
      { from: user1, value: amount },
    );
    const { event, args: { addrBox } } = tx1.logs[0];

    const HTLCBox = await IBox.at(addrBox);
    boxEth.resolve(HTLCBox);
  });

  it("User2 should open ETH box", async () => {
    const box = await boxEth.createPromise();

    const tx1 = await box.complete(secret, { from: user2 });
    // console.log(tx1);
    const b = await web3.eth.getBalance(user2)
    assert(
      '99998882280000075000' == b,
      "Incorrect ballance",
    );
  });
});
