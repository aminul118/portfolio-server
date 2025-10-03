/* eslint-disable no-console */
import { Server } from 'http';
import app from './app';
import envVars, { envFile } from './app/config/env';
import seedSupperAdmin from './app/utils/seedSuperAdmin';
import { connectRedis } from './app/config/redis.config';

import connectDB from './app/config/mongodb.config';
import serverGracefulShutdown from './app/utils/serverGracefulShutdown';

let server: Server;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    // Start Express app
    server = app.listen(envVars.PORT, () => {
      console.log('🔐 ENV File ->', envFile);
      console.log(`✅ Server is running on port ${envVars.PORT}`);
    });

    await seedSupperAdmin();
    // Setup shutdown handlers
    serverGracefulShutdown(server);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

export default startServer;
