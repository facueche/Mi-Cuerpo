import type DashboardRepository from "../domain/repositories/dashboard.repository";

interface GetMetricsParams {
    userId: string;
}

export default class GetDashboardMetricsService {
    constructor(
        private readonly dashboardRepository: DashboardRepository
    ) { }

    async handle(params: GetMetricsParams) {
        const metrics = await this.dashboardRepository.getMetrics(params.userId);

        const formattedBiomarkerHistory = metrics.biomarkerHistory.map(group => ({
            parameter: group.parameter,
            data: group.history.map(h => ({
                fecha: h.date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
                valor: h.value,
                alerta: h.isOutOfRange
            }))
        }));

        return {
            cards: {
                totalEstudios: metrics.totalExaminations,
                totalAlertas: metrics.totalAlerts,
                porcentajeOptimos: metrics.optimalStudiesPercentage
            },
            graficoEvolucion: formattedBiomarkerHistory,
            distribucionCategorias: metrics.categoryDistribution
        };
    }
}
