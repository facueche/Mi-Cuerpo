import { storageService } from "@/services/storage/storage.service";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const isTokenValid = (): boolean => {
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

export function ProtectedRoute() {
    const location = useLocation();
    const isAuthenticated = isTokenValid();

    if (!isAuthenticated) {
        storageService.removeToken();
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}