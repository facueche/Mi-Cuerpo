// app/src/pages/examinations.tsx
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
    ChevronRight,
    Loader2
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useExaminations } from "@/hooks/use-examinations" // Asegúrate de apuntar a la ruta correcta de tus hooks

export default function Examinations() {
    const navigate = useNavigate()

    // Inyectamos el límite de items por página (en tu mock tenías 2, lo dejamos igual)
    const {
        examinations: estudios,
        meta,
        searchTerm,
        setSearchTerm,
        loading,
        error,
        goToNextPage,
        goToPrevPage
    } = useExaminations(2)

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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                </div>

                {/* Feedback de error de red o base de datos */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Grid Adaptativo de Cards */}
                <div className={`grid gap-4 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                    {loading && estudios.length === 0 ? (
                        <div className="space-y-3 py-8 text-center text-sm text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                            Sincronizando registros médicos...
                        </div>
                    ) : estudios.length === 0 ? (
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
                    {/* Cálculos basados en la metadata real provista por el backend */}
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Mostrando <span className="font-semibold text-slate-900 dark:text-white">{((meta.page - 1) * meta.limit) + 1}</span> a{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {(meta.page * meta.limit) > meta.total ? meta.total : (meta.page * meta.limit)}
                        </span>{" "}
                        de <span className="font-semibold text-slate-900 dark:text-white">{meta.total}</span> estudios
                    </div>

                    {/* Botones de Navegación */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPrevPage}
                            disabled={meta.page === 1 || loading}
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
                            disabled={meta.page === meta.totalPages || loading}
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
