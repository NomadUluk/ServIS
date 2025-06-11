import nodemailer from 'nodemailer';
import { config } from '../config';

// Создаем транспорт для отправки email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetLink = `${config.client.url}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"Ресторан" <${config.email.user}>`,
    to: email,
    subject: 'Восстановление пароля',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2D1B69; text-align: center;">Восстановление пароля</h1>
        <p>Вы запросили восстановление пароля. Для сброса пароля нажмите на кнопку ниже:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #2D1B69; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 8px;
                    display: inline-block;">
            Сбросить пароль
          </a>
        </div>
        <p>Или перейдите по этой ссылке: <a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #666;">Ссылка действительна в течение 1 часа.</p>
        <p style="color: #666; font-size: 0.9em;">Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.</p>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    await transporter.verify(); // Проверяем подключение
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      throw new Error(`Ошибка отправки email: ${error.message}`);
    }
    throw new Error('Не удалось отправить email для восстановления пароля');
  }
}; 