const AsyncParam = require('../lib/async-param');

const RegistryContract = artifacts.require("Registry");
const IBox = artifacts.require("AbstractBox");
const ERC20TokenContract = artifacts.require("ERC20Token");

const utcTimeSpan = sec => Math.floor(Date.now() / 1000) + sec;

contract("Swap ERC20", accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  const box1 = new AsyncParam();
  const box2 = new AsyncParam();

  const secret = Date.now();

  let registry;
  let ERC20Token;
  let hashSecret;

  let web3;
  let BN;
  before(async () => {
    registry = await RegistryContract.deployed();
    ERC20Token = await ERC20TokenContract.deployed();

    web3 = RegistryContract.web3;
    BN = web3.utils.BN;

    const amount = 100;
    const tx1 = await ERC20Token.transfer(
      user1,
      amount,
      { from: admin },
    );
    const tx2 = await ERC20Token.transfer(
      user2,
      amount,
      { from: admin },
    );

    hashSecret = await registry.sha256d(secret);
  });

  it("User1 should create ERC20 box", async () => {
    const amount = 30;

    const tx1 = await ERC20Token.approve(
      registry.address,
      amount,
      { from: user1 },
    );

    const tx2 = await registry.createBox(
      /* IERC20 _addrERC20          */ ERC20Token.address,
      /* address payable _recipient */ user2,
      /* uint _amount               */ amount,
      /* uint _hashSecret           */ hashSecret,
      /* uint _timelock             */ utcTimeSpan(1 * 60 * 60),
      { from: user1 },
    );

    const { event, args: { addrBox } } = tx2.logs[0];

    const HTLCBox = await IBox.at(addrBox);
    box1.resolve(HTLCBox);
  });

  it("User2 should create ERC20 box", async () => {
    const amount = 20;

    const tx1 = await ERC20Token.approve(
      registry.address,
      amount,
      { from: user2 },
    );

    const hashSecret = await registry.sha256d(secret);

    const tx2 = await registry.createBox(
      /* IERC20 _addrERC20          */ ERC20Token.address,
      /* address payable _recipient */ user1,
      /* uint _amount               */ amount,
      /* uint _hashSecret           */ hashSecret,
      /* uint _timelock             */ utcTimeSpan(1 * 60 * 60),
      { from: user2 },
    );

    const { event, args: { addrBox } } = tx2.logs[0];

    const HTLCBox = await IBox.at(addrBox);
    box2.resolve(HTLCBox);
  });

  it("User1 should open ERC20 box", async () => {
    const HTLCBox = await box2.createPromise();
    const recipient = await HTLCBox.recipient();

    const b0 = (await ERC20Token.balanceOf(user1)).toNumber();

    const tx1 = await HTLCBox.complete(secret, { from: user1 });

    const b1 = (await ERC20Token.balanceOf(user1)).toNumber();
    assert(
      b0 == b1 - 20,
      "Incorrect ballance",
    );
  });

  it("User2 should open ERC20 box", async () => {
    const HTLCBox1 = await box1.createPromise();
    const HTLCBox2 = await box2.createPromise();

    const recipient = await HTLCBox1.recipient();
    const scrt = await HTLCBox2.secret();

    const b0 = (await ERC20Token.balanceOf(user2)).toNumber();

    const tx1 = await HTLCBox1.complete(scrt, { from: user2 });

    const b1 = (await ERC20Token.balanceOf(user2)).toNumber();
    assert(
      b0 == b1 - 30,
      "Incorrect ballance",
    );
  });

  it("User should reject ERC20 box", async () => {
    const amount = 15;
    const scrt = Date.now();

    const b0 = (await ERC20Token.balanceOf(user1)).toNumber();

    const tx1 = await ERC20Token.approve(
      registry.address,
      amount,
      { from: user1 },
    );

    const hashSecret = await registry.sha256d(scrt);

    const tx2 = await registry.createBox(
      /* IERC20 _addrERC20          */ ERC20Token.address,
      /* address payable _recipient */ user2,
      /* uint _amount               */ amount,
      /* uint _hashSecret           */ hashSecret,
      /* uint _timelock             */ 0,
      { from: user1 },
    );

    const { event, args: { addrBox } } = tx2.logs[0];
    const HTLCBox = await IBox.at(addrBox);
    const founder = await HTLCBox.founder();

    const b1 = (await ERC20Token.balanceOf(user1)).toNumber();
    assert(
      b0 == b1 + amount,
      "Incorrect ballance",
    );

    const tx3 = await HTLCBox.reclaim({ from: user1 });

    const b2 = (await ERC20Token.balanceOf(user1)).toNumber();
    assert(
      b2 == b1 + amount,
      "Incorrect ballance",
    );
  });
});
