import { Request, Response } from 'express';
import PrismaExaminationRepository from '../repositories/prisma-examination.repository';
import UploadExaminationCSVService from '../../application/upload-examination-csv.service';

export default class UploadExaminationController {
    static async handle(req: Request, res: Response) {
        try {
            const userId = req.userId;

            if (!req.file) {
                return res.status(400).json({ message: "No se ha adjuntado ningún archivo CSV." });
            }

            const examinationRepository = new PrismaExaminationRepository();
            const uploadService = new UploadExaminationCSVService(examinationRepository);

            const result = await uploadService.handle({
                userId,
                fileBuffer: req.file.buffer // Recupera el buffer binario en memoria
            });

            return res.status(201).json(result);
        } catch (error: any) {
            console.error('Error en UploadExaminationController:', error);
            return res.status(500).json({
                message: error.message || 'Error interno al procesar e importar el archivo CSV.'
            });
        }
    }
}
