
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SalesModule from './components/SalesModule';
import PurchaseModule from './components/PurchaseModule';
import InventoryModule from './components/InventoryModule';
import ServicesModule from './components/ServicesModule';
import ClientsModule from './components/ClientsModule'; 
import BusinessEvolutionModule from './components/BusinessEvolutionModule';
import ResourceManagement from './components/ResourceManagement';
import SuppliersModule from './components/SuppliersModule'; 
import BankAccountsModule from './components/BankAccountsModule'; 
import HistoryQueries from './components/HistoryQueries';
import FinancialStrategyModule from './components/FinancialStrategyModule'; 
import FinanceManagerModule from './components/FinanceManagerModule'; 
import PrintConfigModule from './components/PrintConfigModule'; 
import UserPrivilegesModule from './components/UserPrivilegesModule'; 
import CreditNoteModule from './components/CreditNoteModule'; 
import ClientWalletModule from './components/ClientWalletModule'; 
import LocationsModule from './components/LocationsModule'; 
import LoginScreen from './components/LoginScreen'; 
import SuperAdminModule from './components/SuperAdminModule'; 
import WhatsAppModule from './components/WhatsAppModule'; 

import { ViewState, CashMovement, Product, ServiceOrder, Client, CartItem, PaymentBreakdown, Supplier, Brand, Category, BankAccount, SaleRecord, PurchaseRecord, StockMovement, GeoLocation, Chat, SystemUser, AuthSession, Tenant, PaymentMethodType } from './types';
import { MOCK_CASH_MOVEMENTS, MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_SERVICES, TECH_PRODUCTS, TECH_CATEGORIES, PHARMA_PRODUCTS, PHARMA_CATEGORIES } from './constants';
import { Banknote, CreditCard, LayoutGrid, QrCode, FileText, Plus, Minus, Filter, Eye, Landmark, Wallet } from 'lucide-react';

// --- SMALL CASH MODULE COMPONENT ---
const CashModule: React.FC<{ movements: CashMovement[], onAddMovement: (m: CashMovement) => void }> = ({ movements, onAddMovement }) => {
  const [modalType, setModalType] = useState<'Ingreso' | 'Egreso' | null>(null);
  const [amount, setAmount] = useState('');
  const [filterMethod, setFilterMethod] = useState<'TODOS' | PaymentMethodType | 'DIGITAL'>('TODOS');
  
  const calculateBalance = (method: PaymentMethodType | 'DIGITAL' | 'TODOS') => {
      return movements.reduce((acc, m) => {
          const isTarget = method === 'TODOS' ? true : method === 'DIGITAL' ? m.paymentMethod !== 'Efectivo' : m.paymentMethod === method;
          if (isTarget) return m.type === 'Ingreso' ? acc + m.amount : acc - m.amount;
          return acc;
      }, 0);
  };
  const filteredMovements = movements.filter(m => filterMethod === 'TODOS' ? true : filterMethod === 'DIGITAL' ? m.paymentMethod !== 'Efectivo' : m.paymentMethod === filterMethod);

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"><div><p className="text-xs font-bold uppercase mb-1">Saldo Efectivo</p><p className="text-3xl font-bold">S/ {calculateBalance('Efectivo').toFixed(2)}</p></div></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"><div><p className="text-xs font-bold uppercase mb-1">Saldo Bancos</p><p className="text-3xl font-bold">S/ {calculateBalance('DIGITAL').toFixed(2)}</p></div></div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"><div><p className="text-xs font-bold uppercase mb-1">Total</p><p className="text-3xl font-bold text-primary-600">S/ {calculateBalance('TODOS').toFixed(2)}</p></div></div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between"><h3 className="font-bold">Movimientos</h3><div className="flex gap-2"><button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold">+ Ingreso</button><button className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold">- Egreso</button></div></div>
            <div className="flex-1 overflow-auto"><table className="w-full modern-table"><thead><tr><th>Hora</th><th>Tipo</th><th>Método</th><th>Concepto</th><th className="text-right">Monto</th></tr></thead><tbody>{filteredMovements.map(m => (<tr key={m.id}><td className="text-xs">{m.time}</td><td><span className={`px-2 py-1 rounded text-xs font-bold ${m.type === 'Ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{m.type}</span></td><td>{m.paymentMethod}</td><td>{m.concept}</td><td className="text-right font-bold">S/ {m.amount.toFixed(2)}</td></tr>))}</tbody></table></div>
        </div>
    </div>
  );
};

const INITIAL_USERS: SystemUser[] = [
    { id: '0', username: 'master', email: 'master@sapisoft.com', fullName: 'SapiSoft Master', password: '123', role: 'SUPER_ADMIN', active: true, permissions: [], industry: 'RETAIL', companyName: 'SapiSoft SaaS' },
    { id: '1', username: 'admin', email: 'admin@celulares.com', fullName: 'Juan Pérez', password: '123', role: 'ADMIN', active: true, permissions: [], industry: 'TECH', companyName: 'CELULARES EXPRESS' },
];
const INITIAL_TENANTS: Tenant[] = [
    { id: '1', companyName: 'CELULARES EXPRESS', industry: 'TECH', status: 'ACTIVE', subscriptionEnd: '20/12/2025', ownerName: 'Juan Pérez', phone: '999888777', planType: 'FULL' },
];

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS); 
  const [services, setServices] = useState<ServiceOrder[]>(MOCK_SERVICES);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(MOCK_CASH_MOVEMENTS);
  const [locations, setLocations] = useState<GeoLocation[]>(MOCK_LOCATIONS);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [chats, setChats] = useState<Chat[]>([]);
  const [waInitialContact, setWaInitialContact] = useState<{name: string, phone: string, message?: string} | undefined>(undefined);

  // Placeholders for data
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [purchasesHistory, setPurchasesHistory] = useState<PurchaseRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const toggleTheme = () => { setIsDarkMode(!isDarkMode); if(isDarkMode) document.documentElement.classList.remove('dark'); else document.documentElement.classList.add('dark'); };

  const handleLogin = (user: SystemUser) => {
      if (user.role === 'SUPER_ADMIN') { setSession({ user, businessName: 'PANEL MAESTRO', token: 'master' }); setCurrentView(ViewState.SUPER_ADMIN_DASHBOARD); } 
      else {
          if (user.industry === 'TECH') { setProducts(TECH_PRODUCTS); setCategories(TECH_CATEGORIES); } 
          else { setProducts(PHARMA_PRODUCTS); setCategories(PHARMA_CATEGORIES); }
          setSession({ user, businessName: user.companyName, token: 'token' }); setCurrentView(ViewState.DASHBOARD);
      }
  };

  const handleLogout = () => { setSession(null); setCurrentView(ViewState.DASHBOARD); };
  const handleOpenWhatsApp = (name: string, phone: string, message?: string) => { setWaInitialContact({ name, phone, message }); setCurrentView(ViewState.WHATSAPP); };

  if (!session) return (<><div className={isDarkMode ? "fixed inset-0 bg-slate-950 -z-50" : ""}/><LoginScreen onLogin={handleLogin} users={systemUsers} tenants={tenants} /></>);

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme} session={session} onLogout={handleLogout}>
        {currentView === ViewState.SUPER_ADMIN_DASHBOARD ? (
            <SuperAdminModule tenants={tenants} onAddTenant={(t, u) => { setTenants([...tenants, t]); setSystemUsers([...systemUsers, u]); }} onUpdateTenant={() => {}} />
        ) : (
            <>
                {currentView === ViewState.DASHBOARD && <Dashboard onNavigate={setCurrentView} session={session} />}
                {currentView === ViewState.POS && <SalesModule products={products} clients={clients} categories={categories} purchasesHistory={purchasesHistory} bankAccounts={bankAccounts} locations={locations} onAddClient={(c) => setClients([...clients, c])} onProcessSale={() => {}}/>}
                {currentView === ViewState.INVENTORY && <InventoryModule products={products} brands={brands} categories={categories} onUpdateProduct={() => {}} onAddProduct={(p) => setProducts([...products, p])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}/>}
                {currentView === ViewState.SERVICES && <ServicesModule services={services} products={products} categories={categories} bankAccounts={bankAccounts} clients={clients} onAddService={(s) => setServices([...services, s])} onFinalizeService={() => {}} onMarkRepaired={() => {}} onOpenWhatsApp={handleOpenWhatsApp} />}
                {currentView === ViewState.PURCHASES && <PurchaseModule products={products} suppliers={suppliers} categories={categories} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onProcessPurchase={() => {}}/>}
                {currentView === ViewState.CASH && <CashModule movements={cashMovements} onAddMovement={(m) => setCashMovements([...cashMovements, m])} />}
                {currentView === ViewState.CLIENTS && <ClientsModule clients={clients} onAddClient={(c) => setClients([...clients, c])} onOpenWhatsApp={handleOpenWhatsApp}/>}
                {currentView === ViewState.BUSINESS_EVOLUTION && <BusinessEvolutionModule products={products} clients={clients} movements={cashMovements}/>}
                {currentView === ViewState.MANAGE_RESOURCES && <ResourceManagement brands={brands} onAddBrand={(b) => setBrands([...brands, b])} onDeleteBrand={() => {}} categories={categories} onAddCategory={(c) => setCategories([...categories, c])} onDeleteCategory={() => {}} />}
                {currentView === ViewState.SUPPLIERS && <SuppliersModule suppliers={suppliers} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onDeleteSupplier={() => {}}/>}
                {currentView === ViewState.BANK_ACCOUNTS && <BankAccountsModule bankAccounts={bankAccounts} onAddBankAccount={(b) => setBankAccounts([...bankAccounts, b])} onDeleteBankAccount={() => {}}/>}
                {currentView === ViewState.HISTORY_QUERIES && <HistoryQueries salesHistory={salesHistory} purchasesHistory={purchasesHistory} stockMovements={stockMovements}/>}
                {currentView === ViewState.FINANCIAL_STRATEGY && <FinancialStrategyModule products={products} salesHistory={salesHistory} cashMovements={cashMovements} onAddCashMovement={() => {}} />}
                {currentView === ViewState.FIXED_EXPENSES && <FinanceManagerModule activeTab="EXPENSES" cashMovements={cashMovements} onAddCashMovement={(m) => setCashMovements([...cashMovements, m])} />}
                {currentView === ViewState.FIXED_INCOME && <FinanceManagerModule activeTab="INCOME" cashMovements={cashMovements} onAddCashMovement={(m) => setCashMovements([...cashMovements, m])} />}
                {currentView === ViewState.CONFIG_PRINTER && <PrintConfigModule />}
                {currentView === ViewState.USER_PRIVILEGES && <UserPrivilegesModule users={systemUsers} onAddUser={() => {}} onUpdateUser={() => {}} onDeleteUser={() => {}} />}
                {currentView === ViewState.CREDIT_NOTE && <CreditNoteModule salesHistory={salesHistory} onProcessCreditNote={() => {}} />}
                {currentView === ViewState.CLIENT_WALLET && <ClientWalletModule clients={clients} locations={locations} onUpdateClientBalance={() => {}} onAddClient={(c) => setClients([...clients, c])}/>}
                {currentView === ViewState.LOCATIONS && <LocationsModule locations={locations} onAddLocation={(l) => setLocations([...locations, l])} onDeleteLocation={(id) => setLocations(locations.filter(l => l.id !== id))} />}
                {currentView === ViewState.WHATSAPP && <WhatsAppModule products={products} clients={clients} chats={chats} setChats={setChats} initialContact={waInitialContact}/>}
            </>
        )}
    </Layout>
  );
};
export default App;
