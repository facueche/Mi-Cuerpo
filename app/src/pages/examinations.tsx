// src/pages/estudios.tsx
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    Search,
    Calendar,
    Landmark,
    AlertCircle,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useNavigate } from "react-router-dom"

// 1. Interfaces idénticas a las que usará tu Backend
interface Estudio {
    id: string;
    fecha: string;
    laboratorio: string;
    descripcion: string;
    alertas: number;
    categorias: string[];
}

interface ApiResponse {
    data: Estudio[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// El array base con todos tus datos de prueba (Universo de datos completo)
const mockEstudiosBase: Estudio[] = [
    {
        id: "evt-1",
        fecha: "22/05/2026",
        laboratorio: "Azar Laboratorios",
        descripcion: "Chequeo Anual Completo",
        alertas: 2,
        categorias: ["Hematología", "Química", "Endocrinología"]
    },
    {
        id: "evt-2",
        fecha: "14/11/2025",
        laboratorio: "Instituto Médico Alas",
        descripcion: "Perfil Lipídico de Control",
        alertas: 1,
        categorias: ["Química"]
    },
    {
        id: "evt-3",
        fecha: "05/01/2025",
        laboratorio: "Sanatorio Mater Dei",
        descripcion: "Rutina Post-Guardia",
        alertas: 0,
        categorias: ["Hematología", "Uroanálisis"]
    },
    {
        id: "evt-4",
        fecha: "12/04/2026",
        laboratorio: "Centro Oftalmológico Visión",
        descripcion: "Medición de Agudeza y Presión Intraocular",
        alertas: 1,
        categorias: ["Oftalmología"]
    },
    {
        id: "evt-5",
        fecha: "10/04/2026",
        laboratorio: "Dental Sano",
        descripcion: "Radiografía Panorámica Bucal",
        alertas: 0,
        categorias: ["Odontología"]
    }
]

const ITEMS_PER_PAGE = 2

export default function Examinations() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // 2. Simulación del Motor de Búsqueda de la DB (Filtrado inicial)
    const filteredBase = mockEstudiosBase.filter(estudio =>
        estudio.laboratorio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estudio.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // 3. CONSTRUCCIÓN DE LA RESPUESTA TIPO BACKEND
    // Calculamos los índices para segmentar los datos de esta página
    const totalItems = filteredBase.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE

    // Armamos el objeto simulando la estructura exacta del JSON esperado
    const responseServer: ApiResponse = {
        data: filteredBase.slice(indexOfFirstItem, indexOfLastItem), // Segmento de la página actual
        meta: {
            total: totalItems,
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            totalPages: totalPages
        }
    }

    // Desestructuramos para trabajar de forma estándar como si viniera de un fetch
    const { data: estudios, meta } = responseServer

    // 4. Handlers controlados
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Volvemos a la pág 1 si cambia el término buscado
    }

    const goToNextPage = () => {
        if (meta.page < meta.totalPages) setCurrentPage(prev => prev + 1)
    }

    const goToPrevPage = () => {
        if (meta.page > 1) setCurrentPage(prev => prev - 1)
    }

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 flex flex-col justify-between h-full">

            {/* Sección superior: Controles e Historial */}
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Historial de Estudios</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Visualiza y gestiona los documentos médicos y análisis indexados en tu servidor.
                    </p>
                </header>

                {/* Barra de Búsqueda */}
                <div className="flex items-center gap-2 max-w-md bg-white dark:bg-slate-950 rounded-lg border px-3 py-1 shadow-sm">
                    <Search className="h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por laboratorio o descripción..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                </div>

                {/* Grid Adaptativo de Cards */}
                <div className="grid gap-4">
                    {estudios.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-8">No se encontraron estudios.</p>
                    ) : (
                        estudios.map((estudio) => (
                            <Card
                                key={estudio.id}
                                onClick={() => navigate(`/estudios/${estudio.id}`)}
                                className="hover:border-blue-200 transition-all cursor-pointer dark:hover:border-blue-900"
                            >
                                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                    {/* Info Principal */}
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                                                {estudio.descripcion}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Landmark className="h-3 w-3" /> {estudio.laboratorio}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {estudio.fecha}
                                                </span>
                                            </div>
                                            {/* Badges de Categorías */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {estudio.categorias.map(cat => (
                                                    <Badge key={cat} variant="secondary" className="text-[10px] px-2 py-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status / Alertas e Interacción */}
                                    <div className="flex items-center justify-between border-t pt-3 sm:border-t-0 sm:pt-0 sm:justify-end gap-4 border-slate-100 dark:border-slate-800">
                                        {estudio.alertas > 0 ? (
                                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                {estudio.alertas} {estudio.alertas === 1 ? 'alerta' : 'alertas'}
                                            </div>
                                        ) : (
                                            <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full">
                                                Valores Óptimos
                                            </div>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 p-0 sm:p-2" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/estudios/${estudio.id}`);
                                        }}>
                                            Ver PDF <ArrowUpRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* CONTROLES DE PAGINACIÓN COMPLEMENTARIOS */}
            {meta.total > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    {/* Cálculos basados en la metadata simulada */}
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Mostrando <span className="font-semibold text-slate-900 dark:text-white">{indexOfFirstItem + 1}</span> a{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {indexOfLastItem > meta.total ? meta.total : indexOfLastItem}
                        </span>{" "}
                        de <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span> estudios
                    </div>

                    {/* Botones de Navegación */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={meta.page === 1}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1">Anterior</span>
                        </Button>

                        <div className="text-xs font-medium px-2 text-slate-700 dark:text-slate-300">
                            Pág. {meta.page} de {meta.totalPages}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextPage}
                            disabled={meta.page === meta.totalPages}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                        >
                            <span className="hidden sm:inline mr-1">Siguiente</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
