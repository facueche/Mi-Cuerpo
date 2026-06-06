import type MetricsRepository from "../domain/repositories/metrics.repository";

export default class GetBiomarkerHistoryService {
    constructor(private readonly metricsRepository: MetricsRepository) { }

    async handle(userId: string, parameterName: string) {
        const data = await this.metricsRepository.getBiomarkerHistory(userId, parameterName);

        if (!data) {
            return { parameter: parameterName, unit: "", referenceRange: "", points: [], table: [] };
        }

        // Formateamos para el cliente de React
        const points = data.history.map(h => ({
            fecha: h.date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' }),
            valor: h.value,
            alerta: h.isOutOfRange
        }));

        const table = data.history.map(h => ({
            id: h.id,
            fecha: h.date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }),
            valor: h.value,
            unidad: data.unit,
            alerta: h.isOutOfRange,
            laboratorio: h.laboratory,
            estudio: h.examinationTitle
        })).reverse(); // Tabla ordenada del más reciente al más antiguo

        return {
            parameter: data.parameter,
            unit: data.unit,
            referenceRange: data.referenceRange,
            points,
            table
        };
    }
}
