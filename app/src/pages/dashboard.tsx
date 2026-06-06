import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowUpRight,
    Activity,
    TrendingUp,
    AlertTriangle,
    Upload,
    CheckCircle2,
    FileSpreadsheet,
    Copy,
    Check
} from "lucide-react"
import { useState } from "react"

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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

export default function Dashboard() {
    const userName = "Facundo"
    const [copied, setCopied] = useState(false)

    // Prompt estandarizado para que la IA transforme cualquier PDF médico al CSV esperado
    const promptReferencia = `Actúa como un extractor de datos médicos experto. Analiza el documento PDF adjunto y estructura TODOS sus biomarcadores en un formato CSV limpio, utilizando estrictamente las siguientes columnas separadas por comas:

fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia

Reglas críticas:
1. "fecha" debe estar en formato DD/MM/AAAA.
2. "descripcion" debe ser el título general del estudio (ej: Chequeo Anual).
3. "categoria" debe clasificar el estudio (ej: Hematología, Química, Endocrinología).
4. El "resultado" debe ser puramente numérico (usa punto para decimales). No incluyas las unidades dentro de esta columna.
5. Devuelve ÚNICAMENTE el bloque de código CSV, sin textos introductorios ni explicaciones.`;

    // Función para descargar la plantilla CSV generada al vuelo (Client-side)
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

    // Función para copiar el prompt al portapapeles con feedback de éxito
    const copiarPrompt = () => {
        navigator.clipboard.writeText(promptReferencia);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const chartData = {
        labels: ['Ene 25', 'Jul 25', 'May 26'],
        datasets: [
            {
                label: 'Índice HOMA-IR',
                data: [3.1, 2.9, 2.71],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.06)',
                borderWidth: 3,
                tension: 0.35,
                pointBackgroundColor: '#10b981',
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
            legend: {
                display: false,
            },
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
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 11, family: 'sans-serif' }
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 2,
                max: 4,
                grid: {
                    color: 'rgba(226, 232, 240, 0.6)',
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    stepSize: 0.5
                },
                border: {
                    display: false
                }
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        }
    };

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8">

            {/* Encabezado Principal Modificado con Barra de Herramientas de Referencia */}
            <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center border-b border-slate-200/60 dark:border-slate-800 pb-5">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Hola, {userName}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Este es el estado general de tu salud basado en tus últimos estudios analizados.
                    </p>
                </div>

                {/* Contenedor de Acciones Flex-wrap adaptativo para Mobile y Desktop */}
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

            {/* Grid de Métricas Clave de Primer Vistazo */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* CARD 1: ALERTA CRÍTICA (Colesterol LDL) */}
                <Card className="border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                            Colesterol LDL
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-800 dark:text-amber-400">155 mg/dL</div>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 font-medium">
                            Fuera de rango (Óptimo: &lt; 100)
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 2: CONTROL METABÓLICO (HOMA-IR) */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Índice HOMA-IR
                        </CardTitle>
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">2.71</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <span className="text-emerald-500 flex items-center font-semibold">
                                -6.5% <TrendingUp className="h-3 w-3 rotate-180" />
                            </span>
                            respecto al control anterior
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 3: cardiovascular (Triglicéridos) */}
                <Card className="border-rose-100 bg-rose-50/10 dark:border-rose-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-rose-900 dark:text-rose-400">
                            Triglicéridos
                        </CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">172.3 mg/dL</div>
                        <p className="text-xs text-rose-500 mt-1 font-medium">
                            Ligeramente elevado (Ref: &lt; 150)
                        </p>
                    </CardContent>
                </Card>

                {/* CARD 4: ESTADO HEMATOLÓGICO (Serie Roja) */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Serie Roja en Sangre
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Óptimo</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Hto: 44.4% | Hb: 16.2 g/dL
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sección Inferior: Gráfico y Resumen del Documento Original */}
            <div className="mt-6 grid gap-4 lg:grid-cols-7">

                {/* Contenedor del Gráfico (Ocupa 4 de 7 columnas en desktop) */}
                <Card className="border-slate-100 dark:border-slate-800 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Tendencia del Índice HOMA-IR</CardTitle>
                        <CardDescription>
                            Evaluación histórica de la sensibilidad tisular a la insulina.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full pt-2">
                        <Line data={chartData} options={chartOptions} />
                    </CardContent>
                </Card>

                {/* Detalles del archivo de origen (Ocupa 3 de 7 columnas en desktop) */}
                <Card className="border-slate-100 dark:border-slate-800 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Último Evento Médico</CardTitle>
                        <CardDescription>Evidencia física asociada a estas métricas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Análisis Clínico Completo
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Azar Laboratorios
                                </p>
                            </div>
                            <span className="rounded bg-white border border-slate-200 px-2.5 py-1 text-xs font-mono font-medium text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                22/05/2026
                            </span>
                        </div>

                        <div className="space-y-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            <p>
                                El motor de extracción de datos (IA estructurada) procesó con éxito 5 categorías técnicas del archivo PDF original.
                            </p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                • Categorías detectadas: <span className="font-normal text-slate-500">Hematología, Química Clínica, Endocrinología, Uroanálisis e Infectología.</span>
                            </p>
                            <p className="font-semibold text-amber-600 dark:text-amber-500">
                                ⚠️ Nota del sistema: Se detectaron 2 métricas críticas fuera de los límites de referencia establecidos por el laboratorio para tu grupo etario.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
