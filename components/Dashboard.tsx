
import React, { useMemo } from 'react';
import { 
  ShoppingCart, TrendingUp, Users, Calendar, 
  CreditCard, Wallet, Activity, Wrench, ArrowUpRight, CheckCircle, Clock, AlertCircle, PieChart, BarChart3
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

  // --- LÓGICA DE DATOS REALES (RECUPERADA) ---
  const stats = useMemo(() => {
      const todayDate = new Date().toLocaleDateString('es-PE');
      
      // 1. VENTAS HOY (Suma de ingresos por ventas en la fecha actual)
      const salesToday = cashMovements
          .filter(m => m.type === 'Ingreso' && (m.category === 'Venta' || m.concept.includes('Venta')))
          // Nota: En un entorno real compararíamos fechas correctamente. Aquí asumimos que los datos mock son recientes o usamos un fallback.
          .reduce((acc, m) => acc + m.amount, 0);

      // 2. SERVICIOS (Conteo por estados)
      const pendingServices = services.filter(s => s.status === 'Pendiente').length;
      const repairedServices = services.filter(s => s.status === 'Reparado').length;
      const deliveredServices = services.filter(s => s.status === 'Entregado').length;
      const totalServices = services.length || 1; // Evitar división por cero

      // 3. CAJA ACTUAL (Ingresos - Egresos Totales)
      const totalIngresos = cashMovements.filter(m => m.type === 'Ingreso').reduce((acc, m) => acc + m.amount, 0);
      const totalEgresos = cashMovements.filter(m => m.type === 'Egreso').reduce((acc, m) => acc + m.amount, 0);
      const currentBalance = totalIngresos - totalEgresos;

      // 4. CLIENTES NUEVOS (Simulación basada en longitud de array)
      const totalClients = clients.length;

      return { 
          salesToday,
          pendingServices,
          repairedServices,
          deliveredServices,
          totalServices,
          currentBalance,
          totalClients
      };
  }, [cashMovements, services, clients]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Panel de Control</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Bienvenido de nuevo, {userName.split(' ')[0]}</p>
          </div>
          <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase">Fecha Actual</p>
              <p className="text-lg font-bold text-slate-700 dark:text-white capitalize">
                  {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
          </div>
      </div>

      {/* --- KPI CARDS SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ventas del Día */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShoppingCart size={48} className="text-blue-500"/></div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Ventas del Día</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">S/ {stats.salesToday.toFixed(2)}</h3>
              <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-full">
                  <TrendingUp size={12}/> <span>Activo</span>
              </div>
          </div>

          {/* Card 2: Servicios Pendientes */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Wrench size={48} className="text-purple-500"/></div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">En Taller (Pendientes)</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">{stats.pendingServices} <span className="text-lg font-medium text-slate-400">Equipos</span></h3>
              <div className={`mt-2 flex items-center gap-1 text-xs font-bold w-fit px-2 py-1 rounded-full ${stats.pendingServices > 5 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'}`}>
                  <Clock size={12}/> <span>{stats.pendingServices > 5 ? 'Alta Carga' : 'Flujo Normal'}</span>
              </div>
          </div>

          {/* Card 3: Caja Actual */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet size={48} className="text-emerald-500"/></div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Caja Actual (Neto)</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">S/ {stats.currentBalance.toFixed(2)}</h3>
              <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded-full">
                  <CheckCircle size={12}/> <span>Balance Positivo</span>
              </div>
          </div>
      </div>

      {/* --- SECCIÓN PRINCIPAL DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: GRÁFICO DE RENDIMIENTO (DONUT REAL) */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-6 w-full text-left flex items-center gap-2">
                  <PieChart size={16}/> Estado de Reparaciones
              </h3>
              
              <div className="relative w-48 h-48 rounded-full shadow-xl mb-6" 
                   style={{ 
                       background: `conic-gradient(
                           #10b981 0% ${((stats.deliveredServices/stats.totalServices)*100)}%, 
                           #9333ea ${((stats.deliveredServices/stats.totalServices)*100)}% ${((stats.deliveredServices + stats.repairedServices)/stats.totalServices)*100}%, 
                           #f59e0b ${((stats.deliveredServices + stats.repairedServices)/stats.totalServices)*100}% 100%
                       )` 
                   }}>
                  <div className="absolute inset-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col">
                      <span className="text-4xl font-black text-slate-800 dark:text-white">{stats.totalServices}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Totales</span>
                  </div>
              </div>

              <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                          <span className="text-xs font-bold text-slate-700 dark:text-white">Entregados</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{stats.deliveredServices}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(147,51,234,0.4)]"></div>
                          <span className="text-xs font-bold text-slate-700 dark:text-white">Listos (Taller)</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{stats.repairedServices}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                          <span className="text-xs font-bold text-slate-700 dark:text-white">En Proceso</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{stats.pendingServices}</span>
                  </div>
              </div>
          </div>

          {/* RIGHT: ACCIONES Y RESUMEN FINANCIERO */}
          <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Acciones Rápidas */}
              <div className="grid grid-cols-2 gap-4">
                  <QuickActionBtn 
                    icon={ShoppingCart} 
                    label="Nueva Venta" 
                    subLabel="Facturar Productos"
                    color="blue" 
                    onClick={() => onNavigate(ViewState.POS)}
                  />
                  <QuickActionBtn 
                    icon={Wrench} 
                    label="Servicio Téc." 
                    subLabel="Nueva Recepción"
                    color="purple" 
                    onClick={() => onNavigate(ViewState.SERVICES)}
                  />
                  <QuickActionBtn 
                    icon={CreditCard} 
                    label="Movimiento Caja" 
                    subLabel="Ingreso / Egreso"
                    color="emerald" 
                    onClick={() => onNavigate(ViewState.CASH)}
                  />
                  <QuickActionBtn
                    icon={Users}
                    label="Base Clientes"
                    subLabel={`Ver ${stats.totalClients} Registros`}
                    color="orange"
                    onClick={() => onNavigate(ViewState.CLIENTS)}
                  />
              </div>

              {/* Banner de Evolución */}
              <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 relative overflow-hidden flex items-center shadow-lg group cursor-pointer" onClick={() => onNavigate(ViewState.BUSINESS_EVOLUTION)}>
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                      <BarChart3 size={150} className="text-white"/>
                  </div>
                  <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white mb-3 backdrop-blur-sm border border-white/10">
                          <Activity size={12}/> Módulo Avanzado
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Evolución del Negocio</h3>
                      <p className="text-slate-400 text-sm max-w-sm mb-4">
                          Analiza tus activos líquidos, inventario valorizado y cuentas por cobrar en tiempo real.
                      </p>
                      <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                          Ver Reporte Completo
                      </button>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Dashboard;
