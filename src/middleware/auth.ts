import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
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