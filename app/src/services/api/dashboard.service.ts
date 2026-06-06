import { type AxiosInstance } from "axios";
import type { DashboardMetricsResponse } from "./types/dashboard";

export default class DashboardService {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance) {
        this.httpClient = httpClient;
    }

    public async getMetrics(): Promise<DashboardMetricsResponse> {
        const response = await this.httpClient.get<DashboardMetricsResponse>('/dashboard/metrics');
        return response.data;
    }
}
