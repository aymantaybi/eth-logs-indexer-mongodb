import Indexer, { DecodedLog } from 'eth-logs-indexer';
import pubSub from './pubSub';
import mongoClient from './mongoClient';

const { WEBSOCKET_PROVIDER_HOST } = process.env;

const host = WEBSOCKET_PROVIDER_HOST!;

const save = async (logs: DecodedLog[]) => {
  const set = new Set();
  for (const log of logs) {
    set.add(log.filterId);
  }
  const ids = [...set] as string[];

  await Promise.all(
    ids.map((id) =>
      mongoClient
        .db('eth-logs-indexer:logs')
        .collection(`id:${id}`)
        .insertMany(logs.filter((log) => log.filterId == id)),
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

const indexer = new Indexer({
  host,
  save,
  latestBlockNumber,
});

indexer.onIterationEnd(() => {
  pubSub.publish('statusUpdate', indexer.status());
});

export default indexer;
