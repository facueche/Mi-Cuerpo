export interface BiomarkerHistoryDetailDTO {
    parameter: string;
    unit: string;
    referenceRange: string;
    history: {
        id: string;
        date: Date;
        value: number;
        isOutOfRange: boolean;
        laboratory: string;
        examinationTitle: string;
    }[];
}

export default interface MetricsRepository {
    getBiomarkerHistory(userId: string, parameterName: string): Promise<BiomarkerHistoryDetailDTO | null>;
    getAvailableBiomarkers(userId: string): Promise<string[]>;
}
