import { storageService } from "@/services/storage/storage.service";
import { Navigate, Outlet } from "react-router-dom";

export const isTokenValid = (): boolean => {
    const token = storageService.getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        return payload.exp > currentTime;
    } catch (error) {
        return false;
    }
};

export function PublicRoute() {
    const isAuthenticated = isTokenValid();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
