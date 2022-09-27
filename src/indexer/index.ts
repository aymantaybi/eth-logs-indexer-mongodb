import Indexer, { Filter } from 'eth-logs-indexer';
import pubSub from '../pubSub';

const { WEBSOCKET_PROVIDER_HOST } = process.env;

const host = WEBSOCKET_PROVIDER_HOST!;

const filters: Filter[] = [
  {
    address: '0x32950db2a7164ae833121501c797d79e7b79d74c',
    jsonInterface: {
      event: {
        anonymous: false,
        inputs: [
          {
            internalType: 'uint256',
            indexed: true,
            name: '_axieId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            indexed: true,
            name: '_breedCount',
            type: 'uint256',
          },
        ],
        name: 'AxieBreedCountUpdated',
        type: 'event',
      },
    },
  },
];

const save = async (logs: any[]) => {
  pubSub.publish('newLogs', logs);
  console.log(JSON.stringify(logs, null, 4));
};

let currentBlockNumber = 0;

const latestBlockNumber = {
  load: async () => {
    return currentBlockNumber;
  },
  save: async (blockNumber: number) => {
    currentBlockNumber = blockNumber;
  },
};

const options = {
  include: {
    transaction: ['blockNumber', 'from', 'hash', 'transactionIndex'],
  },
};

const indexer = new Indexer({
  host,
  filters,
  save,
  latestBlockNumber,
  options,
});

export default indexer;
