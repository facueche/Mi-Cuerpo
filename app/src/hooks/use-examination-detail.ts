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

    const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
    const [attachmentsError, setAttachmentsError] = useState<string | null>(null);

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

    const uploadAttachments = useCallback(async (files: File[]) => {
        if (!id) return;

        setIsUploadingAttachments(true);
        setAttachmentsError(null);
        try {
            await examinationsService.uploadAttachments(id, files);
            await fetchDetail(); // Sincronización in-memory del agregado tras guardar en PostgreSQL
        } catch (err: any) {
            console.error("Error uploading attachments:", err);
            setAttachmentsError(err.response?.data?.message || "Error al subir los archivos adjuntos.");
            throw err; // Re-lanzamos para que el componente UI pueda reaccionar (ej. limpiar inputs)
        } finally {
            setIsUploadingAttachments(false);
        }
    }, [id, examinationsService, fetchDetail]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        examination,
        loading,
        error,
        isUploadingAttachments,
        attachmentsError,
        uploadAttachments,
        refresh: fetchDetail
    };
}
