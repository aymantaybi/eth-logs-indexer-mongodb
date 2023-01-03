import { pipe, map, filter } from '@graphql-yoga/node';
import { Log } from 'eth-logs-indexer/dist/interfaces';
import pubSub from '../../pubSub';

const newLogs = {
  subscribe: (_: unknown, args: { ids: string[] }) =>
    pipe(
      pubSub.subscribe('newLogs'),
      map((logs: Log[]) => logs.filter((log) => args.ids.includes(log.filterId))),
      filter((logs: Log[]) => logs.length > 0),
    ),
  resolve: (payload: unknown) => payload,
};

const statusUpdate = {
  subscribe: () => pipe(pubSub.subscribe('statusUpdate')),
  resolve: (payload: unknown) => payload,
};

export default { newLogs, statusUpdate };
