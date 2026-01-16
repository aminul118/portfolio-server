export interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: 'development' | 'production';
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: number;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;
  ADMIN_NAME: string;
  ADMIN_EMAIL: string;

  CLOUDINARY: {
    CLOUDINARY_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  EMAIL_SENDER: {
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FORM: string;
  };
  REDIS: {
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
  };
}
