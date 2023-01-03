import Indexer from 'eth-logs-indexer';
import { Log } from 'eth-logs-indexer/dist/interfaces';
import pubSub from './pubSub';
import mongoClient from './mongoClient';
import { Filter, Load, Options, Save } from 'eth-logs-indexer/dist/interfaces';

const { HTTP_PROVIDER_HOST } = process.env;

if(!HTTP_PROVIDER_HOST) throw new Error('Missing HTTP_PROVIDER_HOST env variable !');

const host = HTTP_PROVIDER_HOST;

const indexerDatabase = mongoClient.db('eth-logs-indexer');

const logsCollection = indexerDatabase.collection<Log>('logs');
const filtersCollection = indexerDatabase.collection<any>('filters');
const optionsCollection = indexerDatabase.collection<{ chainId: number; options: Options }>('options');
const blockNumberCollection = indexerDatabase.collection<{ chainId: number; blockNumber: number }>('blockNumber');

const save: Save = {
  async logs(logs: Log[]) {
    await logsCollection.bulkWrite(
      logs.map((log) => ({
        replaceOne: {
          filter: {
            'transaction.blockNumber': log.transaction.blockNumber,
            'transaction.transactionIndex': log.transaction.transactionIndex,
            logIndex: log.logIndex,
          },
          replacement: log,
          upsert: true,
        },
      })),
    );
    pubSub.publish('newLogs', logs);
  },
  async filters(filters: Filter[]) {
    const chainId = indexer.chainId;
    const oldFilters = indexer.filters;
    const newFilters = filters.map((item) => ({ ...item, chainId }));
    if (oldFilters.length > newFilters.length) {
      const newFiltersIds = newFilters.map((newFilter) => newFilter.id);
      const removedFilters = oldFilters.filter((oldFilter) => !newFiltersIds.includes(oldFilter.id));
      const removedFiltersIds = removedFilters.map((removedFilter) => removedFilter.id);
      await filtersCollection.deleteMany({ id: { $in: removedFiltersIds } });
    } else if (oldFilters.length < newFilters.length) {
      const oldFiltersIds = oldFilters.map((oldFilter) => oldFilter.id);
      const addedFilters = newFilters.filter((newFilter) => !oldFiltersIds.includes(newFilter.id));
      await filtersCollection.insertMany(addedFilters);
    }
  },
  async options(options: Partial<Options>) {
    const chainId = indexer.chainId;
    await optionsCollection.updateOne({ chainId }, { $set: { chainId, options: { ...indexer.options, ...options } } }, { upsert: true });
  },
  async blockNumber(blockNumber: number) {
    const chainId = indexer.chainId;
    await blockNumberCollection.updateOne({ chainId }, { $set: { chainId, blockNumber } }, { upsert: true });
  },
};

const load: Load = {
  async filters() {
    const chainId = indexer.chainId;
    const documents = await filtersCollection.find({ chainId }).toArray();
    return documents;
  },
  async options() {
    const chainId = indexer.chainId;
    const document = await optionsCollection.findOne({ chainId });
    return document?.options || indexer.options;
  },
  async blockNumber() {
    const chainId = indexer.chainId;
    const document = await blockNumberCollection.findOne({ chainId });
    return document?.blockNumber || 0;
  },
};

const indexer = new Indexer({ host, load, save });

indexer.onIterationEnd(() => {
  pubSub.publish('statusUpdate', indexer.status());
});

export default indexer;
