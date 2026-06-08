import { Request, Response } from 'express';
import PrismaExaminationRepository from '../repositories/prisma-examination.repository';
import UploadExaminationAttachmentsService from '../../application/upload-examination-attachments.service';
import { LocalStorageService } from '../../../shared/infrastructure/services/local-storage.service';

export default class UploadExaminationAttachmentsController {
    static async handle(req: Request, res: Response) {
        try {
            const { id: medicalEventId } = req.params;
            const userId = req.userId; // Inyectado por el AuthMiddleware

            // Multer inyecta los archivos múltiples bajo req.files cuando usamos .array()
            const expressFiles = req.files as Express.Multer.File[] | undefined;

            if (!expressFiles || expressFiles.length === 0) {
                return res.status(400).json({
                    message: "No se han detectado archivos adjuntos en el cuerpo del formulario ('attachments')."
                });
            }

            // Mapeamos al formato limpio que requiere nuestro caso de uso
            const filesToProcess = expressFiles.map(f => ({
                buffer: f.buffer,
                originalname: f.originalname,
                mimetype: f.mimetype
            }));

            const examinationRepository = new PrismaExaminationRepository();
            const localStorageService = new LocalStorageService();

            const uploadAttachmentsService = new UploadExaminationAttachmentsService(
                examinationRepository,
                localStorageService
            );

            const result = await uploadAttachmentsService.handle({
                medicalEventId,
                userId,
                files: filesToProcess
            });

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Error en UploadExaminationAttachmentsController:', error);

            if (error.name === 'MedicalEventNotFoundError' || error.message.includes('not found')) {
                return res.status(404).json({ message: "El estudio clínico especificado no existe." });
            }

            return res.status(500).json({
                message: error.message || 'Error interno al procesar y asociar los archivos anexos.'
            });
        }
    }
}
