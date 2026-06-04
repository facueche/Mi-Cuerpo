import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import HealthLogo from "@/components/ui/health-logo"

interface LoginCardProps {
    onLogin: () => void,
    isLoading: boolean
}

export default function LoginCard({
    onLogin,
    isLoading
}: LoginCardProps) {
    return (
        <div className="flex w-full flex-col items-center justify-center">
            <div className="mb-6 flex justify-center">
                <HealthLogo className="h-28 w-28 animate-fade-in" />
            </div>

            <Card className="w-full max-w-md border-slate-100 shadow-xl dark:border-slate-800">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        ¡Bienvenido a Tu Salud!
                    </CardTitle>
                    <CardDescription className="text-base text-slate-500 dark:text-slate-400">
                        Gestiona tus estudios médicos, recetas e historial clínico de forma privada.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-muted-foreground dark:bg-slate-950">
                                Inicia sesión
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full py-6 text-base font-semibold transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={onLogin}
                        disabled={isLoading}
                    >
                        {/* SVG Oficial de la Marca Google */}
                        <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        Continuar con Google
                    </Button>

                    <p className="px-4 text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                        Tus datos de salud y los de tu cuenta se almacenan de manera local y encriptada.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
