import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../database/enums';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const checkRole = (allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            if (!allowedRoles.includes(req.user.role as UserRole)) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ message: 'Ошибка при проверке прав доступа' });
        }
    };
}; 