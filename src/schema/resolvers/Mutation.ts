import { GraphQLYogaError } from '@graphql-yoga/node';
import { Filter } from 'eth-logs-indexer';
import { v4 as uuidv4 } from 'uuid';
import indexer from '../../indexer';
import mongoClient from '../../mongoClient';
import { validateFilters } from '../../helpers/inputValidation';

async function start(_: any, args: { blockNumber: number }) {
  if (indexer.filters?.length == 0 || indexer.isRunning()) return false;
  const { blockNumber } = args;
  await indexer.start(blockNumber);
  return true;
}

async function stop() {
  indexer.stop();
  return true;
}

async function addFilters(_: any, args: { filters: Filter[] }) {
  const { filters } = args;
  const errors = validateFilters(filters);
  if (errors.length) throw new GraphQLYogaError(`Please fix the following errors in your filters : ${JSON.stringify(errors)} `);
  const newFilters: Filter[] = [];
  const oldFilters = indexer.filters || [];
  for (const filter of filters) {
    const tag = uuidv4();
    newFilters.push({ tag, ...filter });
  }
  try {
    await mongoClient.db('eth-logs-indexer:parameters').collection('filters').insertMany(newFilters);
  } catch (error) {
    throw new GraphQLYogaError(error as any);
  }
  indexer.setFilters(newFilters.concat(oldFilters));
  const tags = newFilters.map((filter) => filter.tag);
  console.log(tags);
  return tags;
}

async function removeFilters(_: any, args: { tags: string[] }) {
  const { tags } = args;
  await mongoClient
    .db('eth-logs-indexer:parameters')
    .collection('filters')
    .deleteMany({ tag: { $in: tags } });
  const filters: Filter[] = (indexer.filters || []).filter((item) => !tags.includes(item.tag as string));
  indexer.setFilters(filters);
  return tags;
}

export default { start, stop, addFilters, removeFilters };
