import { GraphQLYogaError } from '@graphql-yoga/node';
import { Filter } from 'eth-logs-indexer/dist/interfaces';
import { v4 as uuidv4 } from 'uuid';
import indexer from '../../indexer';
import { filtersCollection } from '../../mongoClient';
import { validateFilters } from '../../helpers/inputValidation';
import pubSub from '../../pubSub';

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
  try {
    const newFilters = filters.map((item) => ({ ...item, id: item.id || uuidv4() }));
    const oldFilters = indexer.filters;
    await indexer.setFilters(newFilters.concat(oldFilters));
    pubSub.publish('statusUpdate', indexer.status());
    return newFilters.map((item) => item.id);
  } catch (error) {
    throw new GraphQLYogaError(error as string);
  }
}

async function removeFilters(_: unknown, args: { ids: string[] }) {
  const { ids } = args;
  try {
    const oldFilters = indexer.filters;
    const newFilters = oldFilters.filter((item) => !ids.includes(item.id));
    await indexer.setFilters(newFilters);
    pubSub.publish('statusUpdate', indexer.status());
    return ids;
  } catch (error) {
    throw new GraphQLYogaError(error as string);
  }
}

async function tagFilter(_: unknown, args: { id: string; tag: string }) {
  const { id, tag } = args;
  await filtersCollection.updateOne({ id }, { $set: { tag } });
  return { id, tag };
}

export default { start, stop, addFilters, removeFilters, tagFilter };
