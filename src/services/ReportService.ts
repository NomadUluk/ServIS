import { DataSource, Between } from 'typeorm';
import { Order, Payment, User, OrderItem, MenuItem, Shift } from '../database/entities';
import { OrderStatus } from '../database/enums';

export class ReportService {
    constructor(private dataSource: DataSource) {}

    async getRevenueReport(startDate: Date, endDate: Date) {
        const orderRepository = this.dataSource.getRepository(Order);
        
        // Получаем все оплаченные заказы за период
        const orders = await orderRepository.find({
            where: {
                status: OrderStatus.PAID,
                paidAt: Between(startDate, endDate)
            },
            relations: ['payments']
        });

        // Группируем данные по дням
        const dailyRevenue = orders.reduce((acc, order) => {
            if (order.paidAt) {
                const date = order.paidAt.toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + Number(order.totalPrice);
            }
            return acc;
        }, {} as Record<string, number>);

        // Преобразуем в формат для графика
        const revenueData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
            date,
            revenue
        }));

        // Считаем общую статистику
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
        const avgRevenue = totalRevenue / Object.keys(dailyRevenue).length || 0;
        const maxRevenue = Math.max(...Object.values(dailyRevenue));

        return {
            dailyData: revenueData,
            stats: {
                totalRevenue,
                averageRevenue: avgRevenue,
                maxRevenue
            }
        };
    }

    async getSalesReport(startDate: Date, endDate: Date) {
        const orderRepository = this.dataSource.getRepository(Order);
        const paymentRepository = this.dataSource.getRepository(Payment);

        // Получаем заказы и платежи
        const orders = await orderRepository.find({
            where: {
                status: OrderStatus.PAID,
                paidAt: Between(startDate, endDate)
            },
            relations: ['orderItems', 'orderItems.menuItem']
        });

        const payments = await paymentRepository.find({
            where: {
                paidAt: Between(startDate, endDate)
            }
        });

        // Группируем продажи по дням
        const dailySales = orders.reduce((acc, order) => {
            if (order.paidAt) {
                const date = order.paidAt.toISOString().split('T')[0];
                acc[date] = {
                    sales: (acc[date]?.sales || 0) + Number(order.totalPrice),
                    profit: (acc[date]?.profit || 0) + this.calculateProfit(order)
                };
            }
            return acc;
        }, {} as Record<string, { sales: number; profit: number }>);

        // Получаем топ продаж
        const topItems = this.calculateTopSellingItems(orders);

        return {
            dailyData: Object.entries(dailySales).map(([date, data]) => ({
                date,
                sales: data.sales,
                profit: data.profit
            })),
            topSellingItems: topItems,
            stats: {
                totalSales: orders.reduce((sum, order) => sum + Number(order.totalPrice), 0),
                averageCheck: orders.length ? orders.reduce((sum, order) => sum + Number(order.totalPrice), 0) / orders.length : 0,
                totalProfit: orders.reduce((sum, order) => sum + this.calculateProfit(order), 0)
            }
        };
    }

    async getSalaryReport(startDate: Date, endDate: Date) {
        const userRepository = this.dataSource.getRepository(User);
        
        // Получаем всех активных сотрудников с их сменами
        const employees = await userRepository.find({
            where: { isActive: true },
            relations: ['shifts']
        });

        // Группируем зарплаты по должностям
        const salaryByPosition = employees.reduce((acc, employee) => {
            const position = employee.role;
            const salary = this.calculateSalary(employee, startDate, endDate);
            acc[position] = (acc[position] || 0) + salary;
            return acc;
        }, {} as Record<string, number>);

        return {
            positionData: Object.entries(salaryByPosition).map(([position, amount]) => ({
                name: position,
                value: amount
            })),
            employeeData: employees.map(employee => ({
                name: employee.fullName,
                position: employee.role,
                shifts: employee.shifts.filter((shift: Shift) => 
                    shift.startTime >= startDate && shift.endTime <= endDate
                ).length,
                salary: this.calculateSalary(employee, startDate, endDate)
            })),
            stats: {
                totalSalary: Object.values(salaryByPosition).reduce((a, b) => a + b, 0),
                employeeCount: employees.length
            }
        };
    }

    private calculateProfit(order: Order): number {
        return order.orderItems.reduce((profit: number, item: OrderItem) => {
            return profit + (Number(item.price) - Number(item.menuItem.costPrice)) * item.quantity;
        }, 0);
    }

    private calculateTopSellingItems(orders: Order[]) {
        const itemSales = orders.reduce((acc, order) => {
            order.orderItems.forEach((item: OrderItem) => {
                const itemId = item.menuItem.id;
                if (!acc[itemId]) {
                    acc[itemId] = {
                        name: item.menuItem.name,
                        sales: 0,
                        revenue: 0
                    };
                }
                acc[itemId].sales += item.quantity;
                acc[itemId].revenue += Number(item.price) * item.quantity;
            });
            return acc;
        }, {} as Record<string, { name: string; sales: number; revenue: number }>);

        return Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }

    private calculateSalary(employee: User, startDate: Date, endDate: Date): number {
        // Здесь должна быть ваша логика расчета зарплаты
        // Например, базовая ставка + бонусы за смены
        const baseRate = 1000; // Базовая ставка за смену
        const shifts = employee.shifts.filter((shift: Shift) => 
            shift.startTime >= startDate && shift.endTime <= endDate
        ).length;
        
        return baseRate * shifts;
    }
} 