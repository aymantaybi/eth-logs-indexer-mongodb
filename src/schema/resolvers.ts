import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
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
  },
  Mutation: {
    start: async (_: any, args: { blockNumber: number }) => {
      const { blockNumber } = args;
      await indexer.start(blockNumber);
      return true;
    },
    stop: async (_: any, args: any) => {
      indexer.stop();
      return true;
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
