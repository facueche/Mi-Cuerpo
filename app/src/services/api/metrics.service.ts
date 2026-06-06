import { type AxiosInstance } from "axios";
import type { MetricDetailResponse } from "./types/metrics";

export default class MetricsService {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance) {
        this.httpClient = httpClient;
    }

    public async getAvailableBiomarkers(): Promise<string[]> {
        const response = await this.httpClient.get<string[]>('/metrics/available');
        return response.data;
    }

    public async getBiomarkerHistory(parameterName: string): Promise<MetricDetailResponse> {
        const response = await this.httpClient.get<MetricDetailResponse>('/metrics/history', {
            params: { parameter: parameterName }
        });
        return response.data;
    }
}
