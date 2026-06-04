import { Outlet } from "react-router-dom"

export function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-900 text-foreground antialiased transition-colors duration-300">
            <div className="flex-1 flex items-center justify-center px-4 pb-16 sm:pb-24">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
