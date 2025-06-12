import nodemailer from 'nodemailer';
import { config } from '../config';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });

  const resetUrl = `${config.server.clientUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'Сброс пароля',
    html: `
      <h1>Сброс пароля</h1>
      <p>Вы запросили сброс пароля. Для продолжения перейдите по ссылке:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      <p>Ссылка действительна в течение 1 часа.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}; 