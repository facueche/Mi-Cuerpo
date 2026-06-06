// api/src/core/examinations/application/get-examination-detail.service.ts
import { Prisma } from "../../../generated/prisma/client";
import type ExaminationRepository from "../domain/repositories/examination.repository";

interface GetDetailParams {
    id: string;
    userId: string;
}

// Tipo tipado para la estructura relacional profunda que recupera Infraestructura
type MedicalEventDetailWithRelations = Prisma.MedicalEventGetPayload<{
    include: {
        files: true;
        studies: {
            include: {
                measurements: true;
            }
        }
    }
}>

export default class GetExaminationDetailService {
    constructor(
        private readonly examinationRepository: ExaminationRepository
    ) { }

    async handle(params: GetDetailParams) {
        const event = await this.examinationRepository.getById(params.id, params.userId);

        const fullEvent = event as MedicalEventDetailWithRelations;

        // 1. Calcular estadísticas rápidas del estudio para el header de la vista de detalle
        let totalAlertas = 0;

        const studiesFormatted = fullEvent.studies.map((study) => {
            const outOfRangeCount = study.measurements.filter(m => m.isOutOfRange).length;
            totalAlertas += outOfRangeCount;

            return {
                id: study.id,
                category: study.category,
                // Devolvemos los biomarcadores estructurados de este sub-estudio
                measurements: study.measurements.map(m => ({
                    id: m.id,
                    parameter: m.parameter,
                    value: m.value,
                    unit: m.unit,
                    referenceRange: m.minReference !== null && m.maxReference !== null
                        ? `${m.minReference} - ${m.maxReference}`
                        : m.maxReference !== null ? `< ${m.maxReference}` : m.minReference !== null ? `> ${m.minReference}` : 'No especificado',
                    isOutOfRange: m.isOutOfRange
                }))
            };
        });

        // 2. Formatear la fecha para que el cliente no lidie con conversiones ISO crudas
        const fechaFormateada = fullEvent.date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
        });

        // 3. Retornar el esquema unificado (Aggregate DTO)
        return {
            id: fullEvent.id,
            title: fullEvent.title,
            date: fechaFormateada,
            doctorName: fullEvent.doctorName || 'No especificado',
            institution: fullEvent.institution || 'No especificado',
            description: fullEvent.description,
            totalAlertas,
            studies: studiesFormatted,
            files: fullEvent.files.map(f => ({
                id: f.id,
                url: f.url,
                fileType: f.fileType
            }))
        };
    }
}
