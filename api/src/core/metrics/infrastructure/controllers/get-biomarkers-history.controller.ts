import { Request, Response } from "express";
import GetBiomarkerHistoryService from "../../application/get-biomarker-history.service";
import PrismaMetricsRepository from "../repositories/prisma-metrics.repository";

export default class GetBiomarkersHistoryController {
    static async handle(req: Request, res: Response) {
        try {
            const parameter = req.query.parameter as string;

            if (!parameter) return res.status(400).json({ message: "Falta el parámetro clínico" });

            const metricsRepository = new PrismaMetricsRepository();
            const service = new GetBiomarkerHistoryService(metricsRepository);

            const result = await service.handle(req.userId, parameter);
            return res.json(result);
        } catch (e) {
            return res.status(500).json({ message: "Error al calcular historial métrico" });
        }
    }
}
