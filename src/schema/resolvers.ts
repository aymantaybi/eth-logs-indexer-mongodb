import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import { Filter } from 'eth-logs-indexer';
import { v4 as uuidv4 } from 'uuid';
import pubSub from '../pubSub';
import indexer from '../indexer';

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
    filters: (_: any, args: { tags: string[] }) => {
      return (indexer.filters || []).filter((filter) => args.tags.includes(filter.tag as string));
    },
  },
  Mutation: {
    start: async (_: any, args: { blockNumber: number }) => {
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
      indexer.setFilters(newFilters.concat(oldFilters));
      const tags = newFilters.map((filter) => filter.tag);
      console.log(tags);
      return tags;
    },
    removeFilters: async (_: any, args: { tags: string[] }) => {
      const { tags } = args;
      const filters: Filter[] = (indexer.filters || []).filter((item) => !tags.includes(item.tag as string));
      indexer.setFilters(filters);
      return tags;
    },
  },
  Subscription: {
    newLogs: {
      subscribe: () => pubSub.subscribe('newLogs'),
      resolve: (payload: any) => payload,
    },
  },
};

export default resolvers;
