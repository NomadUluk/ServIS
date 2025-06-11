import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../database/enums';

export const checkRole = (allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return res.status(403).json({ 
                error: 'У вас нет прав для выполнения этого действия' 
            });
        }

        next();
    };
}; 