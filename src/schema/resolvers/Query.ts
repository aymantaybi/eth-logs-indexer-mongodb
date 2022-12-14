import mongoClient from '../../mongoClient';
import { GraphQLYogaError } from '@graphql-yoga/node';
import indexer from '../../indexer';
import { Log, Filter } from 'eth-logs-indexer/dist/interfaces';
import { AggregateOptions, Document, Filter as mongodbFilter, FindOptions } from 'mongodb';

const indexerDatabase = mongoClient.db('eth-logs-indexer');
const logsCollection = indexerDatabase.collection<Log>('logs');

async function filters(_: unknown, args: { ids: string[] }) {
  const { ids } = args;
  const query = ids.length ? { id: { $in: ids } } : {};
  const filters = await indexerDatabase.collection('filters').find(query).toArray();
  return filters;
}

async function executeQuery(_: unknown, args: { query: mongodbFilter<Log>; options?: FindOptions<Document> | undefined }) {
  const { query, options } = args;
  try {
    const result = await logsCollection.find({ ...query }, options || {}).toArray();
    return result;
  } catch (error: unknown) {
    throw new GraphQLYogaError(error as string);
  }
}

async function executeAggregation(_: unknown, args: { pipeline: Document[]; options: AggregateOptions }) {
  const { pipeline, options } = args;
  try {
    const result = await logsCollection.aggregate(pipeline, options || undefined).toArray();
    return result;
  } catch (error: unknown) {
    throw new GraphQLYogaError(error as string);
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

export default { filters, executeQuery, executeAggregation, logsCounts, chainId, logsPreview, status };
