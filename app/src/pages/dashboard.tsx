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
    HeartPulse
} from "lucide-react"
import { useState } from "react"
import { useDashboard } from "@/hooks/use-dashboard"

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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

export default function Dashboard() {
    const user = storageService.getUser() as User;
    const userName = `${user?.firstName} ${user?.lastName}` || "Usuario";
    const [copied, setCopied] = useState(false)

    const { metrics, loading, error } = useDashboard()

    const promptReferencia = `Actúa como un extractor de datos médicos experto. Analiza el documento PDF adjunto y estructura TODOS sus biomarcadores en un formato CSV limpio, utilizando estrictamente las siguientes columnas separadas por comas:

fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia

Reglas críticas:
1. "fecha" debe estar en formato DD/MM/AAAA.
2. "descripcion" debe ser el título general del estudio (ej: Chequeo Anual).
3. "categoria" debe clasificar el estudio (ej: Hematología, Química, Endocrinología).
4. El "resultado" debe ser puramente numérico (usa punto para decimales). No incluyas las unidades dentro de esta columna.
5. Devuelve ÚNICAMENTE el bloque de código CSV, sin textos introductorios ni explicaciones.`;

    const descargarPlantillaCSV = () => {
        const headers = "fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia\n";
        const filaEjemplo = "22/05/2026,Azar Laboratorios,Chequeo Anual Completo,Química Clínica,Colesterol LDL,155.0,mg/dL,Menor a 100.0\n";
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + filaEjemplo);

        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "plantilla_estudio_salud.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copiarPrompt = () => {
        navigator.clipboard.writeText(promptReferencia);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- PROCESAMIENTO DINÁMICO DEL GRÁFICO (CHART.JS) ---
    // Buscamos si el backend devolvió el historial del Índice HOMA-IR, de lo contrario tomamos el primer biomarcador que encuentre para graficar
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
                    return isAlert ? '#ef4444' : '#10b981'; // Rojo si es alerta, verde si es óptimo
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

    // 1. Render de Carga Global
    if (loading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Calculando métricas agregadas desde PostgreSQL...</p>
            </div>
        )
    }

    // 2. Render de Error de Conexión
    if (error || !metrics) {
        return (
            <div className="p-6 text-center max-w-sm mx-auto space-y-3 pt-20">
                <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto dark:bg-red-950/40">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Error de sincronización</h3>
                <p className="text-sm text-slate-500">{error || "No se pudieron conectar los tableros analíticos."}</p>
            </div>
        )
    }

    const { cards, distribucionCategorias } = metrics;

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8">

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

                    <Button size="sm" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
                        <Upload className="h-4 w-4" /> Importar Estudio (CSV)
                    </Button>
                </div>
            </header>

            {/* Grid de Métricas Clave de Primer Vistazo Conectadas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* CARD 1: TOTAL ESTUDIOS INDEXADOS */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Estudios Indexados
                        </CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {cards.totalEstudios}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Eventos médicos cargados
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 2: ALERTAS CRÍTICAS DETECTADAS */}
                <Card className={`border-slate-100 dark:border-slate-800 ${cards.totalAlertas > 0 ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Alertas Críticas
                        </CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${cards.totalAlertas > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${cards.totalAlertas > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                            {cards.totalAlertas}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${cards.totalAlertas > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500'}`}>
                            {cards.totalAlertas === 1 ? 'Valor fuera de rango' : cards.totalAlertas > 1 ? 'Valores fuera de rango' : 'Todo en orden de referencia'}
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 3: ÍNDICE DE SALUD ÓPTIMA */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Índice de Salud Óptima
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {cards.porcentajeOptimos}%
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Biomarcadores normales
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 4: ESPECIALIDADES MÉDICAS */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Especialidades Médicas
                        </CardTitle>
                        <HeartPulse className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {distribucionCategorias.length}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
                            Categorías clínicas detectadas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sección Inferior: Gráfico Dinámico y Resumen Técnico */}
            <div className="mt-6 grid gap-4 lg:grid-cols-7">

                {/* Contenedor del Gráfico Dinámico (4 columnas) */}
                <Card className="border-slate-100 dark:border-slate-800 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">
                            {targetBiomarker ? `Tendencia de: ${targetBiomarker.parameter}` : 'Tendencias Clínicas'}
                        </CardTitle>
                        <CardDescription>
                            Evaluación histórica y cronológica calculada a través de las muestras SQL indexadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full pt-2">
                        {targetBiomarker ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                Carga tu primer CSV para activar los gráficos lineales.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resumen Relacional de Categorías (3 columnas) */}
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
                            <p>
                                El backend procesó de forma segura tus datos multi-tenant para aislar métricas y variables relacionales.
                            </p>
                            {cards.totalAlertas > 0 && (
                                <p className="font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                    ⚠️ Atención: Posees {cards.totalAlertas} {cards.totalAlertas === 1 ? 'biomarcador' : 'biomarcadores'} fuera de los rangos estándar de referencia.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
