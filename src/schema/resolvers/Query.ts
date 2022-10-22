import mongoClient from '../../mongoClient';

async function logs() {
  return [
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
  ];
}

async function filters(_: any, args: { tags: string[] }) {
  const { tags } = args;
  const filters = await mongoClient
    .db('eth-logs-indexer:parameters')
    .collection('filters')
    .find({ tag: { $in: tags } })
    .toArray();
  return filters;
}

export default { logs, filters };
