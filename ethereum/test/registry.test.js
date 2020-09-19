const RegistryContract = artifacts.require("Registry");
const ERC20TokenContract = artifacts.require("ERC20Token");

const BN = RegistryContract.web3.utils.BN;


contract("Registry", accounts => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  it("sha256d hashSecret", async () => {
    const fixtures = [{
      secret: new BN(
        '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b', 16,
      ),
      hashSecret: new BN(
        '1690316bcf298df9b9f082e155979c90a5cfd663c6aa9117ebf16bf49ee16b6e', 16,
      ),
    }];

    const registry = await RegistryContract.deployed();

    for(let i = 0; i < fixtures.length; i++) {
      const { secret, hashSecret } = fixtures[i];
      const hash = await registry.sha256d(secret);

      assert(
        hashSecret.eq(hash),
        `Fixture ${ i + 1 } failed`,
      );
    }
  });

  it("should create ERC20 box", async () => {
    const registry = await RegistryContract.deployed();
    const ERC20Token = await ERC20TokenContract.deployed();

    const amount = 100;
    const tx1 = await ERC20Token.transfer(
      user2,
      amount,
      { from: admin },
    );

    const tx2 = await ERC20Token.approve(
      registry.address,
      amount,
      { from: user2 },
    );

    const allowed = (await ERC20Token.allowance(
      user2,
      registry.address
    )).toNumber();
    // console.log({ allowed });
    assert(
      allowed == amount,
      "Incorrect amount allowed",
    );

    const tx = await registry.createBox(
      /* IERC20 _addrERC20          */ ERC20Token.address,
      /* address payable _recipient */ user1,
      /* uint _amount               */ 1, // amount,
      /* uint _hashSecret           */ 1,
      /* uint _timelock             */ 100000,
      { from: user2 },
    );

    const { event, args: { addrBox } } = tx.logs[0];
    // console.log({ event, addrBox });
    assert(
      event == 'BoxCreated',
      "Have no BoxCreated event",
    );
    assert(
      addrBox,
      "Have no Box address",
    );
  });
});
