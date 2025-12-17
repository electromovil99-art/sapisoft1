

import React, { useMemo } from 'react';
import { ViewState, AuthSession } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Package, Wrench, 
  Wallet, Users, Activity, ShoppingBag, FolderCog, FileSearch, Truck, Landmark, BrainCircuit, Moon, Sun,
  LogOut, Search, Bell, TrendingDown, TrendingUp, Printer, Shield, FileMinus, CreditCard, ChevronRight, Menu, Map, MessageCircle, Globe,
  Database, Settings, BarChart3, ClipboardList, Cloud, CloudOff, FileScan, FileBarChart, PieChart, Image as ImageIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  session?: AuthSession; 
  onLogout?: () => void; 
  isSyncEnabled: boolean;
  toggleSyncMode: () => void;
}

const NAV_STRUCTURE = [
  {
    id: 'comercial',
    label: 'Comercial',
    icon: ShoppingCart,
    items: [
      { view: ViewState.POS, label: 'Punto de Venta', icon: ShoppingCart },
      { view: ViewState.QUOTATIONS, label: 'Cotizaciones', icon: ClipboardList },
      { view: ViewState.SERVICES, label: 'Servicio Técnico', icon: Wrench },
      { view: ViewState.CLIENTS, label: 'Clientes', icon: Users },
      { view: ViewState.CREDIT_NOTE, label: 'Devoluciones', icon: FileMinus },
      { view: ViewState.WHATSAPP, label: 'WhatsApp CRM', icon: MessageCircle }, 
    ]
  },
  {
    id: 'logistica',
    label: 'Logística',
    icon: Package,
    items: [
      { view: ViewState.INVENTORY, label: 'Inventario', icon: Package },
      { view: ViewState.INVENTORY_CONTROL, label: 'Toma de Inventario', icon: FileScan },
      { view: ViewState.PURCHASES, label: 'Compras', icon: ShoppingBag },
      { view: ViewState.SUPPLIERS, label: 'Proveedores', icon: Truck },
      { view: ViewState.MANAGE_RESOURCES, label: 'Marcas y Cat.', icon: FolderCog },
      { view: ViewState.LOCATIONS, label: 'Lugares / Ubigeo', icon: Map }, 
    ]
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: Wallet,
    items: [
      { view: ViewState.CASH, label: 'Caja Chica', icon: Wallet },
      { view: ViewState.CLIENT_WALLET, label: 'Billeteras', icon: CreditCard },
      { view: ViewState.BANK_ACCOUNTS, label: 'Bancos', icon: Landmark },
      { view: ViewState.FIXED_EXPENSES, label: 'Gastos Fijos', icon: TrendingDown },
      { view: ViewState.FIXED_INCOME, label: 'Ingresos Fijos', icon: TrendingUp },
    ]
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    items: [
      { view: ViewState.SALES_REPORT, label: 'Ventas', icon: TrendingUp },
      { view: ViewState.PROFIT_REPORT, label: 'Utilidades', icon: PieChart },
      { view: ViewState.INVENTORY_REPORT, label: 'Inventario', icon: FileBarChart },
      { view: ViewState.BUSINESS_EVOLUTION, label: 'Evolución', icon: Activity },
      { view: ViewState.FINANCIAL_STRATEGY, label: 'Estrategia IA', icon: BrainCircuit },
    ]
  },
  {
    id: 'consultas',
    label: 'Consultas',
    icon: FileSearch,
    items: [
      { view: ViewState.HISTORY_QUERIES, label: 'Consulta Ventas', icon: ShoppingCart },
      { view: ViewState.PURCHASES_HISTORY, label: 'Consulta Compras', icon: ShoppingBag },
      { view: ViewState.KARDEX_HISTORY, label: 'Movimientos (Kardex)', icon: Package }
    ]
  },
  {
    id: 'configuracion',
    label: 'Config.',
    icon: Settings,
    items: [
      { view: ViewState.USER_PRIVILEGES, label: 'Usuarios', icon: Shield },
      { view: ViewState.MEDIA_EDITOR, label: 'Gestor Multimedia', icon: ImageIcon },
      { view: ViewState.CONFIG_PRINTER, label: 'Impresoras', icon: Printer },
      { view: ViewState.DATABASE_CONFIG, label: 'Base de Datos', icon: Database },
    ]
  }
];

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isDarkMode, toggleTheme, session, onLogout, isSyncEnabled, toggleSyncMode }) => {
  
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN';

  const activeCategory = useMemo(() => {
    if (currentView === ViewState.DASHBOARD) return null;
    return NAV_STRUCTURE.find(cat => 
      cat.items?.some(item => item.view === currentView)
    );
  }, [currentView]);

  return (
    <div className={`flex flex-col h-screen w-full bg-[#f8fafc] dark:bg-[#020617] overflow-hidden transition-colors duration-300 font-sans`}>
      
      {/* 1. TOP HEADER */}
      <header className={`
          relative shrink-0 z-30 shadow-xl transition-all duration-300
          ${isSuperAdmin 
            ? 'bg-slate-900 border-b border-slate-800' 
            : 'bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] dark:from-[#0f172a] dark:to-[#1e293b] border-b border-white/10 dark:border-slate-800'
          }
      `}>
         {/* Background pattern overlay for texture */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

         <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between relative z-10">
            
            {/* Logo Section */}
            <button onClick={() => onNavigate(ViewState.DASHBOARD)} className="flex items-center gap-3 pr-6 text-left">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/20 backdrop-blur-md">
                   <span className="text-white font-black text-lg tracking-tight drop-shadow-md">S</span>
                </div>
                <div className="flex flex-col">
                   <h1 className="font-bold text-white text-base leading-none tracking-tight drop-shadow-sm">SapiSoft</h1>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                      <p className="text-[9px] text-white/80 font-medium tracking-widest uppercase">{isSuperAdmin ? 'MASTER ADMIN' : 'CLOUD ERP'}</p>
                   </div>
                </div>
            </button>

            {/* Navigation - Glassmorphism Style */}
            {!isSuperAdmin && (
                <nav className="hidden md:flex items-center gap-1 mx-4 p-1 bg-black/10 dark:bg-white/5 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto no-scrollbar">
                    {NAV_STRUCTURE.map((cat) => {
                        const isActive = activeCategory?.id === cat.id;
                        const Icon = cat.icon;
                        
                        const handleClick = () => {
                            if (cat.items) onNavigate(cat.items[0].view);
                        };

                        return (
                            <button
                                key={cat.id}
                                onClick={handleClick}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 relative group
                                    ${isActive 
                                        ? 'bg-white text-primary-700 dark:bg-slate-700 dark:text-white shadow-md transform scale-105' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }
                                `}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary-600 dark:text-white' : ''} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </nav>
            )}

            {isSuperAdmin && (
                <div className="flex-1 px-6">
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-2"><Globe size={16}/> Panel de Control Global</span>
                </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-auto pl-2">
               {!isSuperAdmin && (
                   <button 
                      onClick={toggleSyncMode}
                      title={isSyncEnabled ? "Sincronización con la Nube ACTIVADA" : "Sincronización con la Nube DESACTIVADA"}
                      className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border backdrop-blur-sm
                          ${isSyncEnabled 
                              ? 'bg-emerald-500/80 text-white border-emerald-400/50' 
                              : 'bg-white/10 text-white/70 hover:text-white border-white/10'
                          }
                      `}
                   >
                       {isSyncEnabled ? <Cloud size={14}/> : <CloudOff size={14}/>}
                       Sinc. Nube
                   </button>
               )}
               
               <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/10 backdrop-blur-sm">
                   <button 
                      onClick={toggleTheme}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                      title="Cambiar Tema"
                   >
                      {isDarkMode ? <Sun size={18} className="text-amber-300 fill-amber-300/20"/> : <Moon size={18}/>}
                   </button>

                   {!isSuperAdmin && (
                       <button className="relative p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all">
                          <Bell size={18} />
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white/20 animate-ping"></span>
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white/20"></span>
                       </button>
                   )}
               </div>

               <div className="flex items-center gap-3 pl-3 border-l border-white/10 ml-2">
                  <div className="flex items-center gap-3 cursor-pointer group">
                      <div className="text-right hidden lg:block leading-tight">
                          <p className="text-xs font-bold text-white group-hover:text-white/90 transition-colors max-w-[100px] truncate">
                              {session?.user.fullName || 'Admin'}
                          </p>
                          <p className="text-[9px] text-white/60 uppercase group-hover:text-white/80 transition-colors">
                              {session?.user.role || 'Admin'}
                          </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/20 p-[2px] shadow-sm group-hover:border-white/40 transition-all">
                          <img src={`https://ui-avatars.com/api/?name=${session?.user.fullName || 'Admin'}&background=random&color=fff`} alt="User" className="rounded-full h-full w-full object-cover" />
                      </div>
                  </div>
                  <button onClick={onLogout} className="p-2 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-full transition-colors" title="Cerrar Sesión">
                      <LogOut size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </header>

      {/* 2. SUB HEADER (Standard Users Only) */}
      {!isSuperAdmin && activeCategory && activeCategory.items && (
          <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shrink-0 shadow-sm z-20 transition-colors duration-300">
              <div className="max-w-[1920px] mx-auto px-4 h-11 flex items-center overflow-x-auto no-scrollbar gap-1">
                  {activeCategory.items.map(item => {
                      const isActiveSub = currentView === item.view;
                      const ItemIcon = item.icon;
                      return (
                          <button
                              key={item.view}
                              onClick={() => onNavigate(item.view)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap border
                                  ${isActiveSub
                                      ? 'bg-primary-50 dark:bg-primary-600 text-primary-700 dark:text-white border-primary-100 dark:border-primary-500'
                                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                  }
                              `}
                          >
                              <ItemIcon size={14} strokeWidth={isActiveSub ? 2.5 : 2} className={isActiveSub ? 'text-primary-600 dark:text-white' : 'opacity-70'}/>
                              {item.label}
                          </button>
                      )
                  })}
              </div>
          </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#f8fafc] dark:bg-[#020617]">
         <div className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth">
            <div className="max-w-[1920px] mx-auto h-full flex flex-col animate-fade-in">
               {children}
            </div>
         </div>
      </main>
    </div>
  );
};

export default Layout;