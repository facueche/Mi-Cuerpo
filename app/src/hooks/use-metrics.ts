import { useState, useEffect, useCallback, useMemo } from 'react';
import HttpClient from '../services/api/http-client';
import MetricsService from '../services/api/metrics.service';
import type { MetricDetailResponse } from '../services/api/types/metrics';

export function useMetrics() {
    // Instanciamos el servicio utilizando tu cliente compartido e interceptado
    const metricsService = useMemo(() => {
        const httpClientInstance = new HttpClient().getHttpClient();
        return new MetricsService(httpClientInstance);
    }, []);

    const [available, setAvailable] = useState<string[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<string>("");
    const [data, setData] = useState<MetricDetailResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Carga inicial del catálogo de nombres disponibles
    useEffect(() => {
        const fetchAvailable = async () => {
            try {
                const list = await metricsService.getAvailableBiomarkers();
                setAvailable(list);
                if (list.length > 0) setSelectedMetric(list[0]);
            } catch (err: any) {
                console.error("Error cargando catálogo de biomarcadores:", err);
                setError(err.response?.data?.message || "No se pudo recuperar la lista de biomarcadores.");
            }
        };
        fetchAvailable();
    }, [metricsService]);

    // 2. Carga reactiva de los puntos y desglose del parámetro seleccionado
    const fetchHistory = useCallback(async (metricName: string) => {
        if (!metricName) return;
        setLoading(true);
        setError(null);
        try {
            const result = await metricsService.getBiomarkerHistory(metricName);
            setData(result);
        } catch (err: any) {
            console.error(`Error calculando historial para ${metricName}:`, err);
            setError(err.response?.data?.message || "No se pudo mapear la evolución cronológica del biomarcador.");
        } finally {
            setLoading(false);
        }
    }, [metricsService]);

    useEffect(() => {
        if (selectedMetric) fetchHistory(selectedMetric);
    }, [selectedMetric, fetchHistory]);

    return {
        available,
        selectedMetric,
        setSelectedMetric,
        data,
        loading,
        error,
        refresh: () => selectedMetric && fetchHistory(selectedMetric)
    };
}
