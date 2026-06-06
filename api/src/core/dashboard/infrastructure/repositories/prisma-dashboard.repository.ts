import { prisma } from "../../../../config/prisma";
import { EncryptionService } from "../../../shared/application/encryption.service";
import DashboardRepository, { DashboardMetricsDTO } from "../../domain/repositories/dashboard.repository";

export default class PrismaDashboardRepository implements DashboardRepository {
    async getMetrics(userId: string): Promise<DashboardMetricsDTO> {

        const [
            totalExaminations,
            totalMeasurements,
            outOfRangeMeasurements,
            rawMeasurements,
            rawCategories
        ] = await Promise.all([
            // 1. Total de eventos médicos (No sensible al cifrado textual)
            prisma.medicalEvent.count({ where: { userId } }),

            // 2. Total de mediciones (No sensible al cifrado textual)
            prisma.measurement.count({
                where: { study: { medicalEvent: { userId } } }
            }),

            // 3. Total de mediciones alertas (No sensible al cifrado textual, es un booleano)
            prisma.measurement.count({
                where: {
                    isOutOfRange: true,
                    study: { medicalEvent: { userId } }
                }
            }),

            // 4. Historial de biomarcadores core (Traemos las mediciones y las filtramos tras desencriptar)
            prisma.measurement.findMany({
                where: {
                    study: { medicalEvent: { userId } }
                },
                select: {
                    parameter: true,
                    value: true,
                    isOutOfRange: true,
                    study: { select: { date: true } }
                },
                orderBy: { study: { date: 'asc' } }
            }),

            // 5. Categorías para agrupar (Se desencriptan para agruparse correctamente)
            prisma.study.findMany({
                where: { medicalEvent: { userId } },
                select: { category: true }
            })
        ]);

        // --- Post-procesamiento analítico con desencriptación en memoria ---

        // Filtrar y agrupar los biomarcadores Core unificados en memoria para no romper tus gráficos
        const targetCoreBiomarkers = ["Colesterol Total", "Glucemia", "Triglicéridos"];
        const biomarkerMap = new Map<string, DashboardMetricsDTO["biomarkerHistory"][number]["history"]>();

        for (const m of rawMeasurements) {
            const decParameter = EncryptionService.decrypt(m.parameter);
            if (decParameter && targetCoreBiomarkers.includes(decParameter)) {
                if (!biomarkerMap.has(decParameter)) {
                    biomarkerMap.set(decParameter, []);
                }
                biomarkerMap.get(decParameter)!.push({
                    date: m.study.date,
                    value: m.value,
                    isOutOfRange: m.isOutOfRange
                });
            }
        }

        const biomarkerHistory = Array.from(biomarkerMap.entries()).map(([parameter, history]) => ({
            parameter,
            history
        }));

        // Contar distribución de categorías desencriptadas para el gráfico de torta
        const categoryCounts: Record<string, number> = {};
        for (const s of rawCategories) {
            const decCategory = EncryptionService.decrypt(s.category);
            if (decCategory) {
                categoryCounts[decCategory] = (categoryCounts[decCategory] || 0) + 1;
            }
        }

        const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
        }));

        const optimalStudiesPercentage = totalMeasurements > 0
            ? Math.round(((totalMeasurements - outOfRangeMeasurements) / totalMeasurements) * 100)
            : 100;

        return {
            totalExaminations,
            totalAlerts: outOfRangeMeasurements,
            optimalStudiesPercentage,
            biomarkerHistory,
            categoryDistribution
        };
    }
}
