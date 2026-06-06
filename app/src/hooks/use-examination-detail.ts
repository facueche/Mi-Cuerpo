import { useState, useEffect, useCallback, useMemo } from "react";
import HttpClient from "../services/api/http-client";
import ExaminationsService from "../services/api/examinations.service";
import type { ExaminationDetailResponse } from "../services/api/types/examinations";

export function useExaminationDetail(id: string | undefined) {
    const examinationsService = useMemo(() => {
        const httpClientInstance = new HttpClient().getHttpClient();
        return new ExaminationsService(httpClientInstance);
    }, []);

    const [examination, setExamination] = useState<ExaminationDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const data = await examinationsService.getById(id);
            setExamination(data);
        } catch (err: any) {
            console.error("Error fetching examination detail:", err);
            setError(err.response?.data?.message || "No se pudo recuperar el detalle del estudio.");
        } finally {
            setLoading(false);
        }
    }, [id, examinationsService]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        examination,
        loading,
        error,
        refresh: fetchDetail
    };
}
