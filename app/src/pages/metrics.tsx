import { useMetrics } from '@/hooks/use-metrics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, type ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function Metrics() {
    const { available, selectedMetric, setSelectedMetric, data, loading, error } = useMetrics()

    // El registro más reciente se encuentra al principio de la tabla por el orden inverso (.reverse())
    const mostRecentRecord = data && data.table.length > 0 ? data.table[0] : null

    // Cambia el color del trazo: rojo si la última toma arrojó alerta, azul si es normal
    const activeColor = mostRecentRecord?.alerta ? "#ef4444" : "#2563eb"

    const chartData = {
        labels: data ? data.points.map(p => p.fecha) : [],
        datasets: [
            {
                label: data?.parameter || '',
                data: data ? data.points.map(p => p.valor) : [],
                borderColor: activeColor,
                backgroundColor: `${activeColor}08`,
                borderWidth: 3,
                tension: 0.3,
                pointBackgroundColor: (context: any) => {
                    const idx = context.dataIndex
                    return data?.points[idx]?.alerta ? '#ef4444' : '#10b981'
                },
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
            },
        ],
    }

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                padding: 12,
                backgroundColor: '#0f172a',
                titleFont: { size: 11 },
                bodyFont: { size: 13, weight: 'bold' },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                grid: { color: 'rgba(226, 232, 240, 0.4)' },
                ticks: { font: { family: 'monospace' } }
            }
        }
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-sm mx-auto space-y-3 pt-20">
                <div className="p-3 bg-red-100 text-red-600 rounded-full w-fit mx-auto dark:bg-red-950/40">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fallo de sincronización</h3>
                <p className="text-sm text-slate-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Análisis Clínico</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sigue la evolución cronológica de tus biomarcadores clave de forma gráfica.
                </p>
            </header>

            {/* Selector de Métricas Horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/60 dark:border-slate-800">
                {available.length === 0 && !loading && (
                    <p className="text-xs text-slate-400">No se encontraron biomarcadores registrados.</p>
                )}
                {available.map((metricName) => (
                    <button
                        key={metricName}
                        onClick={() => setSelectedMetric(metricName)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm border ${selectedMetric === metricName
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                            }`}
                    >
                        {metricName}
                    </button>
                ))}
            </div>

            {loading && !data ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-400 font-medium">Procesando registros médicos correlativos...</p>
                </div>
            ) : data ? (
                <div className="grid gap-6 lg:grid-cols-3 items-start">

                    {/* Gráfico Histórico Real */}
                    <Card className="lg:col-span-2 border-slate-100 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>{data.parameter}</CardTitle>
                            <CardDescription>Historial evolutivo consolidado.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[320px] w-full pt-2">
                            {data.points.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                                    No hay suficientes puntos de datos para graficar una tendencia.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Panel Clínico de Referencia */}
                    <Card className="border-slate-100 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Estado Actual</CardTitle>
                            <CardDescription>Análisis del último valor ingresado.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Valor Más Reciente</div>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {mostRecentRecord ? mostRecentRecord.valor : '--'}
                                    </span>
                                    <span className="text-sm font-medium text-slate-400">{data.unit}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-3 border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rango de Referencia</div>
                                    <div className="mt-0.5 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {data.referenceRange} <span className="text-xs font-normal text-slate-400">{data.unit}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Diagnóstico del Sistema</div>
                                    <div className="mt-1">
                                        <span
                                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                            style={{
                                                backgroundColor: mostRecentRecord?.alerta ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: mostRecentRecord?.alerta ? '#ef4444' : '#10b981'
                                            }}
                                        >
                                            {mostRecentRecord?.alerta ? 'Fuera de rango (Alerta)' : 'En Rango Óptimo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                                Recuerda que los rangos de referencia corresponden a los valores mínimos y máximos informados por el laboratorio emisor.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tabla de Auditoría Histórica */}
                    <Card className="lg:col-span-3 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="py-4 bg-slate-100/40 dark:bg-slate-950/20 border-b">
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Desglose de Extracciones Indexadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Fecha</TableHead>
                                        <TableHead>Estudio Clínico</TableHead>
                                        <TableHead>Laboratorio</TableHead>
                                        <TableHead className="text-right pr-6">Resultado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.table.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="pl-6 text-xs text-slate-500 font-medium">
                                                {row.fecha}
                                            </TableCell>
                                            <TableCell className="text-sm font-semibold text-slate-900 dark:text-white max-w-[240px] truncate">
                                                {row.estudio || "Estudio General"}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400">
                                                {row.laboratorio || "No especificado"}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 font-mono">
                                                <span className={row.alerta
                                                    ? "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 px-2 py-0.5 rounded font-bold text-xs"
                                                    : "text-slate-700 dark:text-slate-300 font-medium text-xs"
                                                }>
                                                    {row.valor} {row.unidad}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            ) : null}
        </div>
    )
}
