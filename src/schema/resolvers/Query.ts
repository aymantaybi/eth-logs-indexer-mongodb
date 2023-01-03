import mongoClient from '../../mongoClient';
import { GraphQLYogaError } from '@graphql-yoga/node';
import indexer from '../../indexer';
import { Log, Filter } from 'eth-logs-indexer/dist/interfaces';

const indexerDatabase = mongoClient.db('eth-logs-indexer');
const logsCollection = indexerDatabase.collection<Log>('logs');

async function filters(_: unknown, args: { ids: string[] }) {
  const { ids } = args;
  const query = ids.length ? { id: { $in: ids } } : {};
  const filters = await indexerDatabase.collection('filters').find(query).toArray();
  return filters;
}

async function executeQuery(_: unknown, args: { id: string; query: object; options: object }) {
  const { id, query, options } = args;
  try {
    const result = await logsCollection.find({ ...query, filterId: id }, options || {}).toArray();
    return result;
  } catch (error: any) {
    throw new GraphQLYogaError(error);
  }
}

async function logsCounts(_: unknown, args: { ids: string[] }) {
  const { ids } = args;
  try {
    const result = await Promise.all(ids.map((id) => logsCollection.countDocuments({ filterId: id })));
    return result;
  } catch (error: any) {
    throw new GraphQLYogaError(error);
  }
}

function chainId() {
  return indexer.chainId;
}

async function logsPreview(_: unknown, args: { filter: Filter; transactionHash: string }) {
  const { filter, transactionHash } = args;
  const logsPreview = await indexer.previewLogs(filter, transactionHash);
  return logsPreview;
}

async function status() {
  return indexer.status();
}

export default { filters, executeQuery, logsCounts, chainId, logsPreview, status };
