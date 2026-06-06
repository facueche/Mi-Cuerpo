export type MetricHistoryPoint = {
    fecha: string;
    valor: number;
    alerta: boolean;
}

export type MetricTableRecord = {
    id: string;
    fecha: string;
    valor: number;
    unidad: string;
    alerta: boolean;
    laboratorio: string;
    estudio: string;
}

export type MetricDetailResponse = {
    parameter: string;
    unit: string;
    referenceRange: string;
    points: MetricHistoryPoint[];
    table: MetricTableRecord[];
}
