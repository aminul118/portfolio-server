import dotenv from 'dotenv';
import path from 'path';
import { EnvConfig } from '../types';
import getEnv from '../helpers/getEnv';

const isProd = process.env.NODE_ENV === 'production';
export const envFile = isProd ? '.env.production' : '.env.local';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const loadEnvVariables = (): EnvConfig => ({
  PORT: getEnv('PORT'),
  DB_URL: getEnv('DB_URL'),
  NODE_ENV: getEnv('NODE_ENV') as 'development' | 'production',
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES: getEnv('JWT_ACCESS_EXPIRES'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES: getEnv('JWT_REFRESH_EXPIRES'),
  BCRYPT_SALT_ROUND: Number(getEnv('BCRYPT_SALT_ROUND')),
  SUPER_ADMIN_EMAIL: getEnv('SUPER_ADMIN_EMAIL'),
  SUPER_ADMIN_PASSWORD: getEnv('SUPER_ADMIN_PASSWORD'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL'),
  EXPRESS_SESSION_SECRET: getEnv('EXPRESS_SESSION_SECRET'),
  FRONTEND_URL: getEnv('FRONTEND_URL'),
  ADMIN_NAME: getEnv('ADMIN_NAME'),
  ADMIN_EMAIL: getEnv('ADMIN_EMAIL'),

  CLOUDINARY: {
    CLOUDINARY_NAME: getEnv('CLOUDINARY_NAME'),
    CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
  },
  EMAIL_SENDER: {
    SMTP_HOST: getEnv('SMTP_HOST'),
    SMTP_PORT: Number(getEnv('SMTP_PORT')),
    SMTP_USER: getEnv('SMTP_USER'),
    SMTP_PASS: getEnv('SMTP_PASS'),
    SMTP_FORM: getEnv('SMTP_FORM'),
  },
  REDIS: {
    REDIS_HOST: getEnv('REDIS_HOST'),
    REDIS_PORT: Number(getEnv('REDIS_PORT')),
    REDIS_USERNAME: getEnv('REDIS_USERNAME'),
    REDIS_PASSWORD: getEnv('REDIS_PASSWORD'),
  },
});

const envVars = loadEnvVariables();
export default envVars;
