import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter;

/**
 * Initializes the Nodemailer transporter using Ethereal Email.
 */
export async function initMailer() {
  if (env.ETHEREAL_USER && env.ETHEREAL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: env.ETHEREAL_USER,
        pass: env.ETHEREAL_PASS,
      },
    });
    console.log('✅ Mailer initialized with provided Ethereal credentials');
  } else {
    // Create test account dynamically if no credentials provided
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`✅ Mailer initialized. Ethereal User: ${testAccount.user}, Pass: ${testAccount.pass}`);
  }
}

/**
 * Sends an email using the configured transporter.
 */
export async function sendEmail(options: { to: string; from: string; subject: string; html: string }): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    // Always call getTestMessageUrl to get the Ethereal preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { success: true, previewUrl };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
}
