import LoginCard from "@/components/auth/login-card";
import AuthService from "@/services/api/auth.service";
import HttpClient from "@/services/api/http-client";
import { storageService } from "@/services/storage/storage.service";
import { useGoogleLogin, type CodeResponse } from "@react-oauth/google";
import { useState } from "react";

const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const httpClient = new HttpClient();
    const authService = new AuthService(httpClient.getHttpClient());

    const handleOnLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (tokenResponse: CodeResponse) => {
            setIsLoading(true)

            try {
                const response = await authService.verifyToken({ token: tokenResponse.code })

                storageService.setToken(response.token);
                storageService.setUser(response.user);

                console.log("response", response);
            } catch (err: any) {
                console.error(err.message);
            } finally {
                setIsLoading(false)
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Error:', errorResponse)
        }
    })

    return (
        <LoginCard onLogin={handleOnLogin} isLoading={isLoading} />
    )
}

export default Login;
