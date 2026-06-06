import { type AxiosInstance } from "axios";
import type { GoogleUser } from "./types/auth";

export default class AuthService {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance) {
        this.httpClient = httpClient;
    }

    public async verifyToken(data: { token: string }): Promise<GoogleUser> {
        const response = await this.httpClient.post<GoogleUser>('/auth/google-login', data);
        return response.data;
    }
}
