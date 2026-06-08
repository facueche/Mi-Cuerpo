import ExaminationRepository from "../domain/repositories/examination.repository";
import { StorageService } from "../../shared/domain/services/storage.service";

interface AttachmentFileInput {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

interface UploadAttachmentsParams {
    medicalEventId: string;
    userId: string; // Útil para validaciones multi-tenant cruzadas si se requiere
    files: AttachmentFileInput[];
}

export default class UploadExaminationAttachmentsService {
    constructor(
        private readonly examinationRepository: ExaminationRepository,
        private readonly storageService: StorageService
    ) { }

    async handle(params: UploadAttachmentsParams): Promise<{ message: string; count: number }> {
        const { medicalEventId, files } = params;

        if (!files || files.length === 0) {
            throw new Error("No se han provisto archivos válidos para adjuntar.");
        }

        // 1. Subir todos los archivos en paralelo al Storage Físico (Desacoplado)
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const uploadedUrl = await this.storageService.upload(
                    file.buffer,
                    file.originalname,
                    file.mimetype
                );

                return {
                    url: uploadedUrl,
                    fileType: file.mimetype
                };
            })
        );

        // 2. Delegar el guardado atómico relacional al repositorio de infraestructura
        await this.examinationRepository.addAttachments({
            medicalEventId,
            files: uploadedFiles
        });

        return {
            message: `Se han adjuntado ${uploadedFiles.length} archivos al estudio de forma exitosa.`,
            count: uploadedFiles.length
        };
    }
}
