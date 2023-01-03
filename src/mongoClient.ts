import { MongoClient } from 'mongodb';

const { MONGODB_URI } = process.env;

if(!MONGODB_URI) throw new Error('Missing MONGODB_URI env variable !');

const url = MONGODB_URI;

const mongoClient = new MongoClient(url);

export default mongoClient;