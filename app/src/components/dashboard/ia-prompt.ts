export const referencePrompt = `Actúa como un extractor de datos médicos experto. Analiza el documento PDF adjunto y estructura TODOS sus biomarcadores en un formato CSV limpio, utilizando estrictamente las siguientes columnas separadas por comas:

fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia

Reglas críticas:
1. "fecha" debe estar en formato DD/MM/AAAA.
2. "descripcion" debe ser el título general del estudio (ej: Chequeo Anual).
3. "categoria" debe clasificar el estudio (ej: Hematología, Química, Endocrinología).
4. El "resultado" debe ser puramente numérico (usa punto para decimales). No incluyas las unidades dentro de esta columna.
5. "referencia" debe tipificarse estrictamente bajo alguno de estos tres formatos para que nuestro procesador automatizado funcione:
   - Rango tradicional con guion: "70.0 - 110.0" o "4.5 - 10.2"
   - Límites superiores máximos (reemplaza palabras como "Hasta", "Menor a", "Normal inferior a", "<"): usa obligatoriamente el formato "Menor a [valor]" (ej: "Menor a 10.0").
   - Límites inferiores mínimos (reemplaza palabras como "Desde", "Mayor a", ">"): usa obligatoriamente el formato "Mayor a [valor]" (ej: "Mayor a 4.5").
   - Si no existe un rango de referencia, deja la columna vacía o escribe "No especificado".
6. Formato de Salida Obligatorio: Devuelve el resultado exclusivamente dentro de un bloque de código Markdown especificando el nombre del archivo para permitir su descarga directa con la sintaxis \`\`\`csv:estudio_salud.csv
7. Devuelve ÚNICAMENTE el bloque de código CSV solicitado, sin textos introductorios, saludos ni explicaciones de ningún tipo.`;
