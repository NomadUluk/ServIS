import { DataSource } from 'typeorm';
import { 
    User, 
    MenuItem, 
    Order, 
    OrderItem, 
    Shift,
    Supplier,
    Ingredient,
    Delivery,
    MenuIngredient,
    ShiftStaff,
    MenuStopList,
    IngredientStopList,
    Payment,
    TwoFactorCode,
    PasswordResetToken
} from '../entities';
import { UserRole, OrderStatus, PaymentType } from '../enums';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seedTestData(dataSource: DataSource) {
    try {
        // Инициализируем репозитории
        const userRepository = dataSource.getRepository(User);
        const menuItemRepository = dataSource.getRepository(MenuItem);
        const orderRepository = dataSource.getRepository(Order);
        const orderItemRepository = dataSource.getRepository(OrderItem);
        const shiftRepository = dataSource.getRepository(Shift);
        const supplierRepository = dataSource.getRepository(Supplier);
        const ingredientRepository = dataSource.getRepository(Ingredient);
        const deliveryRepository = dataSource.getRepository(Delivery);
        const menuIngredientRepository = dataSource.getRepository(MenuIngredient);
        const shiftStaffRepository = dataSource.getRepository(ShiftStaff);
        const menuStopListRepository = dataSource.getRepository(MenuStopList);
        const ingredientStopListRepository = dataSource.getRepository(IngredientStopList);
        const paymentRepository = dataSource.getRepository(Payment);
        const twoFactorCodeRepository = dataSource.getRepository(TwoFactorCode);
        const passwordResetTokenRepository = dataSource.getRepository(PasswordResetToken);

        // Создаем администратора
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const admin = await userRepository.save(
            userRepository.create({
                fullName: 'Ulukmyrza',
                username: 'uulukmyrza27@gmail.com',
                passwordHash: adminPasswordHash,
                role: UserRole.ADMIN,
                isActive: true
            })
        );

        // Создаем официантов (5 человек)
        const waiters = [];
        for (let i = 1; i <= 5; i++) {
            const waiterPasswordHash = await bcrypt.hash('waiter123', 10);
            const waiter = await userRepository.save(
                userRepository.create({
                    fullName: `Waiter ${i}`,
                    username: `waiter${i}@example.com`,
                    passwordHash: waiterPasswordHash,
                    role: UserRole.WAITER,
                    isActive: true
                })
            );
            waiters.push(waiter);
        }

        // Создаем кассиров (3 человека)
        const cashiers = [];
        for (let i = 1; i <= 3; i++) {
            const cashierPasswordHash = await bcrypt.hash('cashier123', 10);
            const cashier = await userRepository.save(
                userRepository.create({
                    fullName: `Cashier ${i}`,
                    username: `cashier${i}@example.com`,
                    passwordHash: cashierPasswordHash,
                    role: UserRole.CASHIER,
                    isActive: true
                })
            );
            cashiers.push(cashier);
        }

        // Создаем поставщиков
        const suppliers = [];
        for (let i = 1; i <= 10; i++) {
            const supplier = await supplierRepository.save(
                supplierRepository.create({
                    name: `Supplier ${i}`,
                    phone: `+996700${String(i).padStart(6, '0')}`
                })
            );
            suppliers.push(supplier);
        }

        // Создаем ингредиенты
        const ingredients = [];
        const ingredientNames = ['Мясо', 'Рис', 'Морковь', 'Лук', 'Масло', 'Мука', 'Картофель', 'Специи', 'Соль', 'Перец'];
        for (let i = 0; i < 10; i++) {
            const ingredient = await ingredientRepository.save(
                ingredientRepository.create({
                    name: ingredientNames[i],
                    unit: i < 5 ? 'кг' : 'г',
                    currentPrice: 100 + i * 50,
                    inStock: 100
                })
            );
            ingredients.push(ingredient);
        }

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
            }),
            menuItemRepository.create({
                name: 'Борщ',
                description: 'Суп со свеклой и овощами',
                price: 180,
                costPrice: 100,
                createdBy: admin,
                isActive: true
            }),
            menuItemRepository.create({
                name: 'Шашлык',
                description: 'Мясо на углях',
                price: 300,
                costPrice: 200,
                createdBy: admin,
                isActive: true
            })
        ]);

        // Создаем связи между меню и ингредиентами
        for (const menuItem of menuItems) {
            for (let i = 0; i < 3; i++) {
                await menuIngredientRepository.save(
                    menuIngredientRepository.create({
                        menuItem,
                        ingredient: ingredients[Math.floor(Math.random() * ingredients.length)],
                        quantity: Math.random() * 0.5 + 0.1
                    })
                );
            }
        }

        // Создаем смены на неделю вперед
        const shifts = [];
        for (let i = 0; i < 7; i++) {
            const shift = await shiftRepository.save(
                shiftRepository.create({
                    startTime: new Date(new Date().setDate(new Date().getDate() + i)),
                    endTime: new Date(new Date().setDate(new Date().getDate() + i + 1)),
                    user: waiters[i % waiters.length]
                })
            );
            shifts.push(shift);
        }

        // Создаем записи персонала в сменах
        for (const shift of shifts) {
            for (let i = 0; i < 3; i++) {
                await shiftStaffRepository.save(
                    shiftStaffRepository.create({
                        shift,
                        user: waiters[Math.floor(Math.random() * waiters.length)]
                    })
                );
            }
        }

        // Создаем заказы и платежи
        for (let i = 0; i < 10; i++) {
            const order = await orderRepository.save(
                orderRepository.create({
                    tableNumber: `Table ${i + 1}`,
                    status: OrderStatus.PAID,
                    totalPrice: 0,
                    waiter: waiters[Math.floor(Math.random() * waiters.length)],
                    cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
                    shift: shifts[i % shifts.length],
                    paidAt: new Date(2024, 2, 1 + Math.floor(Math.random() * 7))
                })
            );

            // Добавляем пункты к заказу
            const orderItems = await orderItemRepository.save([
                orderItemRepository.create({
                    order,
                    menuItem: menuItems[Math.floor(Math.random() * menuItems.length)],
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: menuItems[0].price
                }),
                orderItemRepository.create({
                    order,
                    menuItem: menuItems[Math.floor(Math.random() * menuItems.length)],
                    quantity: Math.floor(Math.random() * 3) + 1,
                    price: menuItems[1].price
                })
            ]);

            // Обновляем общую сумму заказа
            const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            await orderRepository.update(order.id, { totalPrice });

            // Создаем платеж для заказа
            await paymentRepository.save(
                paymentRepository.create({
                    order,
                    amount: totalPrice,
                    paymentType: Object.values(PaymentType)[Math.floor(Math.random() * Object.values(PaymentType).length)],
                    paidBy: cashiers[Math.floor(Math.random() * cashiers.length)]
                })
            );
        }

        // Создаем поставки
        for (let i = 0; i < 10; i++) {
            await deliveryRepository.save(
                deliveryRepository.create({
                    ingredient: ingredients[Math.floor(Math.random() * ingredients.length)],
                    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
                    quantity: Math.floor(Math.random() * 100) + 50,
                    pricePerUnit: Math.floor(Math.random() * 1000) + 500,
                    deliveryDate: new Date(2024, 2, 1 + Math.floor(Math.random() * 7)),
                    createdBy: admin
                })
            );
        }

        // Создаем стоп-листы для меню
        for (let i = 0; i < 5; i++) {
            await menuStopListRepository.save(
                menuStopListRepository.create({
                    menuItem: menuItems[Math.floor(Math.random() * menuItems.length)],
                    shift: shifts[Math.floor(Math.random() * shifts.length)]
                })
            );
        }

        // Создаем стоп-листы для ингредиентов
        for (let i = 0; i < 5; i++) {
            await ingredientStopListRepository.save(
                ingredientStopListRepository.create({
                    ingredient: ingredients[Math.floor(Math.random() * ingredients.length)],
                    shift: shifts[Math.floor(Math.random() * shifts.length)]
                })
            );
        }

        // Создаем тестовые токены сброса пароля
        for (let i = 0; i < 3; i++) {
            await passwordResetTokenRepository.save(
                passwordResetTokenRepository.create({
                    token: uuidv4(),
                    userId: admin.id,
                    used: false,
                    expiresAt: new Date(Date.now() + 3600000)
                })
            );
        }

        // Создаем тестовые 2FA коды
        for (let i = 0; i < 3; i++) {
            await twoFactorCodeRepository.save(
                twoFactorCodeRepository.create({
                    user: admin,
                    code: Math.random().toString().slice(2, 8),
                    expiresAt: new Date(Date.now() + 300000),
                    isUsed: false
                })
            );
        }

        console.log('Тестовые данные успешно добавлены');
    } catch (error) {
        console.error('Ошибка при добавлении тестовых данных:', error);
        throw error;
    }
} 