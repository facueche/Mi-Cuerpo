import { prisma } from "../../../../config/prisma";
import { EncryptionService } from "../../../shared/application/encryption.service";
import MetricsRepository, { BiomarkerHistoryDetailDTO } from "../../domain/repositories/metrics.repository";

export default class PrismaMetricsRepository implements MetricsRepository {

    async getAvailableBiomarkers(userId: string): Promise<string[]> {
        // Nota arquitectónica: Para obtener los biomarcadores únicos del usuario, 
        // traemos todas las mediciones asignadas, las desencriptamos y eliminamos duplicados en memoria.
        const measurements = await prisma.measurement.findMany({
            where: { study: { medicalEvent: { userId } } },
            select: { parameter: true }
        });

        const decryptedParameters = measurements
            .map(m => EncryptionService.decrypt(m.parameter))
            .filter((val): val is string => !!val);

        // Filtramos elementos únicos y ordenamos alfabéticamente
        const uniqueParameters = Array.from(new Set(decryptedParameters)).sort();

        return uniqueParameters;
    }

    async getBiomarkerHistory(userId: string, parameterName: string): Promise<BiomarkerHistoryDetailDTO | null> {
        // Traemos todas las mediciones históricas del usuario
        const records = await prisma.measurement.findMany({
            where: {
                study: { medicalEvent: { userId } }
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

        // Filtramos en memoria buscando coincidencias desencriptadas con el parámetro clínico solicitado
        const targetParameterLower = parameterName.toLowerCase();

        const matchingRecords = records.filter(r => {
            const decParam = EncryptionService.decrypt(r.parameter);
            return decParam?.toLowerCase() === targetParameterLower;
        });

        if (matchingRecords.length === 0) return null;

        return {
            parameter: EncryptionService.decrypt(matchingRecords[0].parameter) || parameterName,
            unit: matchingRecords[0].unit,
            referenceRange: matchingRecords[0].minReference + " - " + matchingRecords[0].maxReference,
            history: matchingRecords.map(r => ({
                id: r.id,
                date: r.study.date,
                value: r.value,
                isOutOfRange: r.isOutOfRange,
                laboratory: EncryptionService.decrypt(r.study.medicalEvent.institution) || '',
                examinationTitle: EncryptionService.decrypt(r.study.medicalEvent.title) || ''
            }))
        };
    }
}
