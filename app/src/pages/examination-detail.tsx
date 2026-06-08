import { useParams, useNavigate } from "react-router-dom"
import { Button as ShadcnButton } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ArrowLeft,
    Calendar,
    Landmark,
    AlertTriangle,
    CheckCircle2,
    BrainCircuit,
    FileText,
    Loader2,
    Paperclip,
    UploadCloud,
    ExternalLink
} from "lucide-react"
import { useExaminationDetail } from "@/hooks/use-examination-detail"
import { useRef, useState } from "react"
import { env } from "@/config/env"

export default function ExaminationDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        examination,
        loading,
        error,
        isUploadingAttachments,
        attachmentsError,
        uploadAttachments
    } = useExaminationDetail(id)

    const [uploadSuccess, setUploadSuccess] = useState(false)

    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        try {
            setUploadSuccess(false);
            const filesArray = Array.from(files);
            await uploadAttachments(filesArray);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch {
            // Error manejado por el hook
        }
    };

    if (loading && !examination) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Recuperando reporte clínico del servidor...</p>
            </div>
        )
    }

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
                <ShadcnButton variant="outline" size="sm" onClick={() => navigate("/estudios")} className="mt-2">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
                </ShadcnButton>
            </div>
        )
    }

    return (
        // Añadimos w-full y overflow-hidden para blindar la pantalla de desbordes accidentales
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 space-y-6 w-full overflow-hidden">

            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
                accept=".pdf,image/*"
            />

            {/* Encabezado Principal */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 min-w-0"> {/* min-w-0 ayuda a que los textos internos puedan truncarse si el título es muy largo */}
                    <ShadcnButton
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/estudios")}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Estudios
                    </ShadcnButton>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl truncate">
                        {examination.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 truncate"><Landmark className="h-3.5 w-3.5 shrink-0" /> {examination.institution}</span>
                        <span className="flex items-center gap-1 shrink-0"><Calendar className="h-3.5 w-3.5 shrink-0" /> {examination.date}</span>
                    </div>
                </div>

                <ShadcnButton
                    variant="default"
                    size="sm"
                    disabled={isUploadingAttachments}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-sm shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploadingAttachments ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Adjuntando...</>
                    ) : (
                        <><Paperclip className="h-4 w-4" /> Adjuntar Documentación</>
                    )}
                </ShadcnButton>
            </div>

            {/* Layout en Grid Principal */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full">

                {/* Panel Clínico Izquierdo (Ocupa 2 columnas en Desktop, 1 en Mobile) */}
                <div className="lg:col-span-2 space-y-6 min-w-0"> {/* min-w-0 es clave aquí para que el flex/grid respete los hijos */}

                    {/* Resumen de Interpretación Digital */}
                    <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white dark:border-blue-950/40 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <BrainCircuit className="h-5 w-5 shrink-0" /> Resumen de Interpretación Digital
                            </CardTitle>
                            {examination.description && (
                                <CardDescription className="dark:text-slate-400 break-words">{examination.description}</CardDescription>
                            )}
                            {examination.doctorName && (
                                <CardDescription className="dark:text-slate-400 truncate">Pedido por: {examination.doctorName}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {`Este estudio médico contiene ${examination.studies.length} secciones analizadas con un total de ${examination.totalAlertas} biomarcadores fuera de los rangos de referencia normales.`}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Listado Dinámico de Bloques Médicos Reales */}
                    <div className="space-y-6">
                        {examination.studies.map((study) => (
                            <Card key={study.id} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-100/50 dark:bg-slate-950/50 py-3 border-b border-slate-200 dark:border-slate-800">
                                    <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{study.category}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* CORRECCIÓN CRÍTICA: Envoltura con scroll x controlado para que la tabla no rompa el ancho del dispositivo móvil */}
                                    <div className="w-full overflow-x-auto scrollbar-thin">
                                        <Table className="min-w-[500px] sm:min-w-full">
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
                                                        <TableCell className="font-medium pl-4 sm:pl-6 max-w-[150px] sm:max-w-none">
                                                            <div className="flex items-center gap-2">
                                                                {measurement.isOutOfRange ? (
                                                                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                                                ) : (
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                                )}
                                                                <span className={`truncate text-xs sm:text-sm ${measurement.isOutOfRange ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-slate-900 dark:text-slate-100"}`}>
                                                                    {measurement.parameter}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Resultado Numérico */}
                                                        <TableCell className="text-right font-mono text-xs sm:text-sm">
                                                            <span className={measurement.isOutOfRange ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2 py-0.5 rounded font-bold" : "text-slate-700 dark:text-slate-300 font-medium"}>
                                                                {measurement.value}
                                                                <span className="inline sm:hidden text-[10px] text-slate-400 font-sans ml-1">{measurement.unit}</span>
                                                            </span>
                                                        </TableCell>

                                                        {/* Unidad desktop */}
                                                        <TableCell className="hidden sm:table-cell text-center text-xs text-slate-400 font-medium">{measurement.unit}</TableCell>

                                                        {/* Límites de Referencia */}
                                                        <TableCell className="text-right pr-4 sm:pr-6 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                            {measurement.referenceRange}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Panel Derecho de Archivos Adjuntos */}
                <div className="space-y-4 lg:col-span-1 min-w-0">
                    {/* Quitamos la clase 'sticky' en móviles usando la media query de Tailwind para evitar saltos raros de scroll */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm lg:sticky lg:top-6 overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <FileText className="h-4 w-4 text-blue-600 shrink-0" /> Documentos de Respaldo
                            </CardTitle>
                            <CardDescription>Archivos, recetas o imágenes asociadas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {attachmentsError && (
                                <div className="p-2.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <p className="font-medium break-words">{attachmentsError}</p>
                                </div>
                            )}

                            {uploadSuccess && (
                                <div className="p-2.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                    <p className="font-medium">Documento sincronizado exitosamente.</p>
                                </div>
                            )}

                            {/* Dropzone */}
                            <div
                                onClick={() => !isUploadingAttachments && fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (!isUploadingAttachments) handleFilesSelected(e.dataTransfer.files);
                                }}
                                className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 dark:bg-slate-900/10 group ${isUploadingAttachments ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-500 dark:hover:border-blue-600"
                                    }`}
                            >
                                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mb-1.5 transition-colors shrink-0" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suelte archivos aquí o arrástrelos</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG o JPG (Máx. 10MB)</span>
                            </div>

                            {/* Listado de archivos */}
                            <div className="border-t pt-3 border-slate-100 dark:border-slate-800 space-y-2">
                                <span className="text-xs font-bold text-slate-500 block mb-2">Archivos guardados ({examination.files.length})</span>

                                {examination.files.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-4 italic">No se han cargado documentos.</p>
                                ) : (
                                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                                        {examination.files.map((file, idx) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2 rounded-md border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60 group transition-colors"
                                            >
                                                <div className="flex items-center gap-2 truncate max-w-[75%]">
                                                    <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                                                        {`Adjunto #${idx + 1} (${file.fileType.split('/')[1]?.toUpperCase() || 'DOC'})`}
                                                    </span>
                                                </div>
                                                <ShadcnButton
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-slate-400 hover:text-blue-600 transition-all shrink-0"
                                                    onClick={() => window.open(`${env.api.baseUrl}${file.url}`, "_blank")}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </ShadcnButton>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
