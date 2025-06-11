import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { DataSource } from 'typeorm';

export class ReportController {
    private reportService: ReportService;

    constructor(dataSource: DataSource) {
        this.reportService = new ReportService(dataSource);
    }

    async getRevenueReport(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Необходимо указать startDate и endDate' 
                });
            }

            const report = await this.reportService.getRevenueReport(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.json(report);
        } catch (error) {
            console.error('Error in getRevenueReport:', error);
            res.status(500).json({ 
                error: 'Ошибка при получении отчета по выручке' 
            });
        }
    }

    async getSalesReport(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Необходимо указать startDate и endDate' 
                });
            }

            const report = await this.reportService.getSalesReport(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.json(report);
        } catch (error) {
            console.error('Error in getSalesReport:', error);
            res.status(500).json({ 
                error: 'Ошибка при получении отчета по продажам' 
            });
        }
    }

    async getSalaryReport(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Необходимо указать startDate и endDate' 
                });
            }

            const report = await this.reportService.getSalaryReport(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.json(report);
        } catch (error) {
            console.error('Error in getSalaryReport:', error);
            res.status(500).json({ 
                error: 'Ошибка при получении отчета по зарплатам' 
            });
        }
    }
} 