
import React, { useMemo } from 'react';
import { ViewState, AuthSession } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Package, Wrench, 
  Wallet, Users, Activity, ShoppingBag, FolderCog, FileSearch, Truck, Landmark, BrainCircuit, Moon, Sun,
  LogOut, Search, Bell, TrendingDown, TrendingUp, Printer, Shield, FileMinus, CreditCard, ChevronRight, Menu, Map, MessageCircle, Globe
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  session?: AuthSession; 
  onLogout?: () => void; 
}

const NAV_STRUCTURE = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    views: [ViewState.DASHBOARD]
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: ShoppingCart,
    items: [
      { view: ViewState.POS, label: 'Punto de Venta', icon: ShoppingCart },
      { view: ViewState.SERVICES, label: 'Servicio Técnico', icon: Wrench },
      { view: ViewState.CLIENTS, label: 'Clientes', icon: Users },
      { view: ViewState.CREDIT_NOTE, label: 'Devoluciones', icon: FileMinus },
      { view: ViewState.WHATSAPP, label: 'WhatsApp CRM', icon: MessageCircle }, // Added WhatsApp
    ]
  },
  {
    id: 'logistica',
    label: 'Logística',
    icon: Package,
    items: [
      { view: ViewState.INVENTORY, label: 'Inventario', icon: Package },
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
    id: 'gestion',
    label: 'Gestión',
    icon: Activity,
    items: [
      { view: ViewState.BUSINESS_EVOLUTION, label: 'Evolución', icon: Activity },
      { view: ViewState.FINANCIAL_STRATEGY, label: 'Estrategia IA', icon: BrainCircuit },
      { view: ViewState.HISTORY_QUERIES, label: 'Historial', icon: FileSearch },
      { view: ViewState.USER_PRIVILEGES, label: 'Usuarios', icon: Shield },
      { view: ViewState.CONFIG_PRINTER, label: 'Impresoras', icon: Printer },
    ]
  }
];

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, isDarkMode, toggleTheme, session, onLogout }) => {
  
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN';

  const activeCategory = useMemo(() => {
    return NAV_STRUCTURE.find(cat => 
      cat.views?.includes(currentView) || cat.items?.some(item => item.view === currentView)
    );
  }, [currentView]);

  return (
    <div className={`flex flex-col h-screen w-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden transition-colors duration-300 font-sans`}>
      
      {/* 1. TOP HEADER - Redesigned for aesthetics */}
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
            <div className="flex items-center gap-3 pr-6">
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
            </div>

            {/* Navigation - Glassmorphism Style */}
            {!isSuperAdmin && (
                <nav className="hidden md:flex items-center gap-1 mx-4 p-1 bg-black/10 dark:bg-white/5 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto no-scrollbar">
                    {NAV_STRUCTURE.map((cat) => {
                        const isActive = activeCategory?.id === cat.id;
                        const Icon = cat.icon;
                        
                        const handleClick = () => {
                            if (cat.views) onNavigate(cat.views[0]);
                            else if (cat.items) onNavigate(cat.items[0].view);
                        };

                        return (
                            <button
                                key={cat.id}
                                onClick={handleClick}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 relative group
                                    ${isActive 
                                        ? 'bg-white text-primary-700 shadow-md transform scale-105' 
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }
                                `}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary-600' : ''} />
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
                   <div className="relative hidden xl:block group mr-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors"/>
                      <input 
                        type="text" 
                        placeholder="Buscar ticket, cliente..." 
                        className="pl-9 pr-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs w-56 focus:w-64 focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all text-white placeholder-white/60 outline-none backdrop-blur-sm"
                      />
                   </div>
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

      {/* 2. SUB HEADER (Standard Users Only) - Cleaner look */}
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
                                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-100 dark:border-primary-800'
                                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                                  }
                              `}
                          >
                              <ItemIcon size={14} strokeWidth={isActiveSub ? 2.5 : 2} className={isActiveSub ? 'text-primary-600 dark:text-primary-400' : 'opacity-70'}/>
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
