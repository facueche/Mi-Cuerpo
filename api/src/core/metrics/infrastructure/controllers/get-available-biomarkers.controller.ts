import { Request, Response } from "express";
import PrismaMetricsRepository from "../repositories/prisma-metrics.repository";
import GetAvailableBiomarkersService from "../../application/get-available-biomarkers.service";

export default class GetAvailableBiomarkersController {
    static async handle(req: Request, res: Response) {
        try {
            const metricsRepository = new PrismaMetricsRepository();
            const getAvailableBiomarkersService = new GetAvailableBiomarkersService(metricsRepository);

            const list = await getAvailableBiomarkersService.handle(req.userId);

            return res.json(list);
        } catch (e) {
            return res.status(500).json({ message: "Error al leer biomarcadores" });
        }
    }
}
