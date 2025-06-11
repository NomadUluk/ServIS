import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseConfig } from './config';
import { seedTestData } from './seeds/test-data';

const initializeDatabase = async () => {
    try {
        const dataSource = new DataSource({
            ...databaseConfig,
            synchronize: true, // Это создаст все таблицы
            dropSchema: true, // Удаляем схему перед созданием
        });

        await dataSource.initialize();
        console.log('База данных инициализирована');

        // Добавляем тестовые данные
        await seedTestData(dataSource);

        await dataSource.destroy();
        console.log('Инициализация завершена');
    } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
        process.exit(1);
    }
};

initializeDatabase(); 