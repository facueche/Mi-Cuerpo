// src/pages/metricas.tsx
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, type ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

// Diccionario de métricas con su historial (Simulando base de datos relacional)
const metricsDb: Record<string, { name: string, unit: string, refRange: string, current: string, status: string, history: number[], dates: string[], minScale: number, maxScale: number, color: string }> = {
    ldl: {
        name: "Colesterol LDL",
        unit: "mg/dL",
        refRange: "Menor a 100 mg/dL",
        current: "155",
        status: "Elevado",
        dates: ['Ene 25', 'Jul 25', 'May 26'],
        history: [130, 142, 155],
        minScale: 80,
        maxScale: 180,
        color: "#f59e0b" // Amber
    },
    glucemia: {
        name: "Glucemia en Ayunas",
        unit: "mg/dL",
        refRange: "70 - 100 mg/dL",
        current: "85.7",
        status: "Óptimo",
        dates: ['Ene 25', 'Jul 25', 'May 26'],
        history: [95.0, 91.2, 85.7],
        minScale: 60,
        maxScale: 120,
        color: "#10b981" // Emerald
    },
    trigliceridos: {
        name: "Triglicéridos",
        unit: "mg/dL",
        refRange: "Menor a 150 mg/dL",
        current: "172.3",
        status: "Ligeramente Elevado",
        dates: ['Ene 25', 'Jul 25', 'May 26'],
        history: [190, 155, 172.3],
        minScale: 100,
        maxScale: 250,
        color: "#f43f5e" // Rose
    },
    presion_ocular: {
        name: "Presión Intraocular (Ojo Der)",
        unit: "mmHg",
        refRange: "10 - 21 mmHg",
        current: "18",
        status: "Normal",
        dates: ['Ene 25', 'Jul 25', 'May 26'],
        history: [14, 16, 18], // Muestra la tendencia a lo largo de los años
        minScale: 5,
        maxScale: 25,
        color: "#3b82f6" // Azul para la vista
    },
}

export default function Metrics() {
    const [selectedMetric, setSelectedMetric] = useState("ldl")
    const activeMetric = metricsDb[selectedMetric]

    // Configuración dinámica de Chart.js basada en el biomarcador seleccionado
    const chartData = {
        labels: activeMetric.dates,
        datasets: [
            {
                label: activeMetric.name,
                data: activeMetric.history,
                borderColor: activeMetric.color,
                backgroundColor: `${activeMetric.color}15`, // Transparencia hex
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: activeMetric.color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                fill: true,
            },
        ],
    }

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: {
                min: activeMetric.minScale,
                max: activeMetric.maxScale,
                grid: { color: 'rgba(226, 232, 240, 0.4)' }
            }
        }
    }

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Análisis Clínico</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sigue la evolución cronológica de tus biomarcadores clave de forma gráfica.
                </p>
            </header>

            {/* Selector de Métricas (Diseño de pestañas Mobile-Friendly) */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {Object.keys(metricsDb).map((key) => (
                    <button
                        key={key}
                        onClick={() => setSelectedMetric(key)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm border ${selectedMetric === key
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                            }`}
                    >
                        {metricsDb[key].name}
                    </button>
                ))}
            </div>

            {/* Layout Principal de la Métrica */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Gráfico Histórico Ampliado (2/3 columnas en desktop) */}
                <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>{activeMetric.name}</CardTitle>
                        <CardDescription>Historial evolutivo consolidado.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] w-full pt-2">
                        <Line data={chartData} options={chartOptions} />
                    </CardContent>
                </Card>

                {/* Panel Clínico de Referencia (1/3 columna) */}
                <Card className="border-slate-100 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Estado Actual</CardTitle>
                        <CardDescription>Análisis del último valor ingresado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor Más Reciente</div>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                    {activeMetric.current}
                                </span>
                                <span className="text-sm font-medium text-slate-400">{activeMetric.unit}</span>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rango de Referencia</div>
                                <div className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">{activeMetric.refRange}</div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnóstico del Sistema</div>
                                <div className="mt-1">
                                    <span
                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                        style={{
                                            backgroundColor: `${activeMetric.color}15`,
                                            color: activeMetric.color
                                        }}
                                    >
                                        {activeMetric.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                            Recuerda que los rangos de referencia pueden variar ligeramente según los reactivos químicos utilizados por cada laboratorio específico.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
