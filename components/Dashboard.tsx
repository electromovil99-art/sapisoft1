
import React, { useMemo } from 'react';
import { 
  ShoppingCart, Users, CreditCard, Wrench, CheckCircle, Target, PieChart, TrendingUp, Store
} from 'lucide-react';
import { ViewState, AuthSession, CashMovement, Client, ServiceOrder } from '../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  session?: AuthSession | null;
  cashMovements: CashMovement[];
  clients: Client[];
  services: ServiceOrder[];
}

const QuickActionBtn = ({ icon: Icon, label, subLabel, color, onClick }: { icon: any, label: string, subLabel: string, color: string, onClick: () => void }) => (
    <button onClick={onClick} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:-translate-y-1 transition-all group text-left w-full hover:border-${color}-200`}>
        <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400 group-hover:bg-${color}-100 transition-colors`}>
            <Icon size={20}/>
        </div>
        <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm">{label}</p>
            <p className="text-xs text-slate-400">{subLabel}</p>
        </div>
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, session, cashMovements = [], services = [], clients = [] }) => {
  const userName = session?.user.fullName || 'Usuario';
  const dailyGoal = 1500.00; // Meta diaria simulada

  // --- LÓGICA DE DATOS ---
  const stats = useMemo(() => {
      // 1. VENTAS HOY (GLOBAL TIENDA)
      const salesToday = cashMovements
          .filter(m => m.type === 'Ingreso' && (m.category === 'Venta' || m.concept.includes('Venta')))
          .reduce((acc, m) => acc + m.amount, 0);

      // 2. MI VENTA HOY (PERSONAL)
      const mySalesToday = cashMovements
          .filter(m => m.type === 'Ingreso' && m.user === session?.user.username && (m.category === 'Venta' || m.concept.includes('Venta')))
          .reduce((acc, m) => acc + m.amount, 0);

      // 3. CUENTAS POR COBRAR (DEUDA CLIENTES)
      const totalReceivables = clients.reduce((acc, c) => acc + (c.creditUsed || 0), 0);

      // 4. ESTADISTICAS SERVICIOS (Para el gráfico Donut)
      const pendingServices = services.filter(s => s.status === 'Pendiente').length;
      const repairedServices = services.filter(s => s.status === 'Reparado').length;
      const deliveredServices = services.filter(s => s.status === 'Entregado').length;
      const totalServices = services.length || 1;

      // 5. TOTAL CLIENTES
      const totalClients = clients.length;

      return { 
          salesToday,
          mySalesToday,
          totalReceivables,
          pendingServices,
          repairedServices,
          deliveredServices,
          totalServices,
          totalClients
      };
  }, [cashMovements, services, clients, session?.user.username]);

  const goalProgress = Math.min(100, (stats.mySalesToday / dailyGoal) * 100);

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* 1. HERO SECTION: BIENVENIDA & METAS PERSONALES (ANCHO COMPLETO) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden flex flex-col md:flex-row items-center md:items-stretch gap-8">
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex-1 z-10 flex flex-col justify-center text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                  Bienvenido de nuevo, {userName.split(' ')[0]} 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                  Aquí tienes tu avance personal y el global de la tienda.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 justify-center md:justify-start">
                  
                  {/* Mi Venta */}
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mi Venta Hoy</p>
                      <p className="text-5xl font-black text-primary-600 dark:text-primary-400">S/ {stats.mySalesToday.toFixed(2)}</p>
                  </div>
                  
                  <div className="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                  
                  {/* Venta Global Tienda (Added) */}
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Store size={12}/> Venta Total Tienda
                      </p>
                      <p className="text-4xl font-bold text-slate-700 dark:text-slate-300">S/ {stats.salesToday.toFixed(2)}</p>
                  </div>

                  <div className="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                  {/* Meta Personal */}
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mi Meta</p>
                      <div className="flex items-baseline gap-3 justify-center md:justify-start">
                          <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">S/ {dailyGoal.toFixed(0)}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${goalProgress >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {goalProgress.toFixed(0)}%
                          </span>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Circular Progress Widget */}
          <div className="flex items-center justify-center shrink-0 pr-0 md:pr-12">
              <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        {/* Progress Circle */}
                        <circle 
                            cx="80" cy="80" r="70" 
                            stroke="currentColor" 
                            strokeWidth="10" 
                            fill="transparent" 
                            strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * (goalProgress / 100))} 
                            strokeLinecap="round"
                            className="text-primary-500 transition-all duration-1000 ease-out" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-600 dark:text-primary-400">
                        <Target size={32} />
                        <span className="text-sm font-bold mt-1">Objetivo</span>
                    </div>
              </div>
          </div>
      </div>

      {/* 2. MAIN GRID: CUENTAS POR COBRAR & ACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA: Cuentas por Cobrar & Taller */}
          <div className="flex flex-col gap-6">
              
              {/* Card: Cuentas por Cobrar */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:border-red-200 dark:hover:border-red-900 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><CreditCard size={48} className="text-red-500"/></div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Cuentas por Cobrar</p>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">S/ {stats.totalReceivables.toFixed(2)}</h3>
                  <div className="mt-4">
                      <button onClick={() => onNavigate(ViewState.CLIENTS)} className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1">
                          Ver deudores <CheckCircle size={12}/>
                      </button>
                  </div>
              </div>

              {/* Card: Resumen Taller (Gráfico) */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center flex-1">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 w-full text-left flex items-center gap-2">
                      <PieChart size={14}/> Estado Taller
                  </h3>
                  
                  <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 rounded-full shadow-inner" 
                           style={{ 
                               background: `conic-gradient(
                                   #10b981 0% ${((stats.deliveredServices/stats.totalServices)*100)}%, 
                                   #9333ea ${((stats.deliveredServices/stats.totalServices)*100)}% ${((stats.deliveredServices + stats.repairedServices)/stats.totalServices)*100}%, 
                                   #f59e0b ${((stats.deliveredServices + stats.repairedServices)/stats.totalServices)*100}% 100%
                               )` 
                           }}>
                          <div className="absolute inset-3 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col">
                              <span className="text-xl font-black text-slate-800 dark:text-white">{stats.totalServices}</span>
                          </div>
                      </div>
                      <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Entregados ({stats.deliveredServices})</div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-primary"></span> Listos ({stats.repairedServices})</div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-500"></span> En Proceso ({stats.pendingServices})</div>
                      </div>
                  </div>
              </div>

          </div>

          {/* COLUMNA DERECHA: ACCIONES RÁPIDAS (2 Columnas Wide) */}
          <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-6">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-4 h-full content-start">
                  <QuickActionBtn 
                    icon={ShoppingCart} 
                    label="Nueva Venta" 
                    subLabel="Ir al POS"
                    color="blue" 
                    onClick={() => onNavigate(ViewState.POS)}
                  />
                  <QuickActionBtn 
                    icon={Wrench} 
                    label="Servicio Téc." 
                    subLabel="Recepcionar"
                    color="purple" 
                    onClick={() => onNavigate(ViewState.SERVICES)}
                  />
                  <QuickActionBtn 
                    icon={CreditCard} 
                    label="Caja Chica" 
                    subLabel="Movimientos"
                    color="emerald" 
                    onClick={() => onNavigate(ViewState.CASH)}
                  />
                  <QuickActionBtn
                    icon={Users}
                    label="Clientes"
                    subLabel={`Base: ${stats.totalClients}`}
                    color="orange"
                    onClick={() => onNavigate(ViewState.CLIENTS)}
                  />
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
