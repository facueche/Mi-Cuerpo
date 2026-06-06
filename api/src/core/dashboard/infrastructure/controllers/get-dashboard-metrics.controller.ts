import { Request, Response } from 'express';
import GetDashboardMetricsService from '../../application/get-dashboard-metrics.service';
import PrismaDashboardRepository from '../repositories/prisma-dashboard.repository';

export default class GetDashboardMetricsController {
    static async handle(req: Request, res: Response) {
        try {
            const userId = req.userId;

            const dashboardRepository = new PrismaDashboardRepository();
            const metricsService = new GetDashboardMetricsService(dashboardRepository);

            const result = await metricsService.handle({ userId });
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en GetDashboardMetricsController:', error);
            return res.status(500).json({
                message: 'Error interno al recopilar las métricas del dashboard.'
            });
        }
    }
}
