import { useState, useEffect, useCallback, useMemo } from "react";
import HttpClient from "../services/api/http-client";
import DashboardService from "../services/api/dashboard.service";
import type { DashboardMetricsResponse } from "../services/api/types/dashboard";

export function useDashboard() {
    const dashboardService = useMemo(() => {
        const httpClientInstance = new HttpClient().getHttpClient();
        return new DashboardService(httpClientInstance);
    }, []);

    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dashboardService.getMetrics();
            setMetrics(data);
        } catch (err: any) {
            console.error("Error recuperando analíticas del dashboard:", err);
            setError(err.response?.data?.message || "No se pudieron calcular las estadísticas en este momento.");
        } finally {
            setLoading(false);
        }
    }, [dashboardService]);

    useEffect(() => {
        fetchDashboardMetrics();
    }, [fetchDashboardMetrics]);

    return {
        metrics,
        loading,
        error,
        refresh: fetchDashboardMetrics
    };
}
