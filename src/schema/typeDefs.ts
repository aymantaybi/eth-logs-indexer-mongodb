const typeDefs = `
scalar JSON
scalar JSONObject

type BaseData {
  signature: String
  name: String
  inputs: JSONObject
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

type OptionsInclude {
  transaction: [String]
}

type FilterOptions {
  include: OptionsInclude
}

type Filter {
  chainId: Int
  id: String
  tag: String
  address: String
  jsonInterface: JsonInterface
  options: FilterOptions
}

type Log {
  logIndex: Int
  address: String
  filterId: String
  event: BaseData
  function: BaseData
  transaction: JSONObject
}

type IndexerOptionsType { 
  delay: Int
  maxBlocks: Int
  confirmationBlocks: Int
  autoStart: Boolean
}

type Query {
  filters(ids: [String]): JSON
  executeQuery(query: JSONObject, options: JSONObject): JSON
  executeAggregation(pipeline: JSON, options: JSONObject): JSON
  logsCounts(ids: [String!]!): [Int]
  chainId: Int
  logsPreview(filter: FilterInput, transactionHash: String): JSON
  status: JSON
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

input OptionsIncludeInput {
  transaction: [String]
  block: [String]
}

input FilterOptionsInput {
  include: OptionsIncludeInput
}

input FilterInput {
  chainId: Int
  id: String
  tag: String
  address: String
  jsonInterface: JsonInterfaceInput
  options: FilterOptionsInput
}

input IndexerOptionsInput { 
  delay: Int
  maxBlocks: Int
  confirmationBlocks: Int
  autoStart: Boolean
}

type Mutation {
  start(blockNumber: Int): Boolean!
  stop: Boolean!
  addFilters(filters: [FilterInput!]!): [String]
  removeFilters(ids: [String!]!): [String]
  tagFilter(id: String!, tag: String!): JSONObject
  setOptions(options: IndexerOptionsInput): IndexerOptionsType
}

type Subscription {
  newLogs(ids: [String!]!): [Log]
  statusUpdate: JSON
}
`;

export default typeDefs;
