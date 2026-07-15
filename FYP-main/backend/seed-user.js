import 'dotenv/config';
import mongoose from 'mongoose';
import {
  configureAtlasDns,
  getMongoUri,
  getMongoConnectOptions,
  maskMongoUri,
} from './src/lib/mongoAtlas.js';
import { Parent } from './src/models/Parent.js';
import { Child } from './src/models/Child.js';
import { makeUniqueLoginCode } from './src/lib/loginCode.js';

configureAtlasDns();

const PARENT = {
  name: 'anonymous parent',
  email: 'anonymous@gmail.com',
  password: '123456789',
};

const CHILDREN = [{ name: 'emre', age: 10 }];

async function seed() {
  const uri = getMongoUri();
  console.log('Connecting:', maskMongoUri(uri));
  await mongoose.connect(uri, getMongoConnectOptions());
  console.log('✅ Connected to', mongoose.connection.db.databaseName);

  let parent = await Parent.findOne({ email: PARENT.email }).select('+password');
  if (parent) {
    parent.name = PARENT.name;
    parent.password = PARENT.password;
    await parent.save();
    console.log('Updated existing parent:', PARENT.email);
  } else {
    parent = await Parent.create(PARENT);
    console.log('Created parent:', PARENT.email);
  }

  const existingChildren = await Child.find({ parentId: parent._id });
  const results = [];

  for (const draft of CHILDREN) {
    const match = existingChildren.find(
      (c) => c.name.trim().toLowerCase() === draft.name.toLowerCase(),
    );
    if (match) {
      match.age = draft.age;
      await match.save();
      results.push(match);
      console.log(`Updated child: ${match.name} (login code: ${match.loginCode})`);
    } else {
      const loginCode = await makeUniqueLoginCode();
      const child = await Child.create({
        name: draft.name,
        age: draft.age,
        loginCode,
        parentId: parent._id,
      });
      results.push(child);
      console.log(`Created child: ${child.name} (login code: ${child.loginCode})`);
    }
  }

  console.log('\n========== LOGIN DETAILS ==========');
  console.log('Parent login:');
  console.log('  Email:   ', PARENT.email);
  console.log('  Password:', PARENT.password);
  console.log('\nChild login:');
  for (const child of results) {
    console.log(`  Name: ${child.name}`);
    console.log(`  Age:  ${child.age}`);
    console.log(`  Code: ${child.loginCode}`);
  }
  console.log('===================================\n');

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
