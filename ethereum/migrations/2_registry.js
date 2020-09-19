const RegistryContract = artifacts.require("Registry");
const ERC20TokenContract = artifacts.require("ERC20Token");

module.exports = function(deployer, network, accounts) {
  // deployment steps
  deployer.deploy(RegistryContract);
  deployer.deploy(ERC20TokenContract,
    /* string memory _name */ 'tERC20',
    /* string memory _symbol */ 'tERC20',
    /* uint _volume */ '100'+'000'+'000'+'000'+'000'+'000'+'000'+'000',
    { from: accounts[0] },
  );
};
