import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Landmark, AlertTriangle, CheckCircle2, BrainCircuit, FileText, Loader2 } from "lucide-react"
import { useExaminationDetail } from "@/hooks/use-examination-detail" // Ajustá la ruta según tu proyecto

export default function ExaminationDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Conectamos el hook real pasándole el ID proveniente de la URL
    const { examination, loading, error } = useExaminationDetail(id)

    // 1. Estado de carga inicial
    if (loading && !examination) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Recuperando reporte clínico del servidor...</p>
            </div>
        )
    }

    // 2. Estado de error (Ej: Registro inexistente o error 404 multi-tenant)
    if (error || !examination) {
        return (
            <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 space-y-4 text-center max-w-md mx-auto pt-16">
                <div className="p-3 bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-full w-fit mx-auto">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">No se pudo cargar el estudio</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {error || "El registro solicitado no existe o no posees los accesos para visualizarlo."}
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate("/examinations")} className="mt-2">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 space-y-6">

            {/* Botón de Retorno y Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/examinations")}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Estudios
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        {examination.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> {examination.institution}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {examination.date}</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                    disabled={examination.files.length === 0}
                    onClick={() => {
                        if (examination.files.length > 0) window.open(examination.files[0].url, "_blank")
                    }}
                >
                    <FileText className="h-4 w-4" /> Ver Archivo Original
                </Button>
            </div>

            {/* Bloque Inteligente: Interpretación Clínica Automatizada (IA / RawData fallback) */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-950/40 dark:from-slate-950 dark:to-slate-900">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <BrainCircuit className="h-5 w-5" /> Resumen de Interpretación Digital
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">
                        Análisis consolidado mediante el motor de estructuración semántica.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {examination.description || `Este estudio médico contiene ${examination.studies.length} secciones analizadas con un total de ${examination.totalAlertas} biomarcadores fuera de los rangos de referencia normales.`}
                    </p>
                </CardContent>
            </Card>

            {/* Listado Dinámico de Bloques Médicos Reales */}
            <div className="space-y-6">
                {examination.studies.map((study) => (
                    <Card key={study.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-100/50 dark:bg-slate-950/50 py-3 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {study.category}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-4 sm:pl-6">Biomarcador</TableHead>
                                        <TableHead className="text-right">Resultado</TableHead>
                                        <TableHead className="hidden sm:table-cell text-center">Unidad</TableHead>
                                        <TableHead className="text-right pr-4 sm:pr-6">Rango de Referencia</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {study.measurements.map((measurement) => (
                                        <TableRow key={measurement.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">

                                            {/* Nombre + Icono de Alerta */}
                                            <TableCell className="font-medium pl-4 sm:pl-6 max-w-[160px] sm:max-w-none truncate">
                                                <div className="flex items-center gap-2">
                                                    {measurement.isOutOfRange ? (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    )}
                                                    <span className={measurement.isOutOfRange ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-slate-900 dark:text-slate-100"}>
                                                        {measurement.parameter}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Resultado Numérico */}
                                            <TableCell className="text-right font-mono">
                                                <span className={measurement.isOutOfRange ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2 py-0.5 rounded font-bold" : "text-slate-700 dark:text-slate-300 font-medium"}>
                                                    {measurement.value}
                                                    <span className="inline sm:hidden text-[10px] text-slate-400 font-sans ml-1">{measurement.unit}</span>
                                                </span>
                                            </TableCell>

                                            {/* Unidad desktop */}
                                            <TableCell className="hidden sm:table-cell text-center text-xs text-slate-400 font-medium">
                                                {measurement.unit}
                                            </TableCell>

                                            {/* Límites de Referencia calculados por el dominio */}
                                            <TableCell className="text-right pr-4 sm:pr-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {measurement.referenceRange}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
