const headers = "fecha,laboratorio,descripcion,categoria,biomarcador,resultado,unidad,referencia\n";
const filaEjemplo = "22/05/2026,Azar Laboratorios,Chequeo Anual Completo,Química Clínica,Colesterol LDL,155.0,mg/dL,Menor a 100.0\n";
export const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + filaEjemplo);
