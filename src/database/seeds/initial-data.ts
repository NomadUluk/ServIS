import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '../entities';
import { UserRole } from '../enums';

export async function seedInitialData(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(User);

    // Проверяем, существует ли уже админ
    const existingAdmin = await userRepository.findOne({
        where: { username: 'uulukmyrza27@gmail.com' }
    });

    if (!existingAdmin) {
        // Создаем хеш пароля
        const passwordHash = await bcrypt.hash('Admin123!@#', 12);

        // Создаем админа
        const admin = userRepository.create({
            fullName: 'System Administrator',
            username: 'uulukmyrza27@gmail.com',
            passwordHash: passwordHash,
            role: UserRole.ADMIN,
            isActive: true
        });

        await userRepository.save(admin);
        console.log('Admin user created successfully');
    } else {
        console.log('Admin user already exists');
    }
} 