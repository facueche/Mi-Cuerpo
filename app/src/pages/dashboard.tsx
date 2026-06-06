import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertTriangle,
    Upload,
    CheckCircle2,
    FileSpreadsheet,
    Copy,
    Check,
    Loader2,
    HeartPulse,
    X,
    FileText
} from "lucide-react"
import { useState, useRef } from "react"
import { useDashboard } from "@/hooks/use-dashboard"
import { useExaminations } from "@/hooks/use-examinations"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { storageService } from "@/services/storage/storage.service"
import type { User } from "@/services/api/types/auth"
import { referencePrompt } from "@/components/dashboard/ia-prompt"
import { csvContent } from "@/components/dashboard/csv-content"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function Dashboard() {
    const user = storageService.getUser() as User;
    const userName = `${user?.firstName} ${user?.lastName}` || "Usuario";

    // Estados de control general
    const [copied, setCopied] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Nueva pestaña activa y control de texto pegado
    const [activeTab, setActiveTab] = useState<"file" | "paste">("file")
    const [pastedText, setPastedText] = useState("")

    // Estados de control de la importación
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [localUploadError, setLocalUploadError] = useState<string | null>(null)
    const [isLocalUploading, setIsLocalUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { metrics, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboard()
    const { uploadCSV } = useExaminations(1)

    const descargarPlantillaCSV = () => {
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "plantilla_estudio_salud.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copiarPrompt = () => {
        navigator.clipboard.writeText(referencePrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProcessFileOrText = async (payload: File | string) => {
        setIsLocalUploading(true);
        setLocalUploadError(null);
        setUploadSuccess(false);

        try {
            let fileToUpload: File;

            if (payload instanceof File) {
                if (!payload.name.endsWith(".csv") && payload.type !== "text/csv") {
                    throw new Error("El formato del archivo debe ser estrictamente CSV.");
                }
                fileToUpload = payload;
            } else {
                const cleanText = payload.trim();
                if (!cleanText) {
                    throw new Error("Por favor, pega el bloque de texto CSV generado por la IA.");
                }
                // Convertimos el texto plano ingresado a un archivo virtual CSV en el cliente
                const blob = new Blob([cleanText], { type: 'text/csv' });
                fileToUpload = new File([blob], 'estudio_salud_pegado.csv', { type: 'text/csv' });
            }

            // Consumimos tu función nativa de useExaminations
            await uploadCSV(fileToUpload);

            setUploadSuccess(true);
            setPastedText(""); // Limpiamos el editor tras indexar con éxito
            refreshDashboard(); // Recalculamos gráficos en tiempo de ejecución

            setTimeout(() => {
                setIsModalOpen(false);
                setUploadSuccess(false);
            }, 1800);
        } catch (err: any) {
            setLocalUploadError(err.message || "Error al procesar la información en el servidor.");
        } finally {
            setIsLocalUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) handleProcessFileOrText(files[0]);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleProcessFileOrText(files[0]);
    };

    const targetBiomarker = metrics?.graficoEvolucion.find(b => b.parameter.toLowerCase().includes("homa-ir"))
        || metrics?.graficoEvolucion[0];

    const chartData = {
        labels: targetBiomarker ? targetBiomarker.data.map(d => d.fecha) : [],
        datasets: [
            {
                label: targetBiomarker ? targetBiomarker.parameter : 'Métrica de Control',
                data: targetBiomarker ? targetBiomarker.data.map(d => d.valor) : [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.06)',
                borderWidth: 3,
                tension: 0.35,
                pointBackgroundColor: (context: any) => {
                    const index = context.dataIndex;
                    const isAlert = targetBiomarker?.data[index]?.alerta;
                    return isAlert ? '#ef4444' : '#10b981';
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
            },
        ],
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                padding: 12,
                backgroundColor: '#0f172a',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 14 },
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { display: false }
            },
            y: {
                grid: { color: 'rgba(226, 232, 240, 0.6)' },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { display: false }
            },
        },
        interaction: { mode: 'index', intersect: false }
    };

    if (dashboardLoading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Calculando métricas agregadas desde PostgreSQL...</p>
            </div>
        )
    }

    if (dashboardError || !metrics) {
        return (
            <div className="p-6 text-center max-w-sm mx-auto space-y-3 pt-20">
                <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto dark:bg-red-950/40">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Error de sincronización</h3>
                <p className="text-sm text-slate-500">{dashboardError || "No se pudieron conectar los tableros analíticos."}</p>
            </div>
        )
    }

    const { cards, distribucionCategorias } = metrics;

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 relative">

            {/* Encabezado Principal */}
            <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-slate-200/60 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Hola, {userName}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Este es el estado general de tu salud basado en tus últimos estudios analizados.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={descargarPlantillaCSV}
                        className="flex items-center gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Plantilla CSV
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copiarPrompt}
                        className="flex items-center gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800 min-w-[140px]"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 text-emerald-500" /> Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 text-blue-500" /> Copiar Prompt IA
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => { setLocalUploadError(null); setUploadSuccess(false); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                    >
                        <Upload className="h-4 w-4" /> Importar Estudio
                    </Button>
                </div>
            </header>

            {/* Grid de Tarjetas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estudios Indexados</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{cards.totalEstudios}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Eventos médicos cargados</p>
                    </CardContent>
                </Card>

                <Card className={`border-slate-100 dark:border-slate-800 ${cards.totalAlertas > 0 ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alertas Críticas</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${cards.totalAlertas > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${cards.totalAlertas > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{cards.totalAlertas}</div>
                        <p className={`text-xs mt-1 font-medium ${cards.totalAlertas > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500'}`}>
                            {cards.totalAlertas === 1 ? 'Valor fuera de rango' : cards.totalAlertas > 1 ? 'Valores fuera de rango' : 'Todo en orden de referencia'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Índice de Salud Óptima</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{cards.totalEstudios > 0 ? `${cards.porcentajeOptimos}%` : "Sin datos"}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Biomarcadores normales</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Especialidades Médicas</CardTitle>
                        <HeartPulse className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{distribucionCategorias.length}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">Categorías clínicas detectadas</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- SECCIÓN DE TENDENCIAS CLÍNICAS Y SEGMENTACIÓN --- */}
            { }
            <div className="mt-6 grid gap-4 lg:grid-cols-7">
                <Card className="border-slate-100 dark:border-slate-800 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">
                            {targetBiomarker ? `Tendencia de: ${targetBiomarker.parameter}` : 'Tendencias Clínicas'}
                        </CardTitle>
                        <CardDescription>Evaluación histórica y cronológica calculada a través de las muestras SQL indexadas.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full pt-2">
                        {targetBiomarker ? <Line data={chartData} options={chartOptions} /> : <div className="h-full flex items-center justify-center text-xs text-slate-400">Carga tu primer CSV para activar los gráficos lineales.</div>}
                    </CardContent>
                </Card>

                <Card className="border-slate-100 dark:border-slate-800 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Distribución Analítica</CardTitle>
                        <CardDescription>Volumen de registros segmentados por laboratorio.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {distribucionCategorias.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No hay registros cargados aún.</p>
                        ) : (
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                {distribucionCategorias.map((c) => (
                                    <div key={c.category} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.category}</span>
                                        <span className="rounded bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                            {c.count} {c.count === 1 ? 'estudio' : 'estudios'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="space-y-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t pt-3 border-slate-100 dark:border-slate-800">
                            <p>El backend procesó de forma segura tus datos multi-tenant para aislar métricas y variables relacionales.</p>
                            {cards.totalAlertas > 0 && (
                                <p className="font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                    ⚠️ Atención: Posees {cards.totalAlertas} {cards.totalAlertas === 1 ? 'biomarcador' : 'biomarcadores'} fuera de los rangos estándar de referencia.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- MODAL DIÁLOGO DE IMPORTACIÓN ADAPTATIVO (TABS DUALES) --- */}
            { }
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg border-slate-200 shadow-xl dark:border-slate-800 bg-white dark:bg-slate-950 relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                        {/* Botón para cerrar modal */}
                        <button
                            disabled={isLocalUploading}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-700 transition-colors disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-600" /> Cargar Nuevo Reporte
                            </CardTitle>
                            <CardDescription>
                                Elige el método de importación más cómodo según la respuesta de tu asistente de IA.
                            </CardDescription>
                        </CardHeader>

                        {/* TABS DE SELECCIÓN DE ENTRADA */}
                        <div className="px-6 flex gap-3 border-b border-slate-100 dark:border-slate-800/80">
                            <button
                                disabled={isLocalUploading || uploadSuccess}
                                onClick={() => { setActiveTab("file"); setLocalUploadError(null); }}
                                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "file"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-400 hover:text-slate-600"}`}
                            >
                                Subir Archivo (.csv)
                            </button>
                            <button
                                disabled={isLocalUploading || uploadSuccess}
                                onClick={() => { setActiveTab("paste"); setLocalUploadError(null); }}
                                className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === "paste"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-400 hover:text-slate-600"}`}
                            >
                                Pegar Texto Plano
                            </button>
                        </div>

                        <CardContent className="space-y-4 pt-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />

                            { }
                            {!isLocalUploading && !uploadSuccess && (
                                <>
                                    {/* TAB 1: Drag & Drop tradicional */}
                                    {activeTab === "file" && (
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-600 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/20 group animate-in fade-in duration-150"
                                        >
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-full text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Arrastra tu archivo CSV aquí o <span className="text-blue-600 dark:text-blue-400 font-bold">búscalo</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Solo se admiten documentos estructurados (.csv)</p>
                                        </div>
                                    )}

                                    {/* TAB 2: Textarea para pegado libre */}
                                    {activeTab === "paste" && (
                                        <div className="space-y-3 animate-in fade-in duration-150">
                                            <textarea
                                                value={pastedText}
                                                onChange={(e) => setPastedText(e.target.value)}
                                                rows={6}
                                                placeholder="fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia&#10;22/05/2026,Azar Laboratorios,Chequeo Anual,Hematología,Hemoglobina,16.2,g/dL,13.5 - 17.5"
                                                className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:text-slate-200 placeholder:text-slate-400 leading-relaxed scrollbar-thin"
                                            />
                                            <Button
                                                onClick={() => handleProcessFileOrText(pastedText)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                            >
                                                Procesar Texto Copiado
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Cargando */}
                            {isLocalUploading && (
                                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Parseando y validando biomarcadores...</p>
                                    <p className="text-xs text-slate-400 text-center max-w-[280px]">Estamos insertando las muestras relacionales de forma segura en PostgreSQL.</p>
                                </div>
                            )}

                            {/* Éxito */}
                            {uploadSuccess && (
                                <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center animate-in zoom-in-95 duration-200">
                                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                                        <CheckCircle2 className="h-7 w-7" />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 dark:text-white">¡Estudio indexado con éxito!</h4>
                                    <p className="text-xs text-slate-400 max-w-[260px]">Los tableros analíticos se han re-calculado de forma sincronizada.</p>
                                </div>
                            )}

                            {/* Mensaje de Error Localizado */}
                            {localUploadError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-in shake duration-300">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Error de importación</p>
                                        <p className="mt-0.5 leading-relaxed">{localUploadError}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
