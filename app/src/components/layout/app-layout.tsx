import { Link, Outlet, useLocation } from 'react-router-dom' // O la librería de rutas que uses
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Logo from "@/components/ui/health-logo"
import { LayoutDashboard, FileText, BarChart3, LogOut, User as UserIcon } from "lucide-react"
import { storageService } from '@/services/storage/storage.service'

export default function AppLayout() {
    const location = useLocation()

    const user = storageService.getUser();

    const handleLogout = () => {
        storageService.clearSession();
        window.location.href = "/";
    }

    // Configuración de los links de navegación compartidos
    const navigationItems = [
        { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Estudios', href: '/estudios', icon: FileText },
        { name: 'Métricas', href: '/metricas', icon: BarChart3 },
    ]

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 md:flex-row">

            {/* 1. SIDEBAR: Solo visible en pantallas medianas y grandes (Desktop) */}
            <aside className="hidden w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 md:block">
                <div className="flex items-center gap-3 px-2 pb-8">
                    <Logo className="h-9 w-9" />
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                        Tu Salud
                    </span>
                </div>

                {/* Links de navegación vertical */}
                <nav className="space-y-1">
                    {navigationItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* 2. TOPBAR: Header superior común para perfil y responsive móvil */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:px-8">
                    {/* Logo móvil (Oculto en Desktop) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Logo className="h-7 w-7" />
                        <span className="font-bold text-slate-900 dark:text-white">Tu Salud</span>
                    </div>

                    {/* Espaciador para desktop, empuja el avatar a la derecha */}
                    <div className="hidden md:block" />

                    {/* Menú de Usuario (Desplegable de Shadcn) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 p-0 dark:bg-slate-800">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="h-5 w-5 text-slate-500" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600 dark:text-rose-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* 3. CONTENIDO DINÁMICO DE LA PANTALLA */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>

                {/* 4. BOTTOM NAVIGATION: Barra fija inferior solo para Celulares (Mobile) */}
                <nav className="flex h-16 w-full shrink-0 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden">
                    {navigationItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

            </div>
        </div>
    )
}
