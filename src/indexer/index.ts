import Indexer, { Filter } from 'eth-logs-indexer';
import pubSub from '../pubSub';

const { WEBSOCKET_PROVIDER_HOST } = process.env;

const host = WEBSOCKET_PROVIDER_HOST!;

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
  save,
  latestBlockNumber,
  options,
});

export default indexer;
