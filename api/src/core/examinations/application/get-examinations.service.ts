import { Prisma } from "../../../generated/prisma/client";
import type ExaminationRepository from "../domain/repositories/examination.repository";

interface GetAllParams {
    page: number
    limit: number
    search?: string
    userId: string
}

type MedicalEventWithRelations = Prisma.MedicalEventGetPayload<{
    include: {
        studies: {
            select: {
                category: true
                measurements: {
                    select: { isOutOfRange: true }
                }
            }
        }
    }
}>

export default class GetExaminationsService {
    constructor(
        private readonly examinationRepository: ExaminationRepository
    ) { }

    async handle(params: GetAllParams) {
        const [totalItems, medicalEvents] = await this.examinationRepository.getAll(params)

        const formattedData = (medicalEvents as MedicalEventWithRelations[]).map((event) => {
            const categorias = Array.from(
                new Set(event.studies.map((s) => s.category))
            );

            const alertas = event.studies.reduce((totalAlertas, study) => {
                const outOfRangeCount = study.measurements.filter(m => m.isOutOfRange).length;
                return totalAlertas + outOfRangeCount;
            }, 0);

            const fechaFormateada = event.date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'UTC'
            });

            return {
                id: event.id,
                fecha: fechaFormateada,
                laboratorio: event.institution || 'No especificado',
                descripcion: event.title,
                alertas: alertas,
                categorias: categorias
            };
        });

        const totalPages = Math.ceil(totalItems / params.limit) || 1;

        return {
            data: formattedData,
            meta: {
                total: totalItems,
                page: params.page,
                limit: params.limit,
                totalPages: totalPages
            }
        };
    }
}
