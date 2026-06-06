import { prisma } from "../../../../config/prisma";
import MetricsRepository, { BiomarkerHistoryDetailDTO } from "../../domain/repositories/metrics.repository";

export default class PrismaMetricsRepository implements MetricsRepository {

    async getAvailableBiomarkers(userId: string): Promise<string[]> {
        const measurements = await prisma.measurement.findMany({
            where: { study: { medicalEvent: { userId } } },
            select: { parameter: true },
            distinct: ['parameter'],
            orderBy: { parameter: 'asc' }
        });
        return measurements.map(m => m.parameter);
    }

    async getBiomarkerHistory(userId: string, parameterName: string): Promise<BiomarkerHistoryDetailDTO | null> {
        const records = await prisma.measurement.findMany({
            where: {
                study: { medicalEvent: { userId } },
                parameter: { equals: parameterName, mode: 'insensitive' }
            },
            select: {
                id: true,
                value: true,
                unit: true,
                minReference: true,
                maxReference: true,
                isOutOfRange: true,
                parameter: true,
                study: {
                    select: {
                        date: true,
                        category: true,
                        medicalEvent: {
                            select: { title: true, institution: true }
                        }
                    }
                }
            },
            orderBy: { study: { date: 'asc' } }
        });

        if (records.length === 0) return null;

        return {
            parameter: records[0].parameter || parameterName,
            unit: records[0].unit,
            referenceRange: records[0].minReference + " - " + records[0].maxReference,
            history: records.map(r => ({
                id: r.id,
                date: r.study.date,
                value: r.value,
                isOutOfRange: r.isOutOfRange,
                laboratory: r.study.medicalEvent.institution || '',
                examinationTitle: r.study.medicalEvent.title || ''
            }))
        };
    }
}
