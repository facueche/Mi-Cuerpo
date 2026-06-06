import { Router } from 'express';
import GetDashboardMetricsController from '../controllers/get-dashboard-metrics.controller';
import AuthMiddleware from '../../../shared/infrastructure/middlewares/auth.middleware';

const dashboardRouter = Router();

dashboardRouter.get('/metrics', AuthMiddleware.handle, GetDashboardMetricsController.handle);

export default dashboardRouter;
