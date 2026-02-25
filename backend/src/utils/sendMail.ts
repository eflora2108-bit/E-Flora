import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from './logger';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// Check if email is configured
const isEmailConfigured = (): boolean => {
  return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
};

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });
};

export const sendMail = async (options: MailOptions): Promise<boolean> => {
  if (!isEmailConfigured()) {
    logger.warn(`Email not configured. Would have sent to: ${options.to} | Subject: ${options.subject}`);
    return false;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    return false;
  }
};

export default sendMail;
