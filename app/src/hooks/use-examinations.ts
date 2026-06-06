import { useState, useEffect, useCallback } from "react";
import HttpClient from "../services/api/http-client";
import ExaminationsService from "../services/api/examinations.service";
import type { Examination, ApiMeta } from "../services/api/types/examinations";
import { storageService } from "@/services/storage/storage.service";

export function useExaminations(initialLimit = 5) {
    const httpClient = new HttpClient();
    httpClient.setAuthToken(storageService.getToken());
    const examinationsService = new ExaminationsService(httpClient.getHttpClient());

    const [examinations, setExaminations] = useState<Examination[]>([]);
    const [meta, setMeta] = useState<ApiMeta>({
        total: 0,
        page: 1,
        limit: initialLimit,
        totalPages: 1
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Efecto Debounce para la barra de búsqueda (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setMeta(prev => ({ ...prev, page: 1 })); // Resetea a la pág 1 en cada búsqueda nueva
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // 2. Función centralizada para pedir los datos al backend
    const fetchExaminations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await examinationsService.getAll({
                page: meta.page,
                limit: meta.limit,
                search: debouncedSearch
            });
            setExaminations(response.data);
            setMeta(response.meta);
        } catch (err: any) {
            console.error("Error fetching examinations:", err);
            setError(err.response?.data?.message || "Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    }, [meta.page, meta.limit, debouncedSearch]);

    // Disparador del fetch ante mutaciones de estados de control
    useEffect(() => {
        fetchExaminations();
    }, [fetchExaminations]);

    // 3. Handlers de navegación de páginas explícitos
    const goToNextPage = () => {
        if (meta.page < meta.totalPages) {
            setMeta(prev => ({ ...prev, page: prev.page + 1 }));
        }
    };

    const goToPrevPage = () => {
        if (meta.page > 1) {
            setMeta(prev => ({ ...prev, page: prev.page - 1 }));
        }
    };

    // 4. Acción mutadora: Subida de archivo CSV
    const uploadCSV = async (file: File): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await examinationsService.uploadCSV(file);
            await fetchExaminations(); // Re-sincroniza la lista actual tras la ingesta exitosa
        } catch (err: any) {
            console.error("Error uploading CSV:", err);
            const errMsg = err.response?.data?.message || "Error al subir la plantilla CSV.";
            setError(errMsg);
            throw new Error(errMsg); // Lo re-lanzamos por si la página quiere reaccionar con un toast
        } finally {
            setLoading(false);
        }
    };

    return {
        examinations,
        meta,
        searchTerm,
        setSearchTerm,
        loading,
        error,
        goToNextPage,
        goToPrevPage,
        uploadCSV,
        refresh: fetchExaminations
    };
}
