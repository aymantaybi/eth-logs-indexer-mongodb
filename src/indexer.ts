import Indexer, { Filter, DecodedLog } from 'eth-logs-indexer';
import pubSub from './pubSub';
import mongoClient from './mongoClient';

const { WEBSOCKET_PROVIDER_HOST } = process.env;

const host = WEBSOCKET_PROVIDER_HOST!;

const save = async (logs: DecodedLog[]) => {
  const set = new Set();
  for (const log of logs) {
    set.add(log.filter.tag);
  }
  const tags = [...set] as string[];

  await Promise.all(
    tags.map((tag) =>
      mongoClient
        .db('eth-logs-indexer:logs')
        .collection(`tag:${tag}`)
        .insertMany(logs.filter((log) => log.filter.tag == tag)),
    ),
  );

  pubSub.publish('newLogs', logs);
};

const latestBlockNumber = {
  load: async () => {
    const document: any = await mongoClient.db('eth-logs-indexer:parameters').collection('latestBlockNumber').findOne({ chainId: indexer.chainId });
    const blockNumber = document?.blockNumber ?? 0;
    return blockNumber;
  },
  save: async (blockNumber: number) => {
    await mongoClient
      .db('eth-logs-indexer:parameters')
      .collection('latestBlockNumber')
      .updateOne({ chainId: indexer.chainId }, { $set: { blockNumber: blockNumber } }, { upsert: true });
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
