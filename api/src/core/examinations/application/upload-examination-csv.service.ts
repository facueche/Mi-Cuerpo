import { Readable } from "stream";
import csvParser from "csv-parser";
import ExaminationRepository, { CreateExaminationDTO } from "../domain/repositories/examination.repository";

interface UploadCSVParams {
    userId: string;
    fileBuffer: Buffer;
}

interface CSVRow {
    fecha: string;
    laboratorio: string;
    titulo: string;
    descripcion: string;
    doctor: string;
    categoria: string;
    biomarcador: string;
    resultado: string;
    unidad: string;
    referencia: string;
}

export default class UploadExaminationCSVService {
    constructor(
        private readonly examinationRepository: ExaminationRepository
    ) { }

    async handle(params: UploadCSVParams): Promise<{ message: string; eventId: string }> {
        const rows: CSVRow[] = [];

        // 1. Parsear el Buffer del CSV usando streams tradicionales
        const stream = Readable.from(params.fileBuffer).pipe(csvParser());

        for await (const row of stream) {
            rows.push(row as CSVRow);
        }

        if (rows.length === 0) {
            throw new Error("El archivo CSV está vacío o no tiene el formato correcto.");
        }

        // 2. Tomar datos de cabecera de la primera fila
        const firstRow = rows[0];

        // Parsear fecha DD/MM/AAAA a objeto Date de JS nativo
        const [day, month, year] = firstRow.fecha.split("/").map(Number);
        const eventDate = new Date(Date.UTC(year, month - 1, day));

        // 3. Agrupar los biomarcadores por su categoría de estudio (Estructura relacional)
        const studiesMap = new Map<string, CreateExaminationDTO["studies"][number]["measurements"]>();

        for (const row of rows) {
            const value = parseFloat(row.resultado);
            if (isNaN(value)) continue; // Ignorar filas sin un resultado numérico válido (evita cualitativos)

            // Parsear el rango de referencia estándar
            const { min, max, isOutOfRange } = this.analizarRangosReferencia(value, row.referencia);

            if (!studiesMap.has(row.categoria)) {
                studiesMap.set(row.categoria, []);
            }

            studiesMap.get(row.categoria)!.push({
                parameter: row.biomarcador,
                value: value,
                unit: row.unidad,
                minReference: min,
                maxReference: max,
                isOutOfRange: isOutOfRange
            });
        }

        // Transformar el mapa estructurado al DTO final del dominio
        const studiesDTO: CreateExaminationDTO["studies"] = Array.from(studiesMap.entries()).map(([category, measurements]) => ({
            category,
            measurements
        }));

        const createDTO: CreateExaminationDTO = {
            userId: params.userId,
            date: eventDate,
            institution: firstRow.laboratorio,
            title: firstRow.titulo,
            description: firstRow.descripcion,
            doctorName: firstRow.doctor,
            studies: studiesDTO
        };

        // 4. Delegar la persistencia atómica a la capa de infraestructura
        const createdEvent = await this.examinationRepository.createWithDetails(createDTO);

        return {
            message: "Estudio importado y procesado exitosamente.",
            eventId: createdEvent.id
        };
    }

    /**
     * Lógica analítica autónoma para procesar límites químicos e inferir desvíos (isOutOfRange)
     * Soporta de manera robusta sinónimos clínicos como "hasta", "maximo", "menor", etc.
     */
    private analizarRangosReferencia(valor: number, referencia: string) {
        let min: number | null = null;
        let max: number | null = null;
        let isOutOfRange = false;

        const cleanRef = referencia.toLowerCase().trim();

        // Escenario A: Rango con guión (Ej: "70 - 110" o "4.5-10.2")
        if (cleanRef.includes("-")) {
            const parts = cleanRef.split("-").map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                min = parts[0];
                max = parts[1];
                isOutOfRange = valor < min || valor > max;
            }
        }
        // Escenario B: Techo estricto (Ej: "menor a 100", "< 130", "hasta 1.3", "maximo 5.0")
        else if (
            cleanRef.includes("menor") ||
            cleanRef.includes("<") ||
            cleanRef.includes("hasta") ||
            cleanRef.includes("maximo") ||
            cleanRef.includes("máximo")
        ) {
            const match = cleanRef.match(/[\d.]+/);
            if (match) {
                max = parseFloat(match[0]);
                // Si el valor máximo es 1.3, cualquier valor mayor estricto es una alerta (out of range)
                isOutOfRange = valor > max;
            }
        }
        // Escenario C: Piso estricto (Ej: "mayor a 10", "> 5.5", "desde 12.0", "minimo 1.0")
        else if (
            cleanRef.includes("mayor") ||
            cleanRef.includes(">") ||
            cleanRef.includes("desde") ||
            cleanRef.includes("minimo") ||
            cleanRef.includes("mínimo")
        ) {
            const match = cleanRef.match(/[\d.]+/);
            if (match) {
                min = parseFloat(match[0]);
                // Si el valor mínimo es 10, cualquier valor menor estricto es una alerta (out of range)
                isOutOfRange = valor < min;
            }
        }

        return { min, max, isOutOfRange };
    }
}
