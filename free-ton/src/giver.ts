export
const nodeSeGiverAddress =
  '0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94';

export
const nodeSeGiverAbi = {
	'ABI version': 1,
	functions: [{
    name: 'constructor',
    inputs: [],
    outputs: [],
  }, {
    name: 'sendGrams',
    inputs: [
      { name: 'dest', type: 'address' },
      { name: 'amount', type: 'uint64' },
    ],
    outputs: [],
  }],
	events: [],
	data: [],
};

export
async function get_grams_from_giver(client, dest, amount) {
  const { contracts, queries } = client;
  const result = await contracts.run({
    address: nodeSeGiverAddress,
    functionName: 'sendGrams',
    nodeSeGiverAbi,
    input: { dest, amount },
    keyPair: null,
  });

  const wait = await queries.accounts.waitFor({
    id: { eq: dest },
    balance: { gt: "0" }
  },
    'id balance',
  );
};
