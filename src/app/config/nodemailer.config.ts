import nodemailer from 'nodemailer';
import envVars from './env';

const nodeMailerTransporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: envVars.EMAIL_SENDER.SMTP_PORT,
  secure: envVars.EMAIL_SENDER.SMTP_PORT === 465, // 465 = SSL; 587 = STARTTLS
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // optional: helps with self-signed certs or shared hosting like Hostinger
  },
});

export default nodeMailerTransporter;
