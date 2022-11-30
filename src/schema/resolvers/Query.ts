import mongoClient from '../../mongoClient';
import { GraphQLYogaError } from '@graphql-yoga/node';
import indexer from '../../indexer';

async function filters(_: any, args: { tags: string[] }) {
  const { tags } = args;
  const query = tags.length ? { tag: { $in: tags } } : {};
  const filters = await mongoClient.db('eth-logs-indexer:parameters').collection('filters').find(query).toArray();
  return filters;
}

async function executeQuery(_: any, args: { tag: string; query: object; options: object }) {
  const { tag, query, options } = args;
  try {
    const result = await mongoClient
      .db('eth-logs-indexer:logs')
      .collection(`tag:${tag}`)
      .find(query || {}, options || {})
      .toArray();
    console.log({ result });
    return result;
  } catch (error: any) {
    throw new GraphQLYogaError(error);
  }
}

async function logsCounts(_: any, args: { tags: string[] }) {
  const { tags } = args;
  try {
    const result = await Promise.all(tags.map((tag) => mongoClient.db('eth-logs-indexer:logs').collection(`tag:${tag}`).estimatedDocumentCount()));
    return result;
  } catch (error: any) {
    throw new GraphQLYogaError(error);
  }
}

function chainId() {
  return indexer.chainId;
}

export default { filters, executeQuery, logsCounts, chainId };
