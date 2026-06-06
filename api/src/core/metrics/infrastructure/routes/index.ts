import { Router } from 'express';
import AuthMiddleware from '../../../shared/infrastructure/middlewares/auth.middleware';
import GetAvailableBiomarkersController from '../controllers/get-available-biomarkers.controller';
import GetBiomarkersHistoryController from '../controllers/get-biomarkers-history.controller';

const metricsRouter = Router();

metricsRouter.get('/available', AuthMiddleware.handle, GetAvailableBiomarkersController.handle);
metricsRouter.get('/history', AuthMiddleware.handle, GetBiomarkersHistoryController.handle);

export default metricsRouter;
