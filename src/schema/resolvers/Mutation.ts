import { GraphQLYogaError } from '@graphql-yoga/node';
import { Filter } from 'eth-logs-indexer';
import { v4 as uuidv4 } from 'uuid';
import indexer from '../../indexer';
import mongoClient from '../../mongoClient';
import { validateFilters } from '../../helpers/inputValidation';
import pubSub from '../../pubSub';

const parametersDatabase = mongoClient.db('eth-logs-indexer:parameters');
const logsDatabase = mongoClient.db('eth-logs-indexer:logs');

async function start(_: unknown, args: { blockNumber: number }) {
  if (indexer.filters?.length == 0 || indexer.isRunning()) return false;
  const { blockNumber } = args;
  await indexer.start(blockNumber);
  pubSub.publish('statusUpdate', indexer.status());
  return true;
}

async function stop() {
  await indexer.stop();
  pubSub.publish('statusUpdate', indexer.status());
  return true;
}

async function addFilters(_: unknown, args: { filters: Filter[] }) {
  const { filters } = args;
  const errors = validateFilters(filters);
  if (errors.length) throw new GraphQLYogaError(`Please fix the following errors in your filters : ${JSON.stringify(errors)} `);
  const newFilters: Filter[] = [];
  const oldFilters = indexer.filters || [];
  for (const filter of filters) {
    const id = filter.id || uuidv4();
    newFilters.push({ ...filter, id });
  }
  try {
    await parametersDatabase.collection('filters').insertMany(newFilters);
  } catch (error) {
    throw new GraphQLYogaError(error as string);
  }
  indexer.setFilters(newFilters.concat(oldFilters));
  const ids = newFilters.map((filter) => filter.id);
  pubSub.publish('statusUpdate', indexer.status());
  return ids;
}

async function removeFilters(_: unknown, args: { ids: string[] }) {
  const { ids } = args;
  await parametersDatabase.collection('filters').deleteMany({ id: { $in: ids } });
  await Promise.all(ids.map((id) => logsDatabase.collection(`id:${id}`).drop()));
  const filters: Filter[] = (indexer.filters || []).filter((item) => !ids.includes(item.id as string));
  indexer.setFilters(filters);
  pubSub.publish('statusUpdate', indexer.status());
  return ids;
}

export default { start, stop, addFilters, removeFilters };
