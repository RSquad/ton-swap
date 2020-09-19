const ERC20TokenContract = artifacts.require("ERC20Token");

contract("ERC20Token", accounts => {
  const emitent = accounts[1];

  it("should have some amount of ERC20 for testing", async () => {
    const ERC20Token = await ERC20TokenContract.deployed();

    const totalSupplyBN = await ERC20Token.totalSupply();
    const totalSupply = totalSupplyBN.toNumber();
    // console.log('totalSupply:', totalSupply);

    assert(
      totalSupply > 0,
      "You have not ERC20 tokens for testing",
    );
  });
});
