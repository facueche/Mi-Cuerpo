import { prisma } from "../../../../config/prisma";
import DashboardRepository, { DashboardMetricsDTO } from "../../domain/repositories/dashboard.repository";

export default class PrismaDashboardRepository implements DashboardRepository {
    async getMetrics(userId: string): Promise<DashboardMetricsDTO> {

        // Ejecutamos consultas independientes optimizadas en paralelo
        const [
            totalExaminations,
            totalMeasurements,
            outOfRangeMeasurements,
            rawMeasurementsHistory,
            rawCategories
        ] = await Promise.all([
            // 1. Total de eventos médicos
            prisma.medicalEvent.count({ where: { userId } }),

            // 2. Total de mediciones hechas en toda su historia
            prisma.measurement.count({
                where: { study: { medicalEvent: { userId } } }
            }),

            // 3. Total de mediciones que dieron alerta
            prisma.measurement.count({
                where: {
                    isOutOfRange: true,
                    study: { medicalEvent: { userId } }
                }
            }),

            // 4. Historial temporal de biomarcadores core (ej: Colesterol y Glucemia para las curvas)
            prisma.measurement.findMany({
                where: {
                    study: { medicalEvent: { userId } },
                    parameter: { in: ["Colesterol Total", "Glucemia en Ayunas", "Triglicéridos"], mode: 'insensitive' }
                },
                select: {
                    parameter: true,
                    value: true,
                    isOutOfRange: true,
                    study: { select: { date: true } }
                },
                orderBy: { study: { date: 'asc' } } // Cronología ascendente para el gráfico de líneas
            }),

            // 5. Traer las categorías de los estudios para agruparlas
            prisma.study.findMany({
                where: { medicalEvent: { userId } },
                select: { category: true }
            })
        ]);

        // --- Post-procesamiento ligero de datos agregados ---

        // Calcular porcentaje de mediciones óptimas
        const optimalStudiesPercentage = totalMeasurements > 0
            ? Math.round(((totalMeasurements - outOfRangeMeasurements) / totalMeasurements) * 100)
            : 100;

        // Agrupar historial por parámetro clínico
        const biomarkerMap = new Map<string, DashboardMetricsDTO["biomarkerHistory"][number]["history"]>();
        for (const m of rawMeasurementsHistory) {
            if (!biomarkerMap.has(m.parameter)) biomarkerMap.set(m.parameter, []);
            biomarkerMap.get(m.parameter)!.push({
                date: m.study.date,
                value: m.value,
                isOutOfRange: m.isOutOfRange
            });
        }
        const biomarkerHistory = Array.from(biomarkerMap.entries()).map(([parameter, history]) => ({
            parameter,
            history
        }));

        // Agrupar y contar distribución de categorías para el gráfico de torta
        const categoryCounts: Record<string, number> = {};
        for (const s of rawCategories) {
            categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
        }
        const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
        }));

        return {
            totalExaminations,
            totalAlerts: outOfRangeMeasurements,
            optimalStudiesPercentage,
            biomarkerHistory,
            categoryDistribution
        };
    }
}
