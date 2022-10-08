import { pipe, map, filter } from '@graphql-yoga/node';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Filter } from 'eth-logs-indexer';
import { v4 as uuidv4 } from 'uuid';
import pubSub from '../pubSub';
import indexer from '../indexer';
import mongoClient from '../mongoClient';

const resolvers = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Query: {
    logs: () => [
      {
        address: 'String',
        event: {
          signature: 'String',
          name: 'String',
          inputs: {},
        },
        function: {
          signature: 'String',
          name: 'String',
          inputs: {},
        },
        transaction: {},
      },
    ],
    filters: async (_: any, args: { tags: string[] }) => {
      const { tags } = args;
      const filters = await mongoClient
        .db('eth-logs-indexer:parameters')
        .collection('filters')
        .find({ tag: { $in: tags } })
        .toArray();
      return filters;
    },
  },
  Mutation: {
    start: async (_: any, args: { blockNumber: number }) => {
      if (indexer.isRunning()) return false;
      const { blockNumber } = args;
      await indexer.start(blockNumber);
      return true;
    },
    stop: async () => {
      indexer.stop();
      return true;
    },
    addFilters: async (_: any, args: { filters: Filter[] }) => {
      const { filters } = args;
      const newFilters: Filter[] = [];
      const oldFilters = indexer.filters || [];
      for (const filter of filters) {
        const tag = uuidv4();
        newFilters.push({ tag, ...filter });
      }
      await mongoClient.db('eth-logs-indexer:parameters').collection('filters').insertMany(newFilters);
      indexer.setFilters(newFilters.concat(oldFilters));
      const tags = newFilters.map((filter) => filter.tag);
      console.log(tags);
      return tags;
    },
    removeFilters: async (_: any, args: { tags: string[] }) => {
      const { tags } = args;
      await mongoClient
        .db('eth-logs-indexer:parameters')
        .collection('filters')
        .deleteMany({ tag: { $in: tags } });
      const filters: Filter[] = (indexer.filters || []).filter((item) => !tags.includes(item.tag as string));
      indexer.setFilters(filters);
      return tags;
    },
  },
  Subscription: {
    newLogs: {
      subscribe: (_: any, args: { tags: string[] }) =>
        pipe(
          pubSub.subscribe('newLogs'),
          map((logs: any[]) => logs.filter((log) => args.tags.includes(log.filter.tag))),
          filter((logs: any[]) => logs.length > 0),
        ),
      resolve: (payload: any) => payload,
    },
  },
};

export default resolvers;
