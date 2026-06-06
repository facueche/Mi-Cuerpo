import { type AxiosInstance } from "axios";
import type {
    PaginatedExaminationsResponse,
    GetExaminationsParams,
    UploadCSVResponse,
    ExaminationDetailResponse
} from "./types/examinations";

export default class ExaminationsService {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance) {
        this.httpClient = httpClient;
    }

    public async getAll(params: GetExaminationsParams): Promise<PaginatedExaminationsResponse> {
        const response = await this.httpClient.get<PaginatedExaminationsResponse>('/examinations', {
            params: {
                page: params.page,
                limit: params.limit,
                search: params.search || undefined
            }
        });
        return response.data;
    }

    public async uploadCSV(file: File): Promise<UploadCSVResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await this.httpClient.post<UploadCSVResponse>('/examinations/upload', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }

    public async getById(id: string): Promise<ExaminationDetailResponse> {
        const response = await this.httpClient.get<ExaminationDetailResponse>(`/examinations/${id}`);
        return response.data;
    }
}
