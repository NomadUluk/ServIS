import { DataSource } from 'typeorm';
import { User, MenuItem, Order, OrderItem, Shift } from '../entities';
import { UserRole, OrderStatus } from '../enums';
import bcrypt from 'bcryptjs';

export async function seedTestData(dataSource: DataSource) {
    try {
        // Создаем пользователей
        const userRepository = dataSource.getRepository(User);
        const menuItemRepository = dataSource.getRepository(MenuItem);
        const orderRepository = dataSource.getRepository(Order);
        const orderItemRepository = dataSource.getRepository(OrderItem);
        const shiftRepository = dataSource.getRepository(Shift);

        // Создаем администратора
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const admin = await userRepository.save(
            userRepository.create({
                fullName: 'System Administrator',
                username: 'admin@example.com',
                passwordHash: adminPasswordHash,
                role: UserRole.ADMIN,
                isActive: true
            })
        );

        // Создаем официанта
        const waiterPasswordHash = await bcrypt.hash('waiter123', 10);
        const waiter = await userRepository.save(
            userRepository.create({
                fullName: 'John Waiter',
                username: 'waiter@example.com',
                passwordHash: waiterPasswordHash,
                role: UserRole.WAITER,
                isActive: true
            })
        );

        // Создаем кассира
        const cashierPasswordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await userRepository.save(
            userRepository.create({
                fullName: 'Jane Cashier',
                username: 'cashier@example.com',
                passwordHash: cashierPasswordHash,
                role: UserRole.CASHIER,
                isActive: true
            })
        );

        // Создаем пункты меню
        const menuItems = await menuItemRepository.save([
            menuItemRepository.create({
                name: 'Лагман',
                description: 'Традиционное блюдо из лапши с мясом и овощами',
                price: 250,
                costPrice: 150,
                createdBy: admin,
                isActive: true
            }),
            menuItemRepository.create({
                name: 'Манты',
                description: 'Паровые пельмени с мясом',
                price: 200,
                costPrice: 120,
                createdBy: admin,
                isActive: true
            }),
            menuItemRepository.create({
                name: 'Плов',
                description: 'Рис с мясом и морковью',
                price: 220,
                costPrice: 130,
                createdBy: admin,
                isActive: true
            })
        ]);

        // Создаем смены
        const shifts = await shiftRepository.save([
            shiftRepository.create({
                startTime: new Date('2024-03-01T09:00:00'),
                endTime: new Date('2024-03-01T18:00:00'),
                user: waiter
            }),
            shiftRepository.create({
                startTime: new Date('2024-03-02T09:00:00'),
                endTime: new Date('2024-03-02T18:00:00'),
                user: waiter
            }),
            shiftRepository.create({
                startTime: new Date('2024-03-03T09:00:00'),
                endTime: new Date('2024-03-03T18:00:00'),
                user: waiter
            })
        ]);

        // Создаем заказы
        for (let i = 0; i < 10; i++) {
            const order = await orderRepository.save(
                orderRepository.create({
                    tableNumber: `Table ${i + 1}`,
                    status: OrderStatus.PAID,
                    totalPrice: 0,
                    waiter: waiter,
                    cashier: cashier,
                    shift: shifts[i % shifts.length],
                    paidAt: new Date(2024, 2, 1 + Math.floor(Math.random() * 7)) // Март 2024
                })
            );

            // Добавляем пункты к заказу
            const orderItems = await orderItemRepository.save([
                orderItemRepository.create({
                    order,
                    menuItem: menuItems[0],
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: menuItems[0].price
                }),
                orderItemRepository.create({
                    order,
                    menuItem: menuItems[1],
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: menuItems[1].price
                }),
                orderItemRepository.create({
                    order,
                    menuItem: menuItems[2],
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: menuItems[2].price
                })
            ]);

            // Обновляем общую сумму заказа
            const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            await orderRepository.update(order.id, { totalPrice });
        }

        console.log('Тестовые данные успешно добавлены');
    } catch (error) {
        console.error('Ошибка при добавлении тестовых данных:', error);
        throw error;
    }
} 