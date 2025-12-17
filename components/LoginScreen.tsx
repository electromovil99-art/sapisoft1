
import React, { useState, useEffect } from 'react';
import { 
    Lock, User, ArrowRight, ShieldCheck, Mail, CheckCircle, ArrowLeft, Key, BellRing, X, AlertOctagon, 
    Twitter, Github, Linkedin, Briefcase, Users, BarChart, Headset, ShoppingCart, Wrench, FileText, Package, Check, Archive
} from 'lucide-react';
import { SystemUser, Tenant } from '../types';

interface LoginScreenProps {
    onLogin: (user: SystemUser) => void;
    onResetPassword?: (userId: string, newPass: string) => void;
    users: SystemUser[];
    tenants: Tenant[];
    heroImage?: string; // New Prop
    featureImage?: string; // New Prop
}

const StatsSection = () => (
    <section className="bg-slate-50 dark:bg-slate-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 text-center sm:grid-cols-2 md:grid-cols-4">
                <div>
                    <h3 className="text-4xl font-bold text-primary dark:text-primary-400 sm:text-5xl">500+</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Empresas Activas</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary dark:text-primary-400 sm:text-5xl">10k+</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Usuarios Diarios</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary dark:text-primary-400 sm:text-5xl">99.9%</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Garantizado</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary dark:text-primary-400 sm:text-5xl">24/7</h3>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Soporte Técnico</p>
                </div>
            </div>
        </div>
    </section>
);

const FeaturesSection = () => (
    <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-primary dark:text-primary-400">Módulos Integrales</p>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Todo lo que necesitas en una <span className="text-primary dark:text-primary-400">sola plataforma.</span></h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">SapiSoft unifica las operaciones críticas de tu negocio para que dejes de usar múltiples hojas de cálculo y software desconectado.</p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-block rounded-xl bg-primary-100 dark:bg-primary-900/30 p-4 text-primary dark:text-primary-300"><ShoppingCart size={24} /></div>
                    <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Gestión de Ventas</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Agiliza tu punto de venta con una interfaz táctil intuitiva, manejo de cajas y reportes en tiempo real.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-block rounded-xl bg-primary-100 dark:bg-primary-900/30 p-4 text-primary dark:text-primary-300"><Wrench size={24} /></div>
                    <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Servicio Técnico</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Gestiona órdenes de reparación, estados de servicio y comunicación automática con clientes vía WhatsApp.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-block rounded-xl bg-primary-100 dark:bg-primary-900/30 p-4 text-primary dark:text-primary-300"><Archive size={24} /></div>
                    <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Almacen</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Control de stock, inventario, estrategia de abastecimiento a tiempo justo.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="inline-block rounded-xl bg-primary-100 dark:bg-primary-900/30 p-4 text-primary dark:text-primary-300"><BarChart size={24} /></div>
                    <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">Análisis de Stock</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Reportes de rotación, alertas de stock bajo y valorización de inventario para tomar mejores decisiones.</p>
                </div>
            </div>
        </div>
    </section>
);

const IndustryTabsSection = ({ featureImage }: { featureImage?: string }) => {
    const [activeTab, setActiveTab] = useState('talleres');
    
    return (
        <section className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Adaptado a tu industria</h2>
                        <div className="mt-8 space-y-4">
                            <button onClick={() => setActiveTab('talleres')} className={`w-full text-left rounded-xl p-6 transition-all ${activeTab === 'talleres' ? 'bg-white dark:bg-slate-800 shadow-lg' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activeTab === 'talleres' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><CheckCircle size={20} /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Taller de Celulares</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Controla de ingresos, estado de reparacion y tu inventario en tiempo real.</p>
                                    </div>
                                </div>
                            </button>
                            <button onClick={() => setActiveTab('retail')} className={`w-full text-left rounded-xl p-6 transition-all ${activeTab === 'retail' ? 'bg-white dark:bg-slate-800 shadow-lg' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                               <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activeTab === 'retail' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><CheckCircle size={20} /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Retail</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Punto de venta rápido, códigos de barra, promociones y fidelización de clientes.</p>
                                    </div>
                                </div>
                            </button>
                            <button onClick={() => setActiveTab('negocios')} className={`w-full text-left rounded-xl p-6 transition-all ${activeTab === 'negocios' ? 'bg-white dark:bg-slate-800 shadow-lg' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activeTab === 'negocios' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><CheckCircle size={20} /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Negocios</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Control total de tus suministros y abastecimiento rápido en tiempo real, monitoreable.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    {/* SECOND IMAGE - MODERN INVENTORY/TABLET */}
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative rounded-2xl shadow-xl overflow-hidden border border-white/10">
                            <img 
                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
                                src={featureImage || "https://images.unsplash.com/photo-1580508174046-170816f65662?q=80&w=2670&auto=format&fit=crop"} 
                                alt="SapiSoft Inventory Management" 
                            />
                            {/* BRAND PURPLE OVERLAY */}
                            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay pointer-events-none"></div>
                            
                            <div className="absolute bottom-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur-md dark:bg-black/80 shadow-lg border border-primary/20">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    Control de Stock
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Gestión en tiempo real.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const PricingSection = () => (
    <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Planes Flexibles</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Elige el plan perfecto para el tamaño y las necesidades de tu negocio.</p>
            </div>
            <div className="mt-16 grid max-w-sm grid-cols-1 gap-8 mx-auto lg:max-w-none lg:grid-cols-3">
                {/* Plan Básico */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">Básico</h3>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Para pequeños negocios</p>
                    <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">S/39<span className="text-base font-medium text-slate-500 dark:text-slate-400">/mes</span></p>
                    <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Gestión de Ventas Simple</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Control de Inventario Básico</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> 1 Usuario</li>
                    </ul>
                    <a href="#" className="mt-8 block rounded-lg bg-slate-100 dark:bg-slate-800 px-6 py-3 text-center text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">Elegir Básico</a>
                </div>
                {/* Plan Intermedio */}
                <div className="relative rounded-2xl border-2 border-primary p-8 shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 transform"><div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold uppercase tracking-wider text-white">Más Popular</div></div>
                    <h3 className="text-lg font-semibold leading-8 text-primary dark:text-primary-300">Intermedio</h3>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Para negocios en crecimiento</p>
                    <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">S/69<span className="text-base font-medium text-slate-500 dark:text-slate-400">/mes</span></p>
                    <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Todo lo del Básico</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Módulo Servicio Técnico</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Evolución Empresarial</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> 3 Usuarios</li>
                    </ul>
                    <a href="#" className="mt-8 block rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold leading-6 text-white hover:bg-primary-dark">Empezar Prueba Gratis</a>
                </div>
                {/* Plan Avanzado */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                    <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">Avanzado</h3>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Gestión total sin límites</p>
                    <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">S/99<span className="text-base font-medium text-slate-500 dark:text-slate-400">/mes</span></p>
                    <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Todo lo del Intermedio</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Multi-sucursal</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> API & Integraciones</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> Usuarios Ilimitados</li>
                    </ul>
                    <a href="#" className="mt-8 block rounded-lg bg-slate-100 dark:bg-slate-800 px-6 py-3 text-center text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">Contactar Ventas</a>
                </div>
            </div>
        </div>
    </section>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onResetPassword, users, tenants, heroImage, featureImage }) => {
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
            <header className="sticky top-0 z-50 w-full px-4 py-3 sm:px-6 lg:px-8">
                <div className="glass-panel mx-auto max-w-7xl rounded-full px-6 py-3 shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                                <span className="text-xl font-black">S</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-text-dark dark:text-white">SapiSoft</span>
                        </div>
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
            </header>
            
            <main>
                {/* --- HERO --- */}
                <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
                  <div className="ambient-glow -top-20 -left-20 bg-[radial-gradient(circle,rgba(147,51,234,0.2)_0%,rgba(0,0,0,0)_70%)]"></div>
                  <div className="ambient-glow top-40 right-0 translate-x-1/3 bg-[radial-gradient(circle,rgba(147,51,234,0.15)_0%,rgba(0,0,0,0)_70%)]"></div>

                  <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      
                      <div className="flex flex-col gap-6 text-center lg:text-left">
                        <div className="inline-flex mx-auto lg:mx-0 items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary backdrop-blur-sm dark:border-gray-700 dark:bg-black/20 dark:text-primary-light">
                          <span className="block h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                          Nuevo Módulo de Facturación 2.0
                        </div>
                        
                        <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-text-dark dark:text-white sm:text-6xl lg:text-7xl">
                          Tu negocio, bajo <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-200">
                            control total.
                          </span>
                        </h1>
                        
                        <p className="mx-auto lg:mx-0 max-w-lg text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
                          Controla tu negocio desde el celular mientras descansas. Recibe notificaciones de cada venta en tiempo real y disfruta de tu tiempo libre.
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
                              {/* HERO IMAGE REPLACEMENT: DYNAMIC */}
                              <img
                                alt="SapiSoft SaaS Dashboard Interface with Analytics"
                                className="object-cover w-full h-full grayscale-[10%]"
                                src={heroImage || "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=2670&auto=format&fit=crop"}
                              />
                              {/* PRIMARY COLOR BRAND OVERLAY */}
                              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay pointer-events-none"></div>
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-60 pointer-events-none"></div>
                              
                              <div className="absolute -bottom-6 -right-6 glass-card p-4 rounded-xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
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

                <StatsSection />
                <FeaturesSection />
                <IndustryTabsSection featureImage={featureImage} />
                <PricingSection />
            </main>
            
            {/* --- FOOTER --- */}
            <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-8">
                        <div className="md:col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><span className="text-2xl font-black">S</span></div>
                                <span className="text-xl font-bold tracking-tight text-text-dark dark:text-white">SapiSoft ERP</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">El sistema ERP moderno y ágil para empresas que miran al futuro.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Producto</h3>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Características</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Precios</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Integraciones</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Recursos</h3>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Centro de Ayuda</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Guías de Usuario</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Webinars</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Legal</h3>
                            <ul className="mt-4 space-y-2 text-sm">
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Privacidad</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Términos</a></li>
                                <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white">Seguridad</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} SapiSoft. Todos los derechos reservados.</p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Twitter size={18}/></a>
                            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Github size={18}/></a>
                            <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><Linkedin size={18}/></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* --- LOGIN MODAL (OVERLAY) --- */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLoginModal(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white z-10 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
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
                                    <div><div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" /></div><input type="text" className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="Usuario / Email" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus /></div></div>
                                    <div><div className="relative group"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" /></div><input type="password" className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} /></div><div className="flex justify-end mt-2"><button type="button" onClick={() => { setIsRecovery(true); setError(''); }} className="text-xs text-primary hover:underline font-medium">¿Olvidaste tu contraseña?</button></div></div>
                                    {error && (<div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in"><AlertOctagon size={16} /> <span>{error}</span></div>)}
                                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95">{loading ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>) : (<>Ingresar al Sistema <ArrowRight size={18} /></>)}</button>
                                </form>
                            ) : (
                                <div className="text-center space-y-5 animate-in fade-in">
                                    {recoveryStep === 'INPUT' && (<><div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-full w-fit mx-auto text-indigo-600 dark:text-indigo-400 mb-2"><Mail size={24}/></div><h3 className="text-slate-800 dark:text-white font-bold">Recuperar Acceso</h3><p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Ingresa tu usuario o correo asociado.</p><form onSubmit={handleGenerateCode} className="space-y-4"><input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="usuario@empresa.com" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} autoFocus />{error && <div className="text-red-500 text-xs">{error}</div>}<button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90">Enviar Código</button></form></>)}
                                    {recoveryStep === 'CODE' && (<><div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-full w-fit mx-auto text-yellow-600 dark:text-yellow-400 mb-2"><BellRing size={24}/></div><h3 className="text-slate-800 dark:text-white font-bold">Verificar Código</h3><p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Código enviado (Ver notificación).</p><form onSubmit={handleVerifyCode} className="space-y-4"><input type="text" maxLength={6} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center text-xl tracking-widest outline-none focus:border-indigo-500" placeholder="000000" value={inputCode} onChange={e => setInputCode(e.target.value.replace(/[^0-9]/g, ''))} autoFocus />{error && <div className="text-red-500 text-xs">{error}</div>}<button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Verificar</button></form></>)}
                                    {recoveryStep === 'NEW_PASS' && (<><div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-full w-fit mx-auto text-emerald-600 dark:text-emerald-400 mb-2"><Key size={24}/></div><h3 className="text-slate-800 dark:text-white font-bold">Nueva Contraseña</h3><form onSubmit={handleChangePassword} className="space-y-4 text-left"><input type="password" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus /><input type="password" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500" placeholder="Confirmar contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />{error && <div className="text-red-500 text-xs">{error}</div>}<button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Actualizar</button></form></>)}
                                    {recoveryStep === 'SUCCESS' && (<div className="py-6"><CheckCircle size={48} className="text-emerald-500 mx-auto mb-4"/><h3 className="text-slate-800 dark:text-white font-bold mb-2">¡Contraseña Actualizada!</h3><button onClick={resetRecovery} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">Volver al Login</button></div>)}
                                    {recoveryStep !== 'SUCCESS' && (<button onClick={resetRecovery} className="text-slate-500 text-xs hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1 w-full mt-4"><ArrowLeft size={12}/> Volver</button>)}
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center border-t border-slate-200 dark:border-slate-800"><p className="text-slate-500 dark:text-slate-600 text-xs flex items-center justify-center gap-2"><ShieldCheck size={12}/> Acceso Seguro SSL</p></div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="fixed top-24 right-5 z-[100] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-emerald-500 flex items-start gap-4 max-w-sm animate-in slide-in-from-right">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full text-emerald-600"><Mail size={20} /></div>
                    <div><h4 className="font-bold text-sm text-slate-800 dark:text-white">Código Enviado</h4><p className="text-xs text-slate-500 mb-1">Tu código de seguridad es:</p><span className="text-xl font-mono font-black tracking-widest text-emerald-600">{generatedCode}</span></div>
                    <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                </div>
            )}
        </div>
    );
};

export default LoginScreen;
