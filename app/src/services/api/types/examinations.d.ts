export type Examination = {
    id: string;
    fecha: string;
    laboratorio: string;
    titulo: string;
    alertas: number;
    categorias: string[];
    doctor: string;
}

export type ApiMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type PaginatedExaminationsResponse = {
    data: Examination[];
    meta: ApiMeta;
}

export type GetExaminationsParams = {
    page: number;
    limit: number;
    search?: string;
}

export type UploadCSVResponse = {
    message: string;
    eventId: string;
}

export type MeasurementDetail = {
    id: string;
    parameter: string;
    value: number;
    unit: string;
    referenceRange: string;
    isOutOfRange: boolean;
}

export type StudyDetail = {
    id: string;
    category: string;
    measurements: MeasurementDetail[];
}

export type FileDetail = {
    id: string;
    url: string;
    fileType: string;
}

export type ExaminationDetailResponse = {
    id: string;
    title: string;
    date: string;
    doctorName: string;
    institution: string;
    description: string | null;
    totalAlertas: number;
    studies: StudyDetail[];
    files: FileDetail[];
}

export type UploadAttachmentsResponse = {
    message: string;
    count: number;
}
