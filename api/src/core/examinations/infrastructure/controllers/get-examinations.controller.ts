import { Request, Response } from 'express';
import GetExaminationsService from '../../application/get-examinations.service';
import PrismaExaminationRepository from '../repositories/prisma-examination.repository';

export default class GetExaminationsController {
    static async handle(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const search = (req.query.search as string) || '';

            const userId = req.userId;

            const examinationRepository = new PrismaExaminationRepository();
            const getExaminationsService = new GetExaminationsService(examinationRepository);

            const result = await getExaminationsService.handle({
                page,
                limit,
                search,
                userId
            })
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en getExaminations:', error);
            return res.status(500).json({
                message: 'Error interno del servidor al procesar el historial de estudios.'
            });
        }
    }
}
