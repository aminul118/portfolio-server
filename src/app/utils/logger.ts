/* eslint-disable no-console */
import envVars from '../config/env';

type LogType = 'log' | 'error' | 'warn';

const logger = (type: LogType, message: string, meta?: unknown) => {
  if (envVars.NODE_ENV !== 'development') return;

  const timestamp = new Date().toISOString();

  switch (type) {
    case 'error':
      console.error(`❌ [${timestamp}] ${message}`, meta ?? '');
      break;

    case 'warn':
      console.warn(`⚠️ [${timestamp}] ${message}`, meta ?? '');
      break;

    default:
      console.log(`✅ [${timestamp}] ${message}`, meta ?? '');
  }
};

export default logger;
