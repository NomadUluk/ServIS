import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { DataSource } from 'typeorm';
import { checkAuth } from '../middleware/auth';
import { checkRole } from '../middleware/roles';
import { UserRole } from '../database/enums';

export const createReportsRouter = (dataSource: DataSource) => {
const router = Router();

// Создаем экземпляр контроллера отчетов
const reportController = new ReportController(dataSource);

// Маршруты для отчетов
router.use(checkAuth); // Добавляем middleware авторизации для всех маршрутов
router.use(checkRole([UserRole.ADMIN, UserRole.MANAGER])); // Разрешаем доступ только админам и менеджерам

router.get('/revenue', reportController.getRevenueReport.bind(reportController));
router.get('/sales', reportController.getSalesReport.bind(reportController));
router.get('/salary', reportController.getSalaryReport.bind(reportController));

    return router;
};

export default createReportsRouter; 