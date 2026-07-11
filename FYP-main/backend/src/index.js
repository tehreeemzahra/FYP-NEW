import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import parentRoutes from './routes/parent.js';
import childRoutes from './routes/child.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settings.js';
import {
  configureAtlasDns,
  getMongoUri,
  getMongoConnectOptions,
  maskMongoUri,
  printAtlasTroubleshooting,
} from './lib/mongoAtlas.js';

const PORT = process.env.PORT || 5000;
configureAtlasDns();
const MONGODB_URI = getMongoUri();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/child', childRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.db.databaseName);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

async function connectWithRetry(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to MongoDB Atlas... (Attempt ${i + 1}/${retries})`);
      console.log('URI:', maskMongoUri(MONGODB_URI));

      await mongoose.connect(MONGODB_URI, getMongoConnectOptions());
      
      return true; // Connection successful
    } catch (error) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('\n❌ All connection attempts failed');
        printAtlasTroubleshooting(MONGODB_URI);
        return false;
      }
    }
  }
}

async function start() {
  // Start HTTP server first so localhost:5000 responds
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Mobile devices: use your PC LAN IP, e.g. http://<your-ip>:${PORT}`);
  });

  // Connect to MongoDB with retry logic
  const connected = await connectWithRetry();
  
  if (!connected) {
    console.error('\n⚠️ Server is running but MongoDB is not connected.');
    console.error('⚠️ API endpoints may not work until MongoDB connection is established.');
    console.error('⚠️ Fix the connection issues above and restart the server.');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

start();
