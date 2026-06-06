import { Request, Response } from 'express';
import PrismaExaminationRepository from '../repositories/prisma-examination.repository';
import UploadExaminationCSVService from '../../application/upload-examination-csv.service';

export default class UploadExaminationController {
    static async handle(req: Request, res: Response) {
        try {
            const userId = req.userId;
            let fileBuffer: Buffer | undefined;

            // 1. Escenario A: El usuario subió un archivo físico mediante FormData
            if (req.file) {
                fileBuffer = req.file.buffer;
            }
            // 2. Escenario B: El usuario pegó el texto CSV en un campo de texto (JSON Body)
            else if (req.body && req.body.csvText) {
                const csvText = req.body.csvText.trim();
                if (!csvText) {
                    return res.status(400).json({ message: "El texto del CSV provisto está vacío." });
                }
                // Convertimos el string plano de UTF-8 a un Buffer binario compatible con el parser de stream
                fileBuffer = Buffer.from(csvText, 'utf-8');
            }

            // Si no se proveyó ninguna de las dos vías de ingreso, cortamos la ejecución
            if (!fileBuffer) {
                return res.status(400).json({
                    message: "No se ha adjuntado ningún archivo CSV ni se ha detectado texto pegado."
                });
            }

            const examinationRepository = new PrismaExaminationRepository();
            const uploadService = new UploadExaminationCSVService(examinationRepository);

            // Reutilizamos el servicio intacto pasando el Buffer unificado
            const result = await uploadService.handle({
                userId,
                fileBuffer
            });

            return res.status(201).json(result);
        } catch (error: any) {
            console.error('Error en UploadExaminationController:', error);
            return res.status(500).json({
                message: error.message || 'Error interno al procesar e importar la estructura CSV.'
            });
        }
    }
}
