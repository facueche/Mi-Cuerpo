export type DashboardCards = {
    totalEstudios: number;
    totalAlertas: number;
    porcentajeOptimos: number;
}

export type BiomarkerDataPoint = {
    fecha: string;
    valor: number;
    alerta: boolean;
}

export type BiomarkerHistoryGroup = {
    parameter: string;
    data: BiomarkerDataPoint[];
}

export type CategoryDistribution = {
    category: string;
    count: number;
}

export type DashboardMetricsResponse = {
    cards: DashboardCards;
    graficoEvolucion: BiomarkerHistoryGroup[];
    distribucionCategorias: CategoryDistribution[];
}
