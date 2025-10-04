import { CorsOptions } from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'https://aminuldev.site',
  'https://www.aminuldev.site',
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(
      (allowed) =>
        origin.startsWith(allowed.replace('www.', '')) || origin === allowed,
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export default corsOptions;
