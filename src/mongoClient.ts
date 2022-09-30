import { MongoClient } from 'mongodb';

const { MONGODB_URI } = process.env;

const url = MONGODB_URI!;

const mongoClient = new MongoClient(url);

export default mongoClient;