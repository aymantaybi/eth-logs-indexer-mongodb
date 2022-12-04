import { pipe, map, filter } from '@graphql-yoga/node';
import { DecodedLog } from 'eth-logs-indexer';
import pubSub from '../../pubSub';

const newLogs = {
  subscribe: (_: unknown, args: { ids: string[] }) =>
    pipe(
      pubSub.subscribe('newLogs'),
      map((logs: DecodedLog[]) => logs.filter((log) => args.ids.includes(log.filterId))),
      filter((logs: DecodedLog[]) => logs.length > 0),
    ),
  resolve: (payload: unknown) => payload,
};

const statusUpdate = {
  subscribe: () => pipe(pubSub.subscribe('statusUpdate')),
  resolve: (payload: unknown) => payload,
};

export default { newLogs, statusUpdate };
