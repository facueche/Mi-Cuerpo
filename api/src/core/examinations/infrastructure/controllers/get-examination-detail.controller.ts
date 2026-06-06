// api/src/core/examinations/infrastructure/controllers/get-examination-detail.controller.ts
import { Request, Response } from 'express';
import GetExaminationDetailService from '../../application/get-examination-detail.service';
import PrismaExaminationRepository from '../repositories/prisma-examination.repository';
import MedicalEventNotFoundError from '../../domain/errors/medical-event-not-found.error';

export default class GetExaminationDetailController {
    static async handle(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const examinationRepository = new PrismaExaminationRepository();
            const getDetailService = new GetExaminationDetailService(examinationRepository);

            const result = await getDetailService.handle({ id, userId });

            return res.status(200).json(result);
        } catch (error) {
            console.error('Error en GetExaminationDetailController:', error);
            if (error instanceof MedicalEventNotFoundError) {
                return res.status(404).json({
                    message: `No se encontró el registro médico solicitado o no tienes permisos para visualizarlo.`
                });
            }
            return res.status(500).json({
                message: 'Error interno del servidor al recuperar el detalle del estudio.'
            });
        }
    }
}
