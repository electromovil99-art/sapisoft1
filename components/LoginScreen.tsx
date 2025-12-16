
import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Mail, CheckCircle, ArrowLeft, Key, BellRing, X, AlertOctagon } from 'lucide-react';
import { SystemUser, Tenant } from '../types';

interface LoginScreenProps {
    onLogin: (user: SystemUser) => void;
    onResetPassword?: (userId: string, newPass: string) => void;
    users: SystemUser[]; 
    tenants: Tenant[]; 
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onResetPassword, users, tenants }) => {
    // --- VIEW STATE ---
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    // --- LOGIN FORM STATE ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- RECOVERY MODE STATE ---
    const [isRecovery, setIsRecovery] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryStep, setRecoveryStep] = useState<'INPUT' | 'CODE' | 'NEW_PASS' | 'SUCCESS'>('INPUT');
    const [generatedCode, setGeneratedCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [foundUser, setFoundUser] = useState<SystemUser | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Toast Timer
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        setTimeout(() => {
            const foundUser = users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === password &&
                u.active
            );

            if (foundUser) {
                if (foundUser.role === 'SUPER_ADMIN') {
                    onLogin(foundUser);
                    return;
                }

                const myTenant = tenants.find(t => t.companyName === foundUser.companyName);
                
                if (!myTenant) {
                    setError('Error de configuración: Empresa no encontrada.');
                    setLoading(false);
                    return;
                }

                if (myTenant.status === 'INACTIVE') {
                    setError('Empresa INACTIVA. Contacte a soporte.');
                    setLoading(false);
                    return;
                }

                // Date Validation
                const [day, month, year] = myTenant.subscriptionEnd.split('/');
                const expiryDate = new Date(`${year}-${month}-${day}`);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (expiryDate < today) {
                    setError('Suscripción VENCIDA. Realice el pago para continuar.');
                    setLoading(false);
                    return;
                }

                onLogin(foundUser);
            } else {
                setError('Credenciales incorrectas o usuario inactivo.');
                setLoading(false);
            }
        }, 800);
    };

    // --- RECOVERY LOGIC ---
    const handleGenerateCode = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.email?.toLowerCase() === recoveryEmail.toLowerCase() || u.username.toLowerCase() === recoveryEmail.toLowerCase());

        if (user) {
            setFoundUser(user);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedCode(code);
            setShowToast(true);
            setRecoveryStep('CODE');
        } else {
            setError('Usuario no encontrado.');
        }
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode === generatedCode) {
            setError('');
            setRecoveryStep('NEW_PASS');
        } else {
            setError('Código incorrecto.');
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 3) {
            setError('La contraseña es muy corta.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (foundUser && onResetPassword) {
            onResetPassword(foundUser.id, newPassword);
            setRecoveryStep('SUCCESS');
        }
    };

    const resetRecovery = () => {
        setIsRecovery(false);
        setRecoveryStep('INPUT');
        setRecoveryEmail('');
        setError('');
        setGeneratedCode('');
        setInputCode('');
        setFoundUser(null);
        setShowToast(false);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-dark dark:text-gray-100 font-display transition-colors duration-300 min-h-screen flex flex-col">
            
            {/* --- NAVBAR --- */}
            <nav className="sticky top-0 z-50 w-full px-4 py-3 sm:px-6 lg:px-8">
                <div className="glass-panel mx-auto max-w-7xl rounded-full px-6 py-3 shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                                <span className="material-symbols-outlined text-xl">dataset</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-text-dark dark:text-white">SapiSoft</span>
                        </div>
                        {/* Navigation Links Removed */}
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowLoginModal(true)} className="hidden sm:flex text-sm font-bold text-text-dark dark:text-white hover:text-primary transition-colors">
                                Iniciar Sesión
                            </button>
                            <button onClick={() => setShowLoginModal(true)} className="flex items-center justify-center rounded-full bg-black dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-black shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO --- */}
            <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
                <div className="ambient-glow -top-20 -left-20 bg-[radial-gradient(circle,rgba(147,51,234,0.2)_0%,rgba(0,0,0,0)_70%)]"></div>
                <div className="ambient-glow top-40 right-0 translate-x-1/3 bg-[radial-gradient(circle,rgba(147,51,234,0.15)_0%,rgba(0,0,0,0)_70%)]"></div>
                
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6 text-center lg:text-left">
                            <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-text-dark dark:text-white sm:text-6xl lg:text-7xl">
                                Tu negocio, bajo <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200">
                                    control total.
                                </span>
                            </h1>
                            <p className="mx-auto lg:mx-0 max-w-lg text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
                                Tomas el control total de tu Empresa o Taller. Las notificaciones de cada venta llegan directamente a tu celular, asegurándote que el negocio marcha perfectamente mientras tú disfrutas de tu merecido descanso.
                            </p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                <button onClick={() => setShowLoginModal(true)} className="flex min-w-[160px] items-center justify-center rounded-full bg-primary hover:bg-primary-dark h-14 px-8 text-base font-bold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/30">
                                    Solicitar Demo
                                </button>
                                <button className="flex min-w-[160px] items-center justify-center rounded-full border border-gray-300 bg-white/50 h-14 px-8 text-base font-bold text-text-dark backdrop-blur-sm transition-colors hover:bg-white hover:border-gray-400 dark:bg-black/20 dark:text-white dark:border-gray-600 dark:hover:bg-black/40">
                                    <span className="material-symbols-outlined mr-2 text-xl">play_circle</span>
                                    Ver Video
                                </button>
                            </div>
                            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 opacity-80 grayscale transition-all hover:grayscale-0">
                                <span className="text-xs font-bold uppercase text-gray-400">Confían en nosotros:</span>
                                <div className="h-6 w-20 bg-gray-300/50 dark:bg-gray-700/50 rounded animate-pulse"></div>
                                <div className="h-6 w-20 bg-gray-300/50 dark:bg-gray-700/50 rounded animate-pulse"></div>
                                <div className="h-6 w-20 bg-gray-300/50 dark:bg-gray-700/50 rounded animate-pulse"></div>
                            </div>
                        </div>
                        
                        <div className="relative lg:h-auto flex justify-center items-center perspective-1000 group">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>
                            <div className="animate-float relative z-10 w-full max-w-lg transform transition-transform hover:rotate-1 duration-500">
                                <div className="glass-panel p-2 rounded-2xl shadow-2xl border-4 border-white/20">
                                    <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 aspect-[4/3] relative">
                                        <img alt="Dashboard Interface" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOtu7P9RegbVeXjx7-SLG4TssWWNo7unGSEeBDw2I0CIwQBXdiiPDqa4U3S4PruEoV4ewMR5zniidtvyvQi7y4ewyyI_vH8dsBxYabcYPW6Y-O45Uqc2RrmWVVEtRGfJnAJs4JEVLeor4UVc9A85kePvNxqOyWdDcCQg0sbqT1it_0ZbBA6BZNN_T3Ar3cRWIavO57KB9WJvJEfxKgrkuJmoRScgAghTTb5Nv3dywTBq7B5AJCvWWMIYIukltOv084MJczZhmlzWU"/>
                                        <div className="absolute -bottom-6 -right-6 glass-card p-4 rounded-xl flex items-center gap-3 animate-float" style={{animationDelay: '1s'}}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                                <span className="material-symbols-outlined">trending_up</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ventas Hoy</p>
                                                <p className="text-lg font-bold text-text-dark dark:text-white">+24.5%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS --- */}
            <section className="py-10 border-y border-gray-100 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {[
                            { val: '500+', label: 'Empresas Activas' },
                            { val: '10k+', label: 'Usuarios Diarios' },
                            { val: '99.9%', label: 'Uptime Garantizado' },
                            { val: '24/7', label: 'Soporte Técnico' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center">
                                <p className="text-3xl sm:text-4xl font-black text-text-dark dark:text-white">{stat.val}</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FEATURES --- */}
            <section className="relative py-20 lg:py-28" id="features">
                <div className="ambient-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20"></div>
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 md:text-center max-w-3xl mx-auto">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-primary-light mb-3">Módulos Integrales</h2>
                        <h3 className="text-3xl font-black tracking-tight text-text-dark dark:text-white sm:text-4xl lg:text-5xl mb-6">
                            Todo lo que necesitas en una sola plataforma.
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            SapiSoft unifica las operaciones críticas de tu negocio para que dejes de usar múltiples hojas de cálculo y software desconectado.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: 'point_of_sale', title: 'Gestión de Ventas', desc: 'Agiliza tu punto de venta con una interfaz táctil intuitiva, manejo de cajas y reportes en tiempo real.' },
                            { icon: 'build', title: 'Servicio Técnico', desc: 'Gestiona órdenes de reparación, estados de servicio y comunicación automática con clientes vía WhatsApp.' },
                            { icon: 'local_shipping', title: 'Logística', desc: 'Optimiza tu abastecimiento de tus repuestos para tu taller o tu negocio a tiempo.' },
                            { icon: 'inventory_2', title: 'Control de Stock', desc: 'Inventario multicapa con alertas de stock bajo, gestión de proveedores y análisis de rotación.' }
                        ].map((feat, i) => (
                            <div key={i} className="glass-card group flex flex-col justify-between rounded-xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 dark:hover:bg-white/5">
                                <div>
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-text-dark dark:bg-gray-700 dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-3xl">{feat.icon}</span>
                                    </div>
                                    <h4 className="mb-2 text-xl font-bold text-text-dark dark:text-white">{feat.title}</h4>
                                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECTORS --- */}
            <section className="py-20 bg-gray-50 dark:bg-black/20 backdrop-blur-sm" id="sectors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <h3 className="text-3xl font-black text-text-dark dark:text-white mb-6">Adaptado a tu industria</h3>
                            <div className="flex flex-col gap-4">
                                <div className="glass-card relative overflow-hidden rounded-xl border-l-4 border-l-primary p-6 transition-all cursor-pointer bg-white dark:bg-gray-800">
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-3xl text-primary">smartphone</span>
                                        <div>
                                            <h4 className="text-lg font-bold text-text-dark dark:text-white">Talleres de reparación de celulares</h4>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Control de entrada, salida y estado de reparación vía WhatsApp.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-transparent p-6 transition-all hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer opacity-60 hover:opacity-100">
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-3xl text-gray-500 dark:text-gray-400">storefront</span>
                                        <div>
                                            <h4 className="text-lg font-bold text-text-dark dark:text-white">Retail</h4>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Punto de venta rápido, códigos de barra, promociones y fidelización de clientes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative h-[400px] lg:h-[500px]">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-[80px] opacity-60"></div>
                            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl glass-panel border border-white/40">
                                <img alt="Worker" className="object-cover w-full h-full opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4ArdZK8GYl-Cyi1m8H9RwaPadRW-dxS7oz-hDfR1p-zOlMG7WQyZoBz4NS9r5zlpi3I6Zd24C3mOsrurTQxmr2Z96vbr3WwZfgUy9WIO9Z4hfFtnvdgE1-ytQjmG6p3UeR-hZwaCqhCFUuXG4VPb7w4kx9vdtvfJ93310A0cAgauZSB7lFLpicy6TbQWKHg1IQUbVMW0GtkkkW3qqJV-TefyDma7fK0qH9qsssjwCWNzrDiJy5eaKc5APR58reNO26Kp1PegeAOk"/>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <p className="font-bold text-lg">Módulo Taller</p>
                                    <p className="text-sm opacity-80">Gestión visual de órdenes de trabajo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section className="relative py-24 overflow-hidden" id="pricing">
                <div className="absolute inset-0 bg-gray-50 dark:bg-black/30"></div>
                <div className="ambient-glow bottom-0 right-0 opacity-10"></div>
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-black text-text-dark dark:text-white mb-6">Planes Flexibles</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
                        Elige el plan perfecto para el tamaño y las necesidades de tu negocio.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* BASIC */}
                        <div className="glass-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-gray-400 bg-white dark:bg-[#1a190b] flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-text-dark dark:text-white">Básico</h3>
                                <p className="text-sm text-gray-500 mt-2">Para pequeños negocios</p>
                            </div>
                            <div className="flex items-baseline justify-center gap-1 mb-6">
                                <span className="text-4xl font-black text-text-dark dark:text-white">S/39</span>
                                <span className="text-gray-500 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-left flex-1">
                                {['Gestión de Ventas Simple', 'Control de Inventario Básico', '1 Usuario'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => setShowLoginModal(true)} className="w-full rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary py-3 text-sm font-bold text-text-dark dark:text-white transition-all">
                                Elegir Básico
                            </button>
                        </div>
                        {/* INTERMEDIATE */}
                        <div className="glass-card relative rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border-t-4 border-primary bg-white dark:bg-[#1a190b] transform md:-translate-y-4 flex flex-col">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <span className="inline-block px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-md">Más Popular</span>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-text-dark dark:text-white">Intermedio</h3>
                                <p className="text-sm text-gray-500 mt-2">Para negocios en crecimiento</p>
                            </div>
                            <div className="flex items-baseline justify-center gap-1 mb-6">
                                <span className="text-5xl font-black text-primary dark:text-primary-light">S/69</span>
                                <span className="text-gray-500 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-left flex-1">
                                {['Todo lo del Básico', 'Facturación Electrónica', 'Módulo de Taller', '3 Usuarios'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined text-primary text-lg mt-0.5">check_circle</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => setShowLoginModal(true)} className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1">
                                Empezar Prueba Gratis
                            </button>
                        </div>
                        {/* ADVANCED */}
                        <div className="glass-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-t-4 border-black dark:border-white bg-white dark:bg-[#1a190b] flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-text-dark dark:text-white">Avanzado</h3>
                                <p className="text-sm text-gray-500 mt-2">Gestión total sin límites</p>
                            </div>
                            <div className="flex items-baseline justify-center gap-1 mb-6">
                                <span className="text-4xl font-black text-text-dark dark:text-white">S/99</span>
                                <span className="text-gray-500 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 text-left flex-1">
                                {['Todo lo del Intermedio', 'Multi-sucursal', 'API & Integraciones', 'Usuarios Ilimitados'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined text-black dark:text-white text-lg mt-0.5">check_circle</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => setShowLoginModal(true)} className="w-full rounded-full border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black py-3 text-sm font-bold text-text-dark dark:text-white transition-all">
                                Contactar Ventas
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-6 rounded-full bg-primary"></div>
                                <span className="text-lg font-bold text-text-dark dark:text-white">SapiSoft</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                ERP moderno y ágil para empresas que miran al futuro.
                            </p>
                            <div className="flex gap-4">
                                <a className="text-gray-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                                <a className="text-gray-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-dark dark:text-white mb-4">Producto</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><a className="hover:text-primary" href="#">Características</a></li>
                                <li><a className="hover:text-primary" href="#">Precios</a></li>
                                <li><a className="hover:text-primary" href="#">Integraciones</a></li>
                                <li><a className="hover:text-primary" href="#">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-dark dark:text-white mb-4">Recursos</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><a className="hover:text-primary" href="#">Blog</a></li>
                                <li><a className="hover:text-primary" href="#">Centro de Ayuda</a></li>
                                <li><a className="hover:text-primary" href="#">Guías de Usuario</a></li>
                                <li><a className="hover:text-primary" href="#">Webinars</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-dark dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li><a className="hover:text-primary" href="#">Privacidad</a></li>
                                <li><a className="hover:text-primary" href="#">Términos</a></li>
                                <li><a className="hover:text-primary" href="#">Seguridad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-400">© 2024 SapiSoft ERP. Todos los derechos reservados.</p>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-gray-500">Sistemas Operativos</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- LOGIN MODAL (OVERLAY) --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowLoginModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white z-10 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20}/>
                        </button>

                        <div className="p-8">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
                                    <span className="text-white font-black text-2xl">S</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bienvenido de nuevo</h2>
                                <p className="text-slate-500 text-sm">Ingresa a tu panel de control</p>
                            </div>

                            {!isRecovery ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                                placeholder="Usuario / Email"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-end mt-2">
                                            <button 
                                                type="button"
                                                onClick={() => { setIsRecovery(true); setError(''); }}
                                                className="text-xs text-primary hover:underline font-medium"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
                                            <AlertOctagon size={16} /> 
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>Ingresar al Sistema <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                /* RECOVERY FORM */
                                <div className="text-center space-y-5 animate-in fade-in">
                                    {recoveryStep === 'INPUT' && (
                                        <>
                                            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full w-fit mx-auto text-indigo-600 dark:text-indigo-400 mb-2"><Mail size={24}/></div>
                                            <h3 className="text-slate-800 dark:text-white font-bold">Recuperar Acceso</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ingresa tu usuario o correo asociado.</p>
                                            <form onSubmit={handleGenerateCode} className="space-y-4">
                                                <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="usuario@empresa.com" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} autoFocus />
                                                {error && <div className="text-red-500 text-xs">{error}</div>}
                                                <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90">Enviar Código</button>
                                            </form>
                                        </>
                                    )}
                                    {recoveryStep === 'CODE' && (
                                        <>
                                            <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-full w-fit mx-auto text-yellow-600 dark:text-yellow-400 mb-2"><BellRing size={24}/></div>
                                            <h3 className="text-slate-800 dark:text-white font-bold">Verificar Código</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Código enviado (Ver notificación).</p>
                                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                                <input type="text" maxLength={6} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center text-xl tracking-widest outline-none focus:border-indigo-500" placeholder="000000" value={inputCode} onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />
                                                {error && <div className="text-red-500 text-xs">{error}</div>}
                                                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Verificar</button>
                                            </form>
                                        </>
                                    )}
                                    {recoveryStep === 'NEW_PASS' && (
                                        <>
                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-full w-fit mx-auto text-emerald-600 dark:text-emerald-400 mb-2"><Key size={24}/></div>
                                            <h3 className="text-slate-800 dark:text-white font-bold">Nueva Contraseña</h3>
                                            <form onSubmit={handleChangePassword} className="space-y-4 text-left">
                                                <input type="password" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
                                                <input type="password" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="Confirmar contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                                {error && <div className="text-red-500 text-xs">{error}</div>}
                                                <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Actualizar</button>
                                            </form>
                                        </>
                                    )}
                                    {recoveryStep === 'SUCCESS' && (
                                        <div className="py-6">
                                            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4"/>
                                            <h3 className="text-slate-800 dark:text-white font-bold mb-2">¡Contraseña Actualizada!</h3>
                                            <button onClick={resetRecovery} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">Volver al Login</button>
                                        </div>
                                    )}
                                    
                                    {recoveryStep !== 'SUCCESS' && (
                                        <button onClick={resetRecovery} className="text-slate-500 text-xs hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1 w-full mt-4">
                                            <ArrowLeft size={12}/> Volver
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center border-t border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500 dark:text-slate-600 text-xs flex items-center justify-center gap-2">
                                <ShieldCheck size={12}/> Acceso Seguro SSL
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="fixed top-24 right-5 z-[100] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-emerald-500 flex items-start gap-4 max-w-sm animate-in slide-in-from-right">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full text-emerald-600"><Mail size={20} /></div>
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Código Enviado</h4>
                        <p className="text-xs text-slate-500 mb-1">Tu código de seguridad es:</p>
                        <span className="text-xl font-mono font-black tracking-widest text-emerald-600">{generatedCode}</span>
                    </div>
                    <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
