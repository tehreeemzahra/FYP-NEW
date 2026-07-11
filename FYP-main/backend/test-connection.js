import 'dotenv/config';
import mongoose from 'mongoose';
import {
  configureAtlasDns,
  getMongoUri,
  getMongoConnectOptions,
  maskMongoUri,
  printAtlasTroubleshooting,
} from './src/lib/mongoAtlas.js';

configureAtlasDns();
const MONGODB_URI = getMongoUri();

if (!process.env.MONGODB_URI?.trim()) {
  console.error('❌ MONGODB_URI not found in backend/.env');
  console.error('Copy backend/.env.example to backend/.env and add your Atlas connection string.');
  process.exit(1);
}

console.log('Testing MongoDB Atlas connection...');
console.log('URI:', maskMongoUri(MONGODB_URI));

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, getMongoConnectOptions());
    console.log('✅ Connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nError details:');
    console.error('- Error name:', error.name);
    console.error('- Error code:', error.code);
    printAtlasTroubleshooting(MONGODB_URI);
    process.exit(1);
  }
}

testConnection();
