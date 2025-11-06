/* eslint-disable no-console */
import { CorsOptions } from 'cors';
import envVars from './env';

const allowedOrigins = [
  'http://localhost:3000',
  'https://aminuldev.site',
  'https://www.aminuldev.site',
];

/**
 * Production-ready CORS configuration.
 * Dynamically checks allowed origins and supports credentials.
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like server-to-server or curl)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '');

    const isAllowed = allowedOrigins.some((allowed) => {
      const normalizedAllowed = allowed
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '');
      return normalizedOrigin === normalizedAllowed;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      if (envVars.NODE_ENV === 'development') {
        console.warn(`🚫 Blocked CORS request from origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

export default corsOptions;
