export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Другие конфигурационные параметры
export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/servis';

export const config = {
  server: {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  client: {
    port: process.env.CLIENT_PORT || 3000,
    url: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/servis'
  },
  email: {
    user: process.env.EMAIL_USER || 'uulukmyrza27@gmail.com',
    password: process.env.EMAIL_PASSWORD || 'bnju uqos uhry dans',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false
  }
}; 