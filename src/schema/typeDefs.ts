const typeDefs = `
scalar JSON
scalar JSONObject

type BaseData {
  signature: String
  name: String
  inputs: JSONObject
}

type Log {
  address: String
  event: BaseData
  function: BaseData
  transaction: JSONObject
}

type Query {
  logs: [Log]
}

type Mutation {
  start(blockNumber: Int!): Boolean!
  stop: Boolean!
}

type Subscription {
  newLogs: [Log]
}
`;

export default typeDefs;
