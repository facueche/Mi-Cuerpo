import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";
import LoginPage from "@/pages/login";
import { PublicRoute } from "@/components/auth/public-route";

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
    // {
    //     element: <ProtectedRoute />,
    //     children: [
    //         {
    //             path: "/",
    //             element: <AppLayout />,
    //             children: [
    //                 { path: "inicio", element: <HomePage /> },
    //                 { path: "prospectos", element: <ProspectsPage /> },
    //                 { path: "prospectos/:id", element: <ProspectDetail /> },
    //             ],
    //         },
    //     ],
    // },
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
