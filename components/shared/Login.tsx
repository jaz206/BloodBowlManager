import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
    const { login, loginAsGuest } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        try {
            await login();
        } catch (err: any) {
            console.error("Google login failed", err);
            if (err.code === 'auth/unauthorized-domain') {
                const domain = window.location.hostname;
                setError(`Dominio no autorizado: '${domain}'. Añádelo en la Consola de Firebase.`);
            } else {
                setError(`Error al iniciar sesión: ${err.message}`);
            }
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-cover bg-center font-display"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0QUF8RkSlKY4MtJqoM_LQgK-XkB_uDNyc9ihJRwPOq4ffMBkzKylT1P0j2JXB-JtxrwhaRe_fTf5LcZIJ4vG6CITbFtXN5uQInneiXtHKqI9bdT2wLajOaFSy7tdJZOAl30BP4YGS8KOyFIrTqiRsa_aslSV3Pur_P4ZubaKHuECMJCYm6yXTqce8MrvjFCMswOPVKMVZ_GbUVoRzUeveyso3SUx-ZUiTXvuRxQL_eU155GAl6h-VdxqezQlm1mKhFa0rxAq2JdZ0')" }}>

            {/* Overlay for immersion */}
            <div className="absolute inset-0 bg-gradient-to-bottom from-black/40 to-[#0a0907]/95"></div>

            {/* Decorative blurs */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Login Card */}
                <div className="bg-[#120f0a]/85 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 shadow-2xl border-t-primary/40">
                    {/* Logo & Branding */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(245,159,10,0.4)]"
                        >
                            <span className="material-symbols-outlined text-background-dark text-4xl font-bold">sports_football</span>
                        </motion.div>
                        <h1 className="text-3xl font-black tracking-tight text-white italic uppercase flex flex-col leading-none">
                            <span>BLOOD BOWL</span>
                            <span className="text-primary mt-1">ASSISTANT</span>
                        </h1>
                        <div className="h-1 w-20 bg-primary mt-4 rounded-full"></div>
                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] italic">
                            Tu Asistente de Entrenador Definitivo
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="group relative flex w-full items-center justify-center gap-3 h-14 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-[0.98] shadow-lg disabled:opacity-50"
                        >
                            {isLoggingIn ? (
                                <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent animate-spin rounded-full"></span>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27c.47-.57.81-1.23 1.18-1.91z" fill="#FBBC05"></path>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                </svg>
                            )}
                            <span>{isLoggingIn ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}</span>
                        </button>

                        <div className="flex items-center gap-4 my-2">
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">o</span>
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                        </div>

                        {/* Guest Button */}
                        <button
                            onClick={loginAsGuest}
                            className="flex w-full items-center justify-center gap-2 h-14 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_rgba(245,159,10,0.2)]"
                        >
                            <span className="material-symbols-outlined font-bold">person_outline</span>
                            <span>Acceder como Invitado</span>
                        </button>
                    </div>

                    {/* Subtle Decorative Elements */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] italic opacity-50">Sindicato de Entrenadores de Elite</p>
                        <div className="flex gap-6 mt-1 opacity-20">
                            <span className="material-symbols-outlined text-lg">shield</span>
                            <span className="material-symbols-outlined text-lg">strategy</span>
                            <span className="material-symbols-outlined text-lg">groups</span>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex flex-col items-center text-slate-400/50 text-[10px] gap-2">
                    <p className="font-black tracking-[0.4em] uppercase">VERSIÓN v2.5.0</p>
                    <p className="italic font-bold">Desarrollado para Entrenadores de Élite</p>
                    <div className="mt-4 flex gap-8 font-black uppercase tracking-widest opacity-80">
                        <a className="hover:text-primary transition-colors" href="#">Soporte</a>
                        <a className="hover:text-primary transition-colors" href="#">Privacidad</a>
                        <a className="hover:text-primary transition-colors" href="#">Términos</a>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl backdrop-blur-md"
                    >
                        {error}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
