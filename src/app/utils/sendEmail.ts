/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from 'ejs';
import path from 'path';
import AppError from '../errorHelpers/AppError';
import envVars from '../config/env';
import { SendEmailOptions } from '../types';
import nodeMailerTransporter from '../config/nodemailer.config';

const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions): Promise<void> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'app',
      'templates',
      `${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await nodeMailerTransporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FORM,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    if (envVars.NODE_ENV === 'development') {
      console.log(` Email sent to ${to}: ${info.messageId}`);
    }
  } catch (error: any) {
    if (envVars.NODE_ENV === 'development') {
      console.log('ERROR-->', error.message);
    }
    throw new AppError(401, 'Email error');
  }
};

export default sendEmail;
