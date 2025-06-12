import dotenv from 'dotenv';

dotenv.config();

interface ServerConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  clientUrl: string;
}

interface ClientConfig {
  port: number;
  url: string;
}

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface AppConfig {
  server: ServerConfig;
  client: ClientConfig;
  database: DatabaseConfig;
  email: EmailConfig;
}

export const config: AppConfig = {
  server: {
    port: Number(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-here',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  client: {
    port: Number(process.env.CLIENT_PORT) || 3000,
    url: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '12345',
    database: process.env.DATABASE_NAME || 'servis'
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}; 

export const JWT_SECRET = config.server.jwtSecret; 