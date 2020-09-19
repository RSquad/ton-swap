const fs = require('fs');
const path = require('path');

const loadPackage = (name) => {
  var contract = {};
  contract.abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, name + '.abi.json'), 'utf8'));
  contract.imageBase64 = fs.readFileSync(path.resolve(__dirname, name + '.tvc')).toString('base64');
  return contract;
};

const multisigPackage = loadPackage('SafeMultisigWallet');

module.exports = { multisigPackage };
