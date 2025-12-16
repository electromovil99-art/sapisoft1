
import React, { useMemo } from 'react';
import { 
  ShoppingCart, TrendingUp, Users, Target, Calendar, 
  ArrowRight, CreditCard, Award, Megaphone, ArrowUpRight,
  MoreHorizontal, ChevronRight, Wallet, Activity
} from 'lucide-react';
import { ViewState, AuthSession, CashMovement } from '../types';
import { MOCK_CLIENTS } from '../constants';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  session?: AuthSession | null;
  cashMovements: CashMovement[];
}

// 1. Goal Ring Component
const GoalRing = ({ current, target, color }: { current: number, target: number, color: string }) => {
    const percentage = Math.min(100, Math.max(0, (current / target) * 100));
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="transform -rotate-90 w-full h-full drop-shadow-md">
                <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center text-slate-700 dark:text-white">
                <span className="text-sm font-extrabold tracking-tight">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

// 2. Bar Chart
const ClientAcquisitionChart = () => {
    const data = [2, 4, 1, 5, 3, 6, 4]; // Lun-Dom
    const max = Math.max(...data);
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return (
        <div className="flex items-end justify-between h-24 w-full gap-3 mt-4">
            {data.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                    <div 
                        className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-lg relative overflow-hidden transition-all group-hover:bg-primary-200 dark:group-hover:bg-primary-800" 
                        style={{ height: `${(val / max) * 100}%`, minHeight: '10%' }}
                    >
                        <div className="absolute bottom-0 w-full bg-primary-500 opacity-80 h-full transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold group-hover:text-primary-500">{days[i]}</span>
                </div>
            ))}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, session, cashMovements }) => {
  const userName = session?.user.fullName || 'Usuario';
  const dailyGoal = 1500.00;

  const stats = useMemo(() => {
      const mySalesToday = cashMovements
          .filter(m => m.type === 'Ingreso' && m.user === userName && m.category === 'Venta')
          .reduce((acc, m) => acc + m.amount, 0);

      const storeSalesToday = cashMovements
          .filter(m => m.type === 'Ingreso' && m.category === 'Venta')
          .reduce((acc, m) => acc + m.amount, 0);

      const myReceivables = MOCK_CLIENTS
          .reduce((acc, c) => acc + (c.creditUsed || 0), 0);

      const newClientsCount = MOCK_CLIENTS.filter(c => c.tags?.includes('Nuevo')).length;

      return { mySalesToday, storeSalesToday, myReceivables, newClientsCount };
  }, [userName, cashMovements]);

  const progressColor = stats.mySalesToday >= dailyGoal ? '#10b981' : '#6366f1';

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* --- TOP SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. MY GOAL CARD (HERO) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center md:items-stretch gap-8">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

              {/* User Info & Goal */}
              <div className="flex-1 z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-2xl shadow-sm border border-primary-100 dark:border-slate-700">
                          {userName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hola, {userName.split(' ')[0]} 👋</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{session?.user.role || 'Vendedor'} • {session?.businessName || 'Sede'}</p>
                      </div>
                  </div>
                  
                  <div className="flex gap-10">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mi Venta Hoy</p>
                          <div className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">S/ {stats.mySalesToday.toFixed(2)}</div>
                          <div className="text-xs text-primary-600 dark:text-primary-400 font-bold mt-2 flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-full w-fit">
                              <TrendingUp size={14}/> {dailyGoal > 0 ? ((stats.mySalesToday/dailyGoal)*100).toFixed(0) : '0'}% de la meta
                          </div>
                      </div>
                      <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meta Diaria</p>
                          <div className="text-4xl font-bold text-slate-300 dark:text-slate-600 tracking-tight">S/ {dailyGoal.toFixed(0)}</div>
                          <div className="text-xs text-slate-400 mt-2 font-medium">Faltan S/ {(dailyGoal - stats.mySalesToday).toFixed(2)}</div>
                      </div>
                  </div>
              </div>

              {/* Progress Ring */}
              <div className="flex items-center justify-center shrink-0 pr-4">
                  <div className="relative">
                      <GoalRing current={stats.mySalesToday} target={dailyGoal} color={progressColor} />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className={`px-4 py-1.5 text-xs font-bold rounded-full border shadow-sm ${stats.mySalesToday >= dailyGoal ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                              {stats.mySalesToday >= dailyGoal ? '¡Meta Cumplida! 🎉' : '¡Tú puedes! 🚀'}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* 2. STORE OVERVIEW (Adaptive Card) */}
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-50 dark:bg-white/10 rounded-2xl backdrop-blur-sm border border-slate-100 dark:border-white/10">
                          <Users size={24} className="text-emerald-500 dark:text-emerald-400"/>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">Global Tienda</span>
                  </div>
                  <p className="text-4xl font-bold mb-2 tracking-tight">S/ {stats.storeSalesToday.toFixed(2)}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Venta total acumulada hoy</p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 relative z-10">
                  <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-300">Tu aporte:</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{((stats.mySalesToday / (stats.storeSalesToday || 1))*100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(stats.mySalesToday / (stats.storeSalesToday || 1))*100}%` }}></div>
                  </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 3. RECEIVABLES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col hover:border-primary-200 dark:hover:border-primary-900 transition-colors">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500"><Wallet size={18}/></div>
                      Por Cobrar
                  </h3>
                  <button onClick={() => onNavigate(ViewState.CLIENTS)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                      <ChevronRight size={16}/>
                  </button>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center py-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">S/ {stats.myReceivables.toFixed(2)}</span>
                  <span className="text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full mt-2 border border-red-100 dark:border-red-900/30">
                      Cartera Vencida
                  </span>
              </div>
              <button className="w-full mt-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700">
                  Ver Lista de Deudores
              </button>
          </div>

          {/* 4. NEW CLIENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500"><UserPlusIcon size={18}/></div>
                      Nuevos Clientes
                  </h3>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.newClientsCount}</span>
              </div>
              <p className="text-xs text-slate-400 mb-2 pl-1">Adquisición últimos 7 días</p>
              <ClientAcquisitionChart />
          </div>

          {/* 5. MARKETING BANNER - Adaptive Mode (Day: Clean White / Night: Dark Gradient) */}
          <div className="md:col-span-2 relative rounded-3xl p-8 shadow-sm overflow-hidden flex flex-col justify-center transition-colors duration-300 border
              bg-white border-slate-200 
              dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
              
              <div className="relative z-10 max-w-sm">
                  <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm
                          bg-indigo-50 text-indigo-600 border border-indigo-100
                          dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/30">
                          Campaña Activa
                      </span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 tracking-tight
                      text-slate-800 
                      dark:text-white">
                      ¡Semana Tecnológica! 📱
                  </h3>
                  <p className="text-sm mb-6 leading-relaxed
                      text-slate-500
                      dark:text-slate-300">
                      Ofrece <strong>10% de dscto.</strong> en accesorios por la compra de cualquier celular Samsung o Xiaomi. Aumenta tu ticket promedio.
                  </p>
                  <button className="px-5 py-3 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 w-fit transition-colors border
                      bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600
                      dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 dark:border-indigo-500/50">
                      <Megaphone size={16}/> Ver Promociones
                  </button>
              </div>
              
              {/* Decorative Background Icon */}
              <div className="absolute -right-10 -bottom-10 transform rotate-12 opacity-10 dark:opacity-5 text-indigo-600 dark:text-white pointer-events-none">
                  <Target size={220} />
              </div>
              
              {/* Subtle Gradient Overlay for Day Mode */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none dark:hidden"></div>
          </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionBtn 
            icon={ShoppingCart} 
            label="Nueva Venta" 
            subLabel="Facturar"
            color="blue" 
            onClick={() => onNavigate(ViewState.POS)}
          />
          <QuickActionBtn 
            icon={Activity} 
            label="Servicio Téc." 
            subLabel="Recepción"
            color="orange" 
            onClick={() => onNavigate(ViewState.SERVICES)}
          />
          <QuickActionBtn 
            icon={CreditCard} 
            label="Ingreso Caja" 
            subLabel="Cobros"
            color="emerald" 
            onClick={() => onNavigate(ViewState.CASH)}
          />
          <QuickActionBtn 
            icon={Users} 
            label="Usuarios" 
            subLabel="Gestión"
            color="purple" 
            onClick={() => onNavigate(ViewState.USER_PRIVILEGES)}
          />
      </div>

    </div>
  );
};

const QuickActionBtn = ({ icon: Icon, label, subLabel, color, onClick }: any) => {
    const colors: {[key:string]: string} = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
        orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
    };

    return (
        <button onClick={onClick} className="group bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md text-left">
            <div className={`p-4 rounded-xl transition-all duration-300 ${colors[color]}`}>
                <Icon size={24}/>
            </div>
            <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{subLabel}</p>
            </div>
        </button>
    );
};

const UserPlusIcon = ({ size, className }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
);

export default Dashboard;
