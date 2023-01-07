
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`: server port, ex: `4000`

`HTTP_PROVIDER_HOST`: JSON-RPC node URL, ex: `http://172.17.0.1:8545`

`MONGODB_URI`: MongoDB instance URL, ex: `mongodb://host.docker.internal:27017`


## Build

```bash
$ DOCKER_DEFAULT_PLATFORM=linux/amd64 docker build -t aymantaybi/eth-logs-indexer-mongodb:latest .
```

## Run

```bash
$ docker run -p 4000:4000 --name indexer -e PORT=4000 -e MONGODB_URI=mongodb://host.docker.internal:27017 -e HTTP_PROVIDER_HOST=http://172.17.0.1:8545 -d aymantaybi/eth-logs-indexer-mongodb
```

## Changelog

### [1.4.5] - 2023-01-08

#### Added

- `setOptions` Mutation.
- `executeAggregation` Query.
- `autoStart` Option.

#### Changed

- `executeQuery` Mutation: remove `chainId` & `filterId` from required mutation arguments.

### [1.4.4] - 2023-01-03

#### Added

- Create logs collection compound & unique index `{ 'transaction.blockNumber': 1, 'transaction.transactionIndex': 1, logIndex: 1 }` at server startup.

#### Changed

- Use `bulkWrite` with `replaceOne` operations instead of `insertMany` for logs saving, useful if you want to restart the indexer at an earlier block number and avoid adding duplicate logs.

#### Removed

- Set options at server startup.