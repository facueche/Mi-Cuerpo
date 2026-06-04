import axios, { type AxiosInstance } from "axios";
import { env } from "@/config/env";
import { storageService } from "../storage/storage.service";

export default class HttpClient {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = axios.create({
            baseURL: env.api.baseUrl,
            headers: { 'Content-Type': 'application/json' }
        });

        this.setInterceptors();
    }

    public getHttpClient(): AxiosInstance {
        return this.httpClient;
    }

    public setAuthToken(token: string): void {
        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    private setInterceptors(): void {
        this.httpClient.interceptors.request.use((config) => {
            const token = storageService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.httpClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && !error.config?.url?.endsWith('/auth/login')) {
                    storageService.removeToken();
                    window.location.href = "/auth/login";
                }
                return Promise.reject(error);
            }
        );
    }
}
