/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import envVars from './env';
import { logger } from '../utils/logger';

const connectDB = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    logger.info('✅ Connected to MongoDB');
  } catch (error: any) {
    logger.error(' MongoDB connection failed', error.message);
  }
};

export default connectDB;
