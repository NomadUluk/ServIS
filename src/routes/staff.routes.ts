import { Router } from 'express';
import { DataSource, Not } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { ShiftStaff } from '../database/entities/shift-staff.entity';
import { Shift } from '../database/entities/shift.entity';
import { UserRole } from '../database/enums';
import bcrypt from 'bcryptjs';

export const createStaffRouter = (dataSource: DataSource) => {
    const router = Router();
    const userRepository = dataSource.getRepository(User);
    const shiftStaffRepository = dataSource.getRepository(ShiftStaff);
    const shiftRepository = dataSource.getRepository(Shift);

    // Получить список всех сотрудников с их текущим статусом смены
    router.get('/', async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Получаем всех сотрудников, кроме администраторов
            const users = await userRepository.find({
                where: {
                    role: Not(UserRole.ADMIN),
                    isActive: true
                },
                order: {
                    fullName: 'ASC'
                }
            });

            // Получаем текущие смены
            const currentShifts = await shiftStaffRepository
                .createQueryBuilder('ss')
                .leftJoinAndSelect('ss.shift', 'shift')
                .leftJoinAndSelect('ss.user', 'user')
                .where('shift.startTime >= :today', { today })
                .andWhere('shift.startTime < :tomorrow', { tomorrow })
                .getMany();

            // Формируем ответ
            const staffList = users.map(user => {
                const isOnShift = currentShifts.some(ss => ss.user.id === user.id);
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
            const existingUser = await userRepository.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Хешируем пароль
            const passwordHash = await bcrypt.hash(password, 12);

            // Создаем нового пользователя
            const newUser = userRepository.create({
                fullName,
                username,
                passwordHash,
                role,
                isActive: true
            });

            await userRepository.save(newUser);

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
            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            // Проверяем, не занят ли email другим пользователем
            const existingUser = await userRepository.findOne({ 
                where: { 
                    username,
                    id: Not(id) 
                } 
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // Обновляем данные
            user.fullName = fullName;
            user.username = username;
            user.role = role;

            await userRepository.save(user);

            res.json({
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                role: user.role,
                isActive: user.isActive
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
            const user = await userRepository.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ message: 'Сотрудник не найден' });
            }

            // Помечаем пользователя как неактивного вместо физического удаления
            user.isActive = false;
            await userRepository.save(user);

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting employee:', error);
            res.status(500).json({ message: 'Ошибка при удалении сотрудника' });
        }
    });

    return router;
};

export default createStaffRouter; 