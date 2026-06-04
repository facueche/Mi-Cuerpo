import { Navigate, Outlet } from "react-router-dom";

export const isTokenValid = (): boolean => {
    return false;
};

export function PublicRoute() {
    const isAuthenticated = isTokenValid();

    if (isAuthenticated) {
        return <Navigate to="/inicio" replace />;
    }

    return <Outlet />;
}
