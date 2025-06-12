import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkAuth } from '../middleware/auth';
import { checkRole } from '../middleware/roles';
import { UserRole } from '../database/enums';

export const createReportsRouter = (prisma: PrismaClient) => {
    const router = Router();

    // Маршруты для отчетов
    router.use(checkAuth); // Добавляем middleware авторизации для всех маршрутов
    router.use(checkRole([UserRole.ADMIN, UserRole.MANAGER])); // Разрешаем доступ только админам и менеджерам

    // Отчет по выручке
    router.get('/revenue', async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate as string) : new Date();
            const end = endDate ? new Date(endDate as string) : new Date();

            const orders = await prisma.order.findMany({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end
                    },
                    status: 'PAID'
                },
                include: {
                    payments: true
                }
            });

            const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
            const paymentsByType = orders.reduce((acc, order) => {
                order.payments.forEach(payment => {
                    acc[payment.paymentType] = (acc[payment.paymentType] || 0) + Number(payment.amount);
                });
                return acc;
            }, {} as Record<string, number>);

            res.json({
                totalRevenue,
                paymentsByType,
                ordersCount: orders.length
            });
        } catch (error) {
            console.error('Error generating revenue report:', error);
            res.status(500).json({ message: 'Ошибка при формировании отчета по выручке' });
        }
    });

    // Отчет по продажам
    router.get('/sales', async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate as string) : new Date();
            const end = endDate ? new Date(endDate as string) : new Date();

            const orderItems = await prisma.orderItem.findMany({
                where: {
                    order: {
                        createdAt: {
                            gte: start,
                            lte: end
                        },
                        status: 'PAID'
                    }
                },
                include: {
                    menuItem: true,
                    order: true
                }
            });

            const salesByItem = orderItems.reduce((acc, item) => {
                const key = item.menuItem.name;
                if (!acc[key]) {
                    acc[key] = {
                        quantity: 0,
                        revenue: 0
                    };
                }
                acc[key].quantity += item.quantity;
                acc[key].revenue += Number(item.price) * item.quantity;
                return acc;
            }, {} as Record<string, { quantity: number; revenue: number }>);

            res.json({
                salesByItem,
                totalItems: orderItems.length
            });
        } catch (error) {
            console.error('Error generating sales report:', error);
            res.status(500).json({ message: 'Ошибка при формировании отчета по продажам' });
        }
    });

    // Отчет по зарплатам
    router.get('/salary', async (req, res) => {
        try {
            const { month, year } = req.query;
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0);

            const shifts = await prisma.shift.findMany({
                where: {
                    startedAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    staff: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            const salaryByEmployee = shifts.reduce((acc, shift) => {
                shift.staff.forEach(staffMember => {
                    const key = staffMember.user.fullName;
                    if (!acc[key]) {
                        acc[key] = {
                            shifts: 0,
                            role: staffMember.user.role
                        };
                    }
                    acc[key].shifts += 1;
                });
                return acc;
            }, {} as Record<string, { shifts: number; role: string }>);

            res.json({
                salaryByEmployee,
                totalShifts: shifts.length
            });
        } catch (error) {
            console.error('Error generating salary report:', error);
            res.status(500).json({ message: 'Ошибка при формировании отчета по зарплатам' });
        }
    });

    return router;
};

export default createReportsRouter; 