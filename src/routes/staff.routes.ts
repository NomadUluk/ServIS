import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../database/enums';
import bcrypt from 'bcryptjs';

export const createStaffRouter = (prisma: PrismaClient) => {
    const router = Router();

    // Получить список всех сотрудников с их текущим статусом смены
    router.get('/', async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Получаем всех сотрудников, кроме администраторов
            const users = await prisma.user.findMany({
                where: {
                    role: { not: UserRole.ADMIN },
                    isActive: true
                },
                orderBy: {
                    fullName: 'asc'
                }
            });

            // Получаем текущие смены
            const currentShifts = await prisma.shiftStaff.findMany({
                where: {
                    shift: {
                        startedAt: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                },
                include: {
                    shift: true,
                    user: true
                }
            });

            // Формируем ответ
            const staffList = users.map(user => {
                const isOnShift = currentShifts.some(ss => ss.userId === user.id);
                return {
                    id: user.id,
                    fullName: user.fullName,
                    role: user.role,
                    username: user.username,
                    isActive: user.isActive,
                    status: isOnShift ? 'работает' : 'не на смене'
                };
            });

            res.json(staffList);
        } catch (error) {
            console.error('Error fetching staff:', error);
            res.status(500).json({ message: 'Ошибка при получении списка сотрудников' });
        }
    });

    // Создать нового сотрудника
    router.post('/', async (req, res) => {
        try {
            const { fullName, username, password, role } = req.body;

            // Проверяем, существует ли пользователь с таким email
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Хешируем пароль
            const passwordHash = await bcrypt.hash(password, 12);

            // Создаем нового пользователя
            const newUser = await prisma.user.create({
                data: {
                    fullName,
                    username,
                    passwordHash,
                    role,
                    isActive: true
                }
            });

            res.status(201).json({
                id: newUser.id,
                fullName: newUser.fullName,
                username: newUser.username,
                role: newUser.role,
                isActive: newUser.isActive
            });
        } catch (error) {
            console.error('Error creating employee:', error);
            res.status(500).json({ message: 'Ошибка при создании сотрудника' });
        }
    });

    // Обновить данные сотрудника
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { fullName, username, role } = req.body;

            // Проверяем существование пользователя
            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            // Проверяем, не занят ли email другим пользователем
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    id: { not: id }
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Обновляем данные
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    fullName,
                    username,
                    role
                }
            });

            res.json({
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                username: updatedUser.username,
                role: updatedUser.role,
                isActive: updatedUser.isActive
            });
        } catch (error) {
            console.error('Error updating employee:', error);
            res.status(500).json({ message: 'Ошибка при обновлении данных сотрудника' });
        }
    });

    // Удалить сотрудника
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;

            // Проверяем существование пользователя
            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            // Помечаем пользователя как неактивного вместо физического удаления
            await prisma.user.update({
                where: { id },
                data: { isActive: false }
            });

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting employee:', error);
            res.status(500).json({ message: 'Ошибка при удалении сотрудника' });
        }
    });

    return router;
};

export default createStaffRouter; 