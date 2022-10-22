import { pipe, map, filter } from '@graphql-yoga/node';
import pubSub from '../../pubSub';

const newLogs = {
  subscribe: (_: any, args: { tags: string[] }) =>
    pipe(
      pubSub.subscribe('newLogs'),
      map((logs: any[]) => logs.filter((log) => args.tags.includes(log.filter.tag))),
      filter((logs: any[]) => logs.length > 0),
    ),
  resolve: (payload: any) => payload,
};

export default { newLogs };
