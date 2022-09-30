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

enum AbiType {
  function
  constructor
  event
  fallback
}

enum StateMutabilityType {
  pure
  view
  nonpayable
  payable
}

type AbiInput {
  name: String
  type: String
  indexed: Boolean
  components: [AbiInput]
  internalType: String
}

type AbiOutput {
  name: String
  type: String
  components: [AbiOutput]
  internalType: String
}

type AbiItem {
  anonymous: Boolean
  constant: Boolean
  inputs: [AbiInput]
  name: String
  outputs: [AbiOutput]
  payable: Boolean
  stateMutability: StateMutabilityType
  type: AbiType
  gas: Int
}

type JsonInterface { 
  event: AbiItem!
  function: AbiItem
}

type Filter {
  address: String
  jsonInterface: JsonInterface
  tag: String
}

type Query {
  logs: [Log]
  filters(tags: [String]): [Filter]
}

input AbiInputInput {
  name: String
  type: String
  indexed: Boolean
  components: [AbiInputInput]
  internalType: String
}

input AbiOutputInput {
  name: String
  type: String
  components: [AbiOutputInput]
  internalType: String
}

input AbiItemInput {
  anonymous: Boolean
  constant: Boolean
  inputs: [AbiInputInput]
  name: String
  outputs: [AbiOutputInput]
  payable: Boolean
  stateMutability: StateMutabilityType
  type: AbiType
  gas: Int
}

input JsonInterfaceInput { 
  event: AbiItemInput!
  function: AbiItemInput
}

input FilterInput {
  address: String
  jsonInterface: JsonInterfaceInput
}

type Mutation {
  start(blockNumber: Int): Boolean!
  stop: Boolean!
  addFilters(filters: [FilterInput!]!): [String]
  removeFilters(tags: [String!]!): [String]
}

type Subscription {
  newLogs: [Log]
}
`;

export default typeDefs;
