import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";
import LoginPage from "@/pages/login";
import { PublicRoute } from "@/components/auth/public-route";
import { ProtectedRoute } from "@/components/auth/protected-route";
import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Examinations from "@/pages/examinations";
import Metrics from "@/pages/metrics";
import ExaminationDetail from "@/pages/examination-detail";

const NotFoundPage = () => <div className="p-8 text-center"><h1>404 - Página no encontrada</h1></div>;

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/auth/login" replace />,
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/auth",
                element: <AuthLayout />,
                children: [
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <AppLayout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "estudios", element: <Examinations /> },
                    { path: "estudios/:id", element: <ExaminationDetail /> },
                    { path: "metricas", element: <Metrics /> }
                ],
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
