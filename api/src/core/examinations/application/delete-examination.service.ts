import UnauthorizedError from "../domain/errors/unathorized.error";
import ExaminationRepository from "../domain/repositories/examination.repository";

interface DeleteExaminationParams {
    examinationId: string;
    userId: string;
}

export default class DeleteExaminationService {
    constructor(
        private readonly examinationRepository: ExaminationRepository
    ) { }

    async handle(params: DeleteExaminationParams): Promise<{ message: string }> {
        const examination = await this.examinationRepository.getById(params.examinationId);

        console.log("examination.userId", examination.userId);
        console.log("params.userId", params.userId);
        if (examination.userId !== params.userId) {
            throw new UnauthorizedError("No tiene permisos para eliminar este estudio clínico.");
        }

        await this.examinationRepository.deleteById(params.examinationId);

        return {
            message: "Estudio clínico y todos sus biomarcadores asociados eliminados con éxito."
        };
    }
}
