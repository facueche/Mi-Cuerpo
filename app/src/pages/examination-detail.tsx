import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Landmark, AlertTriangle, CheckCircle2, BrainCircuit, FileText } from "lucide-react"

// Simulación de la respuesta extendida de la API para un estudio específico (ej: Tu reporte real)
const dbEstudiosDetalle: Record<string, any> = {
    "evt-1": {
        descripcion: "Chequeo Anual Completo",
        laboratorio: "Azar Laboratorios",
        fecha: "22/05/2026",
        observacionesIA: "Se observa un perfil lipídico con Colesterol LDL elevado y una leve alteración en los Triglicéridos, configurando un patrón de riesgo cardiovascular a controlar con plan nutricional. El índice HOMA-IR (2.71) sugiere un estado inicial de resistencia a la insulina, a pesar de mantener una glucemia en ayunas óptima. La serie roja y el uroanálisis no presentan desvíos significativos.",
        bloques: [
            {
                categoria: "Endocrinología & Metabolismo",
                analisis: [
                    { nombre: "Glucemia en Ayunas", resultado: "85.7", unidad: "mg/dL", referencia: "70.0 - 100.0", alerta: false },
                    { nombre: "Insulina sérica", resultado: "12.83", unidad: "µUI/mL", referencia: "2.60 - 24.90", alerta: false },
                    { nombre: "Índice HOMA-IR", resultado: "2.71", unidad: "índice", referencia: "Menor a 2.00", alerta: true },
                ]
            },
            {
                categoria: "Química Clínica (Perfil Lipídico)",
                analisis: [
                    { nombre: "Colesterol Total", resultado: "212.0", unidad: "mg/dL", referencia: "Menor a 200.0", alerta: true },
                    { nombre: "Colesterol LDL (Malo)", resultado: "155.0", unidad: "mg/dL", referencia: "Menor a 100.0", alerta: true },
                    { nombre: "Colesterol HDL (Bueno)", resultado: "41.0", unidad: "mg/dL", referencia: "Mayor a 40.0", alerta: false },
                    { nombre: "Triglicéridos", resultado: "172.3", unidad: "mg/dL", referencia: "Menor a 150.0", alerta: true },
                ]
            },
            {
                categoria: "Hematología (Serie Roja)",
                analisis: [
                    { nombre: "Hemoglobina", resultado: "16.2", unidad: "g/dL", referencia: "13.5 - 17.5", alerta: false },
                    { nombre: "Hematocrito", resultado: "44.4", unidad: "%", referencia: "41.0 - 50.0", alerta: false },
                    { nombre: "Glóbulos Rojos", resultado: "5.12", unidad: "x10^6/µL", referencia: "4.50 - 5.90", alerta: false },
                ]
            }
        ]
    }
}

export default function ExaminationDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Buscamos el estudio en el diccionario, si no existe usamos el evt-1 de muestra
    const estudio = dbEstudiosDetalle[id || "evt-1"] || dbEstudiosDetalle["evt-1"]

    return (
        <div className="bg-slate-50 p-4 dark:bg-slate-900 md:p-8 space-y-6">

            {/* Botón de Retorno y Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/estudios")}
                        className="p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Estudios
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                        {estudio.descripcion}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" /> {estudio.laboratorio}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {estudio.fecha}</span>
                    </div>
                </div>

                <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" /> Ver Archivo Original
                </Button>
            </div>

            {/* Bloque Inteligente: Interpretación Clínica Automatizada (IA) */}
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
                        {estudio.observacionesIA}
                    </p>
                </CardContent>
            </Card>

            {/* Listado Dinámico de Bloques Médicos */}
            <div className="space-y-6">
                {estudio.bloques.map((bloque: any, bIdx: number) => (
                    <Card key={bIdx} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-100/50 dark:bg-slate-950/50 py-3 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {bloque.categoria}
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
                                    {bloque.analisis.map((item: any, aIdx: number) => (
                                        <TableRow key={aIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                                            {/* Nombre + Icono de Alerta */}
                                            <TableCell className="font-medium pl-4 sm:pl-6 max-w-[160px] sm:max-w-none truncate">
                                                <div className="flex items-center gap-2">
                                                    {item.alerta ? (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    )}
                                                    <span className={item.alerta ? "text-amber-800 dark:text-amber-400 font-semibold" : "text-slate-900 dark:text-slate-100"}>
                                                        {item.nombre}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Resultado Numérico */}
                                            <TableCell className="text-right font-mono">
                                                <span className={item.alerta ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 px-2 py-0.5 rounded font-bold" : "text-slate-700 dark:text-slate-300 font-medium"}>
                                                    {item.resultado}
                                                    <span className="inline sm:hidden text-[10px] text-slate-400 font-sans ml-1">{item.unidad}</span>
                                                </span>
                                            </TableCell>

                                            {/* Unidad (Oculta en Mobile para priorizar lectura) */}
                                            <TableCell className="hidden sm:table-cell text-center text-xs text-slate-400 font-medium">
                                                {item.unit || item.unidad}
                                            </TableCell>

                                            {/* Límites de Referencia */}
                                            <TableCell className="text-right pr-4 sm:pr-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {item.referencia}
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
