export interface DashboardMetricsDTO {
    totalExaminations: number;
    totalAlerts: number;
    optimalStudiesPercentage: number;
    biomarkerHistory: {
        parameter: string;
        history: {
            date: Date;
            value: number;
            isOutOfRange: boolean;
        }[];
    }[];
    categoryDistribution: {
        category: string;
        count: number;
    }[];
}

export default interface DashboardRepository {
    getMetrics(userId: string): Promise<DashboardMetricsDTO>;
}
