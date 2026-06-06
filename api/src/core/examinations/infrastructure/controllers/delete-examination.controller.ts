import { Request, Response } from "express";
import PrismaExaminationRepository from "../repositories/prisma-examination.repository";
import DeleteExaminationService from "../../application/delete-examination.service";
import MedicalEventNotFoundError from "../../domain/errors/medical-event-not-found.error";
import UnauthorizedError from "../../domain/errors/unathorized.error";

export default class DeleteExaminationController {
    static async handle(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const examinationRepository = new PrismaExaminationRepository();
            const deleteExaminationService = new DeleteExaminationService(examinationRepository);

            const result = await deleteExaminationService.handle({
                examinationId: id,
                userId
            });

            res.status(200).json(result);
        } catch (error: any) {
            console.error("Error en ExaminationController [DELETE]:", error);

            // Manejo de códigos HTTP semánticos
            if (error instanceof MedicalEventNotFoundError) {
                res.status(404).json({ message: error.message });
                return;
            }
            if (error instanceof UnauthorizedError) {
                res.status(403).json({ message: error.message });
                return;
            }

            res.status(500).json({ message: "Ocurrió un error interno al intentar eliminar el registro médico." });
        }
    };
}
