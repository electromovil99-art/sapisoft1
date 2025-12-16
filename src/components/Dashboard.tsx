
import React, { useMemo } from 'react';
import { ShoppingCart, TrendingUp, Users, Target, Activity, CreditCard, Wallet, MoreHorizontal, ChevronRight, Megaphone } from 'lucide-react';
import { ViewState, AuthSession } from '../types';
import { MOCK_CASH_MOVEMENTS, MOCK_CLIENTS } from '../constants';

interface DashboardProps { onNavigate: (view: ViewState) => void; session?: AuthSession | null; }

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, session }) => {
  const userName = session?.user.fullName || 'Usuario';
  const dailyGoal = 1500.00;
  const stats = useMemo(() => {
      const mySalesToday = MOCK_CASH_MOVEMENTS.filter(m => m.type === 'Ingreso' && m.user.includes(userName.split(' ')[0]) && m.category?.includes('Venta')).reduce((acc, m) => acc + m.amount, 0);
      const storeSalesToday = MOCK_CASH_MOVEMENTS.filter(m => m.type === 'Ingreso' && m.category?.includes('Venta')).reduce((acc, m) => acc + m.amount, 0);
      const myReceivables = MOCK_CLIENTS.reduce((acc, c) => acc + (c.creditUsed || 0), 0);
      return { mySalesToday, storeSalesToday, myReceivables };
  }, [userName]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center md:items-stretch gap-8">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              <div className="flex-1 z-10 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Hola, {userName.split(' ')[0]} 👋</h2>
                  <div className="flex gap-10 mt-4">
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Mi Venta Hoy</p><div className="text-4xl font-black text-slate-800 dark:text-white">S/ {stats.mySalesToday.toFixed(2)}</div></div>
                      <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Meta Diaria</p><div className="text-4xl font-bold text-slate-300 dark:text-slate-600">S/ {dailyGoal.toFixed(0)}</div></div>
                  </div>
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div><div className="flex justify-between items-start mb-6"><div className="p-3 bg-slate-50 dark:bg-white/10 rounded-2xl"><Users size={24} className="text-emerald-500"/></div><span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-3 py-1 rounded-full">Global Tienda</span></div><p className="text-4xl font-bold mb-2">S/ {stats.storeSalesToday.toFixed(2)}</p><p className="text-slate-400 text-sm">Venta total acumulada</p></div>
          </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onNavigate(ViewState.POS)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all group"><div className="p-4 rounded-xl bg-blue-50 text-blue-600"><ShoppingCart size={24}/></div><div><p className="font-bold text-slate-800 dark:text-white text-sm">Nueva Venta</p><p className="text-xs text-slate-400">Facturar</p></div></button>
          <button onClick={() => onNavigate(ViewState.SERVICES)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all group"><div className="p-4 rounded-xl bg-orange-50 text-orange-600"><Activity size={24}/></div><div><p className="font-bold text-slate-800 dark:text-white text-sm">Servicio Téc.</p><p className="text-xs text-slate-400">Recepción</p></div></button>
          <button onClick={() => onNavigate(ViewState.CASH)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all group"><div className="p-4 rounded-xl bg-emerald-50 text-emerald-600"><CreditCard size={24}/></div><div><p className="font-bold text-slate-800 dark:text-white text-sm">Caja Chica</p><p className="text-xs text-slate-400">Cobros</p></div></button>
          <button onClick={() => onNavigate(ViewState.USER_PRIVILEGES)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all group"><div className="p-4 rounded-xl bg-purple-50 text-purple-600"><Users size={24}/></div><div><p className="font-bold text-slate-800 dark:text-white text-sm">Usuarios</p><p className="text-xs text-slate-400">Gestión</p></div></button>
      </div>
    </div>
  );
};
export default Dashboard;
