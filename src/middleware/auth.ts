import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Недействительный токен' });
    }
}; 