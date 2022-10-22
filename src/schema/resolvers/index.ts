import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';
import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';

const resolvers = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Query,
  Mutation,
  Subscription,
};

export default resolvers;
