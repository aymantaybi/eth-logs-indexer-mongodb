import * as dotenv from 'dotenv';
dotenv.config();
import { createServer } from '@graphql-yoga/node';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import schema from './schema';
import indexer from './indexer';
import mongoClient, { filtersCollection, logsCollection } from './mongoClient';

const { PORT } = process.env;

if (!PORT) throw new Error('Missing PORT env variable !');

const port = Number(PORT);

async function main() {
  const yogaApp = createServer({
    port,
    schema,
    cors: {
      origin: '*',
    },
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
    await logsCollection.createIndex({ filterId: 1 });
    await filtersCollection.createIndex({ chainId: 1 });
    if ((await logsCollection.indexExists('transaction.blockNumber_1_transaction.transactionIndex_1_logIndex_1')) === false) {
      await logsCollection.createIndex({ 'transaction.blockNumber': 1, 'transaction.transactionIndex': 1, logIndex: 1 }, { unique: true });
    }
    if ((await filtersCollection.indexExists('id_1')) === false) {
      await filtersCollection.createIndex({ id: 1 }, { unique: true });
    }
    await indexer.initialize();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
