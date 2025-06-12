import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { sendPasswordResetEmail } from '../services/email.service';
import path from 'path';
import { createReportsRouter } from '../routes/reports.routes';
import createStaffRouter from '../routes/staff.routes';
import prisma from '../database/prisma/client';

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

// Middleware для проверки JWT токена
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    jwt.verify(token, config.server.jwtSecret, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Недействительный токен' });
      }

      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Ошибка аутентификации' });
  }
};

// Middleware для проверки роли администратора
const checkAdminRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};

// Подключаем роутеры
const reportsRouter = createReportsRouter(prisma);
const staffRouter = createStaffRouter(prisma);

app.use('/api/reports', reportsRouter);
app.use('/api/staff', staffRouter);

interface LoginRequest {
  username: string;
  password: string;
}

app.post('/api/auth/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    console.log('Login attempt received:', { username: req.body.username });
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Password validation:', isValidPassword ? 'Success' : 'Failed');

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

    console.log('Login successful, token generated');
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

    const user = await prisma.user.findUnique({
      where: { username: email }
    });

    if (!user) {
      // Для безопасности возвращаем тот же ответ, даже если пользователь не найден
      return res.json({ message: 'Если указанный email существует, на него будет отправлена инструкция по восстановлению пароля' });
    }

    // Создаем токен для сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Создаем запись о токене
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000) // Токен действителен 1 час
      }
    });

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

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { 
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Недействительный или просроченный токен' });
    }

    // Обновляем пароль пользователя
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    });

    // Помечаем токен как использованный
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    return res.json({ message: 'Пароль успешно обновлен' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

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

// Обновление профиля администратора
app.put('/api/admin/profile', authenticateToken, checkAdminRole, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, username, password } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем, не занят ли email другим пользователем
    if (username !== user.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          id: { not: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      fullName,
      username
    };

    // Если передан пароль, обновляем его
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Обновляем данные пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

// Запускаем сервер
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
}); 