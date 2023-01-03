import { Log, Options, Filter } from 'eth-logs-indexer/dist/interfaces';
import { MongoClient } from 'mongodb';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) throw new Error('Missing MONGODB_URI env variable !');

const url = MONGODB_URI;

const mongoClient = new MongoClient(url);

export default mongoClient;

const indexerDatabase = mongoClient.db('eth-logs-indexer');

export const logsCollection = indexerDatabase.collection<Log>('logs');
export const filtersCollection = indexerDatabase.collection<Filter>('filters');
export const optionsCollection = indexerDatabase.collection<{ chainId: number; options: Options }>('options');
export const blockNumberCollection = indexerDatabase.collection<{ chainId: number; blockNumber: number }>('blockNumber');
