import * as dotenv from 'dotenv';
dotenv.config();
import { createServer } from '@graphql-yoga/node';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Filter } from 'eth-logs-indexer';
import schema from './schema';
import indexer from './indexer';
import mongoClient from './mongoClient';

async function main() {
  const yogaApp = createServer({
    schema,
    graphiql: {
      subscriptionsProtocol: 'WS',
    },
  });

  const httpServer = await yogaApp.start();

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: yogaApp.getAddressInfo().endpoint,
  });

  useServer(
    {
      execute: (args: any) => args.rootValue.execute(args),
      subscribe: (args: any) => args.rootValue.subscribe(args),
      onSubscribe: async (ctx, msg) => {
        const { schema, execute, subscribe, contextFactory, parse, validate } = yogaApp.getEnveloped(ctx);
        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
          contextValue: await contextFactory(),
          rootValue: {
            execute,
            subscribe,
          },
        };
        const errors = validate(args.schema, args.document);
        if (errors.length) return errors;
        return args;
      },
    },
    wsServer,
  );
}

main()
  .then(async () => {
    await mongoClient.connect();
    const collection = mongoClient.db('eth-logs-indexer:parameters').collection('filters');
    await collection.createIndex({ id: 1 }, { unique: true });
    const filters = await collection.find({}).toArray();
    await indexer.initialize(filters as unknown as Filter[]);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
