import dns from 'dns';

export const DB_NAME = process.env.MONGODB_DB_NAME || 'cyberquest';

export function configureAtlasDns() {
  const uri = process.env.MONGODB_URI?.trim() ?? '';
  if (!uri.startsWith('mongodb+srv://')) return;

  const servers = process.env.MONGODB_DNS_SERVERS
    ? process.env.MONGODB_DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean)
    : ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

  dns.setServers(servers);
}

export function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) return uri;
  return `mongodb://localhost:27017/${DB_NAME}`;
}

export function getMongoConnectOptions() {
  return {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
    family: 4,
  };
}

export function maskMongoUri(uri) {
  return uri.replace(/:[^:@]+@/, ':****@');
}

export function getMongoUserFromUri(uri) {
  const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:@/]+)/);
  return match?.[1] ?? 'unknown';
}

export function printAtlasTroubleshooting(uri) {
  const user = getMongoUserFromUri(uri);
  console.error('\n🔍 MongoDB Atlas troubleshooting:');
  console.error('1. Create or resume a cluster at https://cloud.mongodb.com');
  console.error('2. Database Access → create a user with read/write on cyberquest');
  console.error('3. Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)');
  console.error('4. Connect → Drivers → copy the Node.js connection string into backend/.env');
  console.error(`5. Confirm username/password in .env (current user: ${user})`);
  console.error('   → Atlas → Database Access → verify user exists and password matches');
  console.error('   → Password special characters must be URL-encoded in .env (@ → %40)');
  console.error('6. If you see querySrv errors, use the standard (non-SRV) connection string from Atlas');
  console.error('7. Run: npm run test-connection');
}
