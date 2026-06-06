import MetricsRepository from "../domain/repositories/metrics.repository";

export default class GetAvailableBiomarkersService {
    constructor(private readonly metricsRepository: MetricsRepository) { }

    async handle(userId: string) {
        const list = await this.metricsRepository.getAvailableBiomarkers(userId);
        return list;
    }
}
