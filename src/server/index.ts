import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../database/entities/user.entity';
import { PasswordResetToken } from '../database/entities/password-reset.entity';
import { databaseConfig } from '../database/config';
import { config } from '../config';
import { sendPasswordResetEmail } from '../services/email.service';
import path from 'path';
import { Not } from 'typeorm';
import { createReportsRouter } from '../routes/reports.routes';
import createStaffRouter from '../routes/staff.routes';

// Расширяем тип Request
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const app = express();

// Увеличиваем лимит для заголовков
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Настройка CORS для разработки и продакшена
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

app.use(cors(corsOptions));

// Добавляем обработку статических файлов в production
if (config.server.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
}

// Добавляем middleware для логирования запросов
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Инициализируем соединение с базой данных
const dataSource = new DataSource({
  ...databaseConfig,
  synchronize: config.server.nodeEnv === 'development'
});

// Запускаем сервер только после успешного подключения к базе данных
dataSource.initialize().then(() => {
  console.log('Database connection initialized');
  
  // Подключаем роутеры после инициализации базы данных
  const reportsRouter = createReportsRouter(dataSource);
  const staffRouter = createStaffRouter(dataSource);
  
  app.use('/api/reports', reportsRouter);
  app.use('/api/staff', staffRouter);

  // Запускаем сервер
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${config.server.nodeEnv}`);
  });
}).catch(error => {
  console.error('Error initializing database:', error);
  process.exit(1);
});

interface LoginRequest {
  username: string;
  password: string;
}

app.post('/api/auth/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль' });
    }

    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role
      },
      config.server.jwtSecret,
      { expiresIn: '24h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Запрос на восстановление пароля
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('Received forgot password request for email:', email);

    if (!email) {
      return res.status(400).json({ message: 'Email обязателен' });
    }

    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username: email } });

    if (!user) {
      // Для безопасности возвращаем тот же ответ, даже если пользователь не найден
      return res.json({ message: 'Если указанный email существует, на него будет отправлена инструкция по восстановлению пароля' });
    }

    // Создаем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenRepository = dataSource.getRepository(PasswordResetToken);

    // Создаем запись о токене
    const passwordReset = tokenRepository.create({
      token: resetToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000) // Токен действителен 1 час
    });

    await tokenRepository.save(passwordReset);
    console.log('Reset token created for user:', user.id);

    // Отправляем email
    try {
      await sendPasswordResetEmail(email, resetToken);
      console.log('Reset email sent successfully');
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      return res.status(500).json({ message: 'Ошибка при отправке email' });
    }

    return res.json({ message: 'Если указанный email существует, на него будет отправлена инструкция по восстановлению пароля' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Сброс пароля
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Токен и новый пароль обязательны' });
    }

    const tokenRepository = dataSource.getRepository(PasswordResetToken);
    const resetToken = await tokenRepository.findOne({
      where: { token, used: false },
      relations: ['user']
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Недействительный или просроченный токен' });
    }

    // Обновляем пароль пользователя
    const userRepository = dataSource.getRepository(User);
    const user = resetToken.user;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    // Помечаем токен как использованный
    resetToken.used = true;
    await tokenRepository.save(resetToken);

    return res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Middleware для проверки JWT токена
const authenticateToken = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header:', authHeader);
  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, config.server.jwtSecret, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    console.log('Authenticated user:', { userId: user.userId, role: user.role });
    req.user = user;
    next();
  });
};

// Смена пароля
app.post('/api/auth/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать текущий и новый пароль' });
    }

    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверный текущий пароль' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.save(user);

    return res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Обновление профиля
app.post('/api/auth/update-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    if (!email || !fullName) {
      return res.status(400).json({ message: 'Email и полное имя обязательны' });
    }

    const userRepository = dataSource.getRepository(User);
    
    // Проверяем, не занят ли email другим пользователем
    const existingUser = await userRepository.findOne({ 
      where: { 
        username: email,
        id: Not(userId) 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Этот email уже используется' });
    }

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.username = email;
    user.fullName = fullName;
    await userRepository.save(user);

    return res.json({ 
      message: 'Профиль успешно обновлен',
      user: {
        email: user.username,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Middleware для проверки роли администратора
const checkAdminRole = (req: AuthRequest, res: Response, next: any) => {
  console.log('Checking admin role for user:', req.user);
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};

// Обновление профиля администратора
app.put('/api/admin/profile', authenticateToken, checkAdminRole, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, username, password } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    // Проверяем существование пользователя
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем, не занят ли email другим пользователем
    if (username !== user.username) {
      const existingUser = await userRepository.findOne({ 
        where: { 
          username,
          id: Not(userId) 
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    }

    // Обновляем данные
    user.fullName = fullName;
    user.username = username;

    // Если передан пароль, обновляем его
    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      user.passwordHash = passwordHash;
    }

    await userRepository.save(user);

    res.json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Получение данных профиля администратора
app.get('/api/admin/profile', authenticateToken, checkAdminRole, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log('Getting admin profile for userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    
    console.log('Found user in database:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const responseData = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role
    };
    
    console.log('Sending profile data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Ошибка при получении данных профиля' });
  }
});

// Добавляем обработчик для корневого маршрута
app.get('/', (req: Request, res: Response) => {
  if (config.server.nodeEnv === 'production') {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
  } else {
    res.json({ message: 'API сервер работает' });
  }
});

// Обработка всех остальных маршрутов в production
if (config.server.nodeEnv === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../build/index.html'));
  });
}

// Обработка ошибок
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера'
  });
}); 