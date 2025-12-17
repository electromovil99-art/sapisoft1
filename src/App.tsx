import React, { useState, useEffect, useRef } from 'react';
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
import CashModule from './components/CashModule';
import DatabaseModule from './components/DatabaseModule';
import QuotationModule from './components/QuotationModule';
import InventoryControlModule from './components/InventoryControlModule';
import InventoryReportModule from './components/InventoryReportModule';
import SalesReportModule from './components/SalesReportModule';
import ProfitReportModule from './components/ProfitReportModule';
import MediaEditorModule from './components/MediaEditorModule'; // Imported

import { 
    ViewState, CashMovement, Product, ServiceOrder, Client, CartItem, PaymentMethodType, 
    PaymentBreakdown, Supplier, Brand, Category, BankAccount, 
    SaleRecord, PurchaseRecord, StockMovement, GeoLocation, Chat, SystemUser, AuthSession, Tenant, Quotation,
    InventoryCountItem
} from './types';
import { 
    MOCK_CASH_MOVEMENTS, 
    MOCK_CLIENTS, 
    MOCK_LOCATIONS, 
    MOCK_SERVICES, 
    TECH_PRODUCTS, 
    TECH_CATEGORIES, 
    PHARMA_PRODUCTS, 
    PHARMA_CATEGORIES,
    FIXED_EXPENSE_CATEGORIES,
    FIXED_INCOME_CATEGORIES
} from './constants';

const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const INITIAL_TENANTS: Tenant[] = [
    { 
        id: '1', 
        companyName: 'CELULARES EXPRESS', 
        industry: 'TECH', 
        status: 'ACTIVE', 
        subscriptionEnd: getFutureDate(10), 
        ownerName: 'Juan Pérez', 
        phone: '999888777', 
        planType: 'FULL'
    },
    { 
        id: '2', 
        companyName: 'FARMACIA SALUD+', 
        industry: 'PHARMA', 
        status: 'ACTIVE', 
        subscriptionEnd: getFutureDate(15), 
        ownerName: 'Dueño Farmacia', 
        phone: '999666555', 
        planType: 'INTERMEDIO'
    }
];

const INITIAL_USERS: SystemUser[] = [
    { id: '0', username: 'master', email: 'master@sapisoft.com', fullName: 'SapiSoft Master', password: '123', role: 'SUPER_ADMIN', active: true, permissions: [], industry: 'RETAIL', companyName: 'SapiSoft SaaS' },
    { id: '1', username: 'admin', email: 'admin@celulares.com', fullName: 'Juan Pérez', password: '123', role: 'ADMIN', active: true, permissions: [], industry: 'TECH', companyName: 'CELULARES EXPRESS' },
    { id: '2', username: 'vendedor', email: 'juan@celulares.com', fullName: 'Juan Vendedor', password: '123', role: 'VENDEDOR', active: true, permissions: [], industry: 'TECH', companyName: 'CELULARES EXPRESS' },
    { id: '3', username: 'farma', email: 'farma@salud.com', fullName: 'Dueño Farmacia', password: '123', role: 'ADMIN', active: true, permissions: [], industry: 'PHARMA', companyName: 'FARMACIA SALUD+' },
    { id: '4', username: 'tec_farma', email: 'tec@salud.com', fullName: 'Técnico Farmacia', password: '123', role: 'VENDEDOR', active: true, permissions: [], industry: 'PHARMA', companyName: 'FARMACIA SALUD+' },
];

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null); // AUTH STATE
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_USERS); // User Management
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS); // Tenant Management

  // --- CUSTOMIZATION STATE ---
  const [loginHeroImage, setLoginHeroImage] = useState<string | undefined>(undefined);
  const [loginFeatureImage, setLoginFeatureImage] = useState<string | undefined>(undefined);

  // Persist State
  useEffect(() => {
      const storedUsers = localStorage.getItem('sapisoft_users');
      const storedTenants = localStorage.getItem('sapisoft_tenants');
      if (storedUsers) setSystemUsers(JSON.parse(storedUsers));
      if (storedTenants) setTenants(JSON.parse(storedTenants));
  }, []);

  useEffect(() => {
      localStorage.setItem('sapisoft_users', JSON.stringify(systemUsers));
      localStorage.setItem('sapisoft_tenants', JSON.stringify(tenants));
  }, [systemUsers, tenants]);


  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSyncEnabled, setIsSyncEnabled] = useState(false); // NEW: Sync Switch State

  // --- GLOBAL DATA STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS); 
  const [services, setServices] = useState<ServiceOrder[]>(MOCK_SERVICES);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>(MOCK_CASH_MOVEMENTS);
  const [locations, setLocations] = useState<GeoLocation[]>(MOCK_LOCATIONS);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [purchasesHistory, setPurchasesHistory] = useState<PurchaseRecord[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [waInitialContact, setWaInitialContact] = useState<{name: string, phone: string, message?: string} | undefined>(undefined);
  
  // --- POS & QUOTATION STATE ---
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posClient, setPosClient] = useState<Client | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  
  // --- INVENTORY CONTROL STATE ---
  const [inventoryCount, setInventoryCount] = useState<InventoryCountItem[]>([]);

  // --- FINANCE MANAGER STATE ---
  const [fixedExpenseCategories, setFixedExpenseCategories] = useState<string[]>(FIXED_EXPENSE_CATEGORIES);
  const [fixedIncomeCategories, setFixedIncomeCategories] = useState<string[]>(FIXED_INCOME_CATEGORIES);

  // Initialize default client for POS
  useEffect(() => {
    if (clients.length > 0 && !posClient) {
        setPosClient(clients[0]);
    }
  }, [clients, posClient]);
  
  // Auto-save quotation when navigating away from POS
  const prevViewRef = useRef<ViewState>(ViewState.DASHBOARD);
  useEffect(() => {
    const previousView = prevViewRef.current;
    if (previousView === ViewState.POS && currentView !== ViewState.POS && posCart.length > 0) {
        const newQuotation: Quotation = {
            id: Math.random().toString(36).substring(2, 8),
            date: new Date().toLocaleDateString('es-PE'),
            time: new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'}),
            clientName: posClient?.name || 'CLIENTE VARIOS',
            items: posCart,
            total: posCart.reduce((acc, item) => acc + item.total, 0)
        };
        setQuotations(prev => [newQuotation, ...prev]);
        alert(`Venta guardada automáticamente en Cotizaciones (${posCart.length} items).`);
        setPosCart([]); // Clear cart after auto-saving
    }
    prevViewRef.current = currentView;
  }, [currentView, posCart, posClient]);


  const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
      if(isDarkMode) document.documentElement.classList.remove('dark');
      else document.documentElement.classList.add('dark');
  };

  const toggleSyncMode = () => setIsSyncEnabled(prev => !prev);

  const handleLogin = (user: SystemUser) => {
      if (user.role === 'SUPER_ADMIN') {
          setSession({ user, businessName: 'PANEL MAESTRO', token: 'master-token' });
          setCurrentView(ViewState.SUPER_ADMIN_DASHBOARD);
      } else {
          if (user.industry === 'TECH') {
              setProducts(TECH_PRODUCTS);
              setCategories(TECH_CATEGORIES);
          } else if (user.industry === 'PHARMA') {
              setProducts(PHARMA_PRODUCTS);
              setCategories(PHARMA_CATEGORIES);
          } else {
              setProducts([]); 
              setCategories([]);
          }

          setSession({
              user,
              businessName: user.companyName, 
              token: 'mock-token-123'
          });
          setCurrentView(ViewState.DASHBOARD);
      }
  };

  const handleLogout = () => {
      setSession(null);
      setCurrentView(ViewState.DASHBOARD);
      setProducts([]); 
  };

  const handlePasswordReset = (userId: string, newPass: string) => {
      setSystemUsers(prevUsers => prevUsers.map(u => 
          u.id === userId ? { ...u, password: newPass } : u
      ));
  };

  // --- INVENTORY CONTROL HANDLERS ---
  const handleStartInventoryCount = () => {
      const countList = products.map(p => ({
          productId: p.id,
          productName: p.name,
          systemStock: p.stock,
          physicalCount: null,
          difference: 0
      }));
      setInventoryCount(countList);
  };
  
  const handleUpdateInventoryCount = (productId: string, count: number | null) => {
      setInventoryCount(prev => prev.map(item => {
          if (item.productId === productId) {
              const physical = count;
              const diff = physical !== null ? physical - item.systemStock : 0;
              return { ...item, physicalCount: physical, difference: diff };
          }
          return item;
      }));
  };

  const handleFinalizeInventoryCount = (adjustStock: boolean) => {
      if (adjustStock) {
          const newProducts = [...products];
          let adjustments = 0;
          inventoryCount.forEach(item => {
              if (item.physicalCount !== null && item.difference !== 0) {
                  const productIndex = newProducts.findIndex(p => p.id === item.productId);
                  if (productIndex !== -1) {
                      newProducts[productIndex].stock = item.physicalCount;
                      adjustments++;
                  }
              }
          });
          setProducts(newProducts);
          alert(`Inventario finalizado. Se ajustó el stock de ${adjustments} productos.`);
      } else {
          alert("Toma de inventario guardada en el reporte sin ajustar stock.");
      }
      setCurrentView(ViewState.INVENTORY_REPORT);
  };
  
  const handleUniversalTransfer = (fromId: string, toId: string, amount: number, exchangeRate: number, reference: string) => {
    const movements: CashMovement[] = [];
    const time = new Date().toLocaleTimeString();
    const user = session?.user.username || 'ADMIN';

    // Origen
    if(fromId === 'CASH_BOX') {
        const toAccount = bankAccounts.find(b => b.id === toId);
        movements.push({ id: Math.random().toString(), time, type: 'Egreso', paymentMethod: 'Efectivo', concept: `DEPOSITO A CTA ${toAccount?.alias || toAccount?.bankName} - ${reference}`, amount, user, category: 'Transferencia Interna', financialType: 'Variable' });
    } else {
        const fromAccount = bankAccounts.find(b => b.id === fromId);
        if(!fromAccount) return alert('Cuenta origen no existe');
        
        let concept = '';
        if(toId === 'CASH_BOX') {
            concept = `RETIRO EFECTIVO DE CTA ${fromAccount.alias || fromAccount.bankName} - ${reference}`;
        } else {
            const toAccount = bankAccounts.find(b => b.id === toId);
            concept = `TRANSF. A CTA ${toAccount?.alias || toAccount?.bankName} - ${reference}`;
        }
        movements.push({ id: Math.random().toString(), time, type: 'Egreso', paymentMethod: 'Deposito', concept, amount, user, category: 'Transferencia Bancaria', financialType: 'Variable', referenceId: fromId });
    }

    // Destino
    if(toId === 'CASH_BOX') {
        const fromAccount = bankAccounts.find(b => b.id === fromId);
        movements.push({ id: Math.random().toString(), time, type: 'Ingreso', paymentMethod: 'Efectivo', concept: `RETIRO DESDE CTA ${fromAccount?.alias || fromAccount?.bankName} - ${reference}`, amount, user, category: 'Transferencia Interna', financialType: 'Variable' });
    } else {
        const toAccount = bankAccounts.find(b => b.id === toId);
        const fromAccount = bankAccounts.find(b => b.id === fromId);
        if(!toAccount) return alert('Cuenta destino no existe');

        let toAmount = amount;
        if(fromId !== 'CASH_BOX' && fromAccount?.currency !== toAccount.currency) {
            toAmount = fromAccount?.currency === 'USD' ? amount * exchangeRate : amount / exchangeRate;
        }

        let concept = '';
        if(fromId === 'CASH_BOX') {
            concept = `DEPOSITO DESDE CAJA - ${reference}`;
        } else {
            concept = `TRANSF. DESDE CTA ${fromAccount?.alias || fromAccount?.bankName} - ${reference}`;
        }
        movements.push({ id: Math.random().toString(), time, type: 'Ingreso', paymentMethod: 'Deposito', concept, amount: toAmount, user, category: 'Transferencia Bancaria', financialType: 'Variable', referenceId: toId });
    }

    setCashMovements(prev => [...prev, ...movements]);
    alert('Transferencia realizada con éxito.');
};


  // --- Handlers ---
  const handleOpenWhatsApp = (name: string, phone: string, message?: string) => {
      setWaInitialContact({ name, phone, message });
      setCurrentView(ViewState.WHATSAPP);
  };
  
  const handleSyncDownload = (data: any) => {
      if(data.products) setProducts(data.products);
      if(data.clients) setClients(data.clients);
      if(data.sales) setSalesHistory(data.sales);
      if(data.movements) setCashMovements(data.movements);
      if(data.services) setServices(data.services);
      if(data.suppliers) setSuppliers(data.suppliers);
      if(data.brands) setBrands(data.brands);
      if(data.categories) setCategories(data.categories);
      if(data.bankAccounts) setBankAccounts(data.bankAccounts);
      alert("Datos sincronizados desde la nube correctamente.");
  };

  const handleLoadQuotation = (quotation: Quotation) => {
    if (posCart.length > 0) {
        if (!window.confirm('Tienes una venta en curso. ¿Deseas reemplazarla? La venta actual se guardará automáticamente.')) {
            return;
        }
        const currentQuotation: Quotation = {
            id: Math.random().toString(36).substring(2, 8),
            date: new Date().toLocaleDateString('es-PE'),
            time: new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'}),
            clientName: posClient?.name || 'CLIENTE VARIOS',
            items: posCart,
            total: posCart.reduce((acc, item) => acc + item.total, 0)
        };
        setQuotations(prev => [currentQuotation, ...prev.filter(q => q.id !== quotation.id)]);
    } else {
        setQuotations(prev => prev.filter(q => q.id !== quotation.id));
    }

    setPosCart(quotation.items);
    const clientToLoad = clients.find(c => c.name === quotation.clientName) || clients[0];
    setPosClient(clientToLoad);
    setCurrentView(ViewState.POS);
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotations(quotations.filter(q => q.id !== id));
  };

  const handleAddClient = (client: Client) => { setClients([...clients, client]); };
  const handleUpdateClientBalance = (clientId: string, amount: number, reason: string) => { setClients(clients.map(c => c.id === clientId ? { ...c, digitalBalance: c.digitalBalance + amount } : c)); if (amount !== 0) { setCashMovements([...cashMovements, { id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: amount > 0 ? 'Ingreso' : 'Egreso', paymentMethod: 'Efectivo', concept: `Billetera: ${reason}`, amount: Math.abs(amount), user: session?.user.username || 'ADMIN', category: 'Billetera Clientes', financialType: 'Variable' }]); } };
  const handleProcessSale = (cart: CartItem[], total: number, docType: string, clientName: string, paymentBreakdown: PaymentBreakdown, ticketId: string) => { const newSale: SaleRecord = { id: ticketId, date: new Date().toLocaleDateString('es-PE'), time: new Date().toLocaleTimeString('es-PE'), clientName: clientName, docType: docType, total: total, items: cart, paymentBreakdown: paymentBreakdown, user: session?.user.username || 'ADMIN' }; setSalesHistory([...salesHistory, newSale]); const newProducts = [...products]; const newStockMovements = [...stockMovements]; cart.forEach(item => { const productIndex = newProducts.findIndex(p => p.id === item.id); if (productIndex >= 0) { const prevStock = newProducts[productIndex].stock; newProducts[productIndex] = { ...newProducts[productIndex], stock: prevStock - item.quantity }; newStockMovements.push({ id: Math.random().toString(), date: new Date().toLocaleDateString('es-PE'), time: new Date().toLocaleTimeString('es-PE'), productId: item.id, productName: item.name, type: 'SALIDA', quantity: item.quantity, currentStock: prevStock - item.quantity, reference: `Venta #${ticketId}`, user: session?.user.username || 'ADMIN' }); } }); setProducts(newProducts); setStockMovements(newStockMovements); const incomeEntries: CashMovement[] = []; const createMovement = (method: PaymentMethodType, amount: number) => ({ id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: 'Ingreso' as const, paymentMethod: method, concept: `Venta ${docType} #${ticketId}`, amount: amount, user: session?.user.username || 'ADMIN', referenceId: ticketId, category: 'Venta', financialType: 'Variable' as const }); if (paymentBreakdown.cash > 0) incomeEntries.push(createMovement('Efectivo', paymentBreakdown.cash)); if (paymentBreakdown.yape > 0) incomeEntries.push(createMovement('Yape', paymentBreakdown.yape)); if (paymentBreakdown.card > 0) incomeEntries.push(createMovement('Tarjeta', paymentBreakdown.card)); if (paymentBreakdown.bank > 0) incomeEntries.push(createMovement('Deposito', paymentBreakdown.bank)); setCashMovements([...cashMovements, ...incomeEntries]); if (paymentBreakdown.wallet && paymentBreakdown.wallet > 0) { const client = clients.find(c => c.name === clientName); if (client) { setClients(clients.map(c => c.id === client.id ? { ...c, digitalBalance: c.digitalBalance - (paymentBreakdown.wallet || 0) } : c)); } } };
  const handleProcessPurchase = (cart: CartItem[], total: number, docType: string, supplierName: string, paymentCondition: 'Contado' | 'Credito', creditDays: number) => { const newPurchase: PurchaseRecord = { id: Math.random().toString().slice(2,8), date: new Date().toLocaleDateString('es-PE'), time: new Date().toLocaleTimeString('es-PE'), supplierName, docType, total, items: cart, paymentCondition, user: session?.user.username || 'ADMIN' }; setPurchasesHistory([...purchasesHistory, newPurchase]); const newProds = [...products]; cart.forEach(item => { const idx = newProds.findIndex(p => p.id === item.id); if(idx>=0) newProds[idx].stock += item.quantity; }); setProducts(newProds); if (paymentCondition === 'Contado') { setCashMovements([...cashMovements, { id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: 'Egreso', paymentMethod: 'Efectivo', concept: `Compra ${supplierName}`, amount: total, user: session?.user.username || 'ADMIN', category: 'Compra', financialType: 'Variable', referenceId: newPurchase.id }]); } };
  const handleFinalizeService = (serviceId: string, total: number, finalStatus: 'Entregado' | 'Devolucion', paymentBreakdown: PaymentBreakdown) => { const updatedServices = services.map(s => s.id === serviceId ? { ...s, status: finalStatus, exitDate: new Date().toLocaleDateString('es-PE'), exitTime: new Date().toLocaleTimeString('es-PE') } : s); setServices(updatedServices); const service = services.find(s => s.id === serviceId); if (service && service.usedProducts.length > 0) { const newProducts = [...products]; service.usedProducts.forEach(part => { const idx = newProducts.findIndex(p => p.id === part.productId); if (idx >= 0) newProducts[idx].stock -= part.quantity; }); setProducts(newProducts); } const incomeEntries: CashMovement[] = []; const addEntry = (method: PaymentMethodType, amount: number) => { if (amount > 0) incomeEntries.push({ id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: 'Ingreso', paymentMethod: method, concept: `Servicio ${finalStatus} #${serviceId}`, amount: amount, user: session?.user.username || 'ADMIN', referenceId: serviceId, category: 'Servicio Técnico', financialType: 'Variable' }); }; addEntry('Efectivo', paymentBreakdown.cash); addEntry('Yape', paymentBreakdown.yape); addEntry('Tarjeta', paymentBreakdown.card); addEntry('Deposito', paymentBreakdown.bank); setCashMovements([...cashMovements, ...incomeEntries]); if (paymentBreakdown.wallet && paymentBreakdown.wallet > 0) { const client = clients.find(c => c.name === service?.client); if (client) { setClients(clients.map(c => c.id === client.id ? { ...c, digitalBalance: c.digitalBalance - (paymentBreakdown.wallet || 0) } : c)); } } };
  const handleProcessCreditNote = (originalSaleId: string, itemsToReturn: { itemId: string, quantity: number }[], totalRefund: number, breakdown: PaymentBreakdown) => { const newProducts = [...products]; itemsToReturn.forEach(({ itemId, quantity }) => { const prodIndex = newProducts.findIndex(p => p.id === itemId); if (prodIndex >= 0) newProducts[prodIndex].stock += quantity; }); setProducts(newProducts); const expenses: CashMovement[] = []; const createExpense = (method: PaymentMethodType, amount: number) => ({ id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: 'Egreso' as const, paymentMethod: method, concept: `Devolución Ref: #${originalSaleId}`, amount: amount, user: session?.user.username || 'ADMIN', category: 'Devoluciones', financialType: 'Variable' as const, referenceId: originalSaleId }); if (breakdown.cash > 0) expenses.push(createExpense('Efectivo', breakdown.cash)); if (breakdown.yape > 0) expenses.push(createExpense('Yape', breakdown.yape)); if (breakdown.card > 0) expenses.push(createExpense('Tarjeta', breakdown.card)); if (breakdown.bank > 0) expenses.push(createExpense('Deposito', breakdown.bank)); setCashMovements([...cashMovements, ...expenses]); if (breakdown.wallet && breakdown.wallet > 0) { const originalSale = salesHistory.find(s => s.id === originalSaleId); if (originalSale) { const client = clients.find(c => c.name === originalSale.clientName); if (client) { setClients(clients.map(c => c.id === client.id ? { ...c, digitalBalance: c.digitalBalance + (breakdown.wallet || 0) } : c)); } } } alert("Nota de crédito procesada exitosamente."); };

  const handleAddUser = (user: SystemUser) => { 
      if (!session) return;
      const newUser = { 
          ...user, 
          companyName: session.businessName, 
          industry: session.user.industry 
      };
      setSystemUsers([...systemUsers, newUser]); 
  };
  
  const handleUpdateUser = (user: SystemUser) => { setSystemUsers(systemUsers.map(u => u.id === user.id ? user : u)); };
  const handleDeleteUser = (id: string) => { setSystemUsers(systemUsers.filter(u => u.id !== id)); };

  const handleCreateTenant = (newTenant: Tenant, adminUser: SystemUser) => {
      setTenants([...tenants, newTenant]);
      setSystemUsers([...systemUsers, adminUser]);
      alert(`Empresa "${newTenant.companyName}" creada con éxito.\nAdmin: ${adminUser.username} / Pass: ${adminUser.password}`);
  };

  const handleUpdateTenant = (id: string, updates: Partial<Tenant>, newPassword?: string) => {
      const updatedTenants = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
      setTenants(updatedTenants);
      
      const tenant = updatedTenants.find(t => t.id === id);
      if (tenant) {
          setSystemUsers(prevUsers => prevUsers.map(u => {
              if (u.companyName === tenant.companyName && u.role === 'ADMIN') {
                  return {
                      ...u,
                      fullName: updates.ownerName || u.fullName,
                      password: newPassword || u.password
                  };
              }
              return u;
          }));
      }
  };

  // --- NEW: HANDLE CLEAR SPECIFIC TENANT ---
  const handleDeleteTenant = (tenantId: string) => {
      const tenant = tenants.find(t => t.id === tenantId);
      if(!tenant) return;
      
      setTenants(prev => prev.filter(t => t.id !== tenantId));
      setSystemUsers(prev => prev.filter(u => u.companyName !== tenant.companyName));
      // Optionally clean related data if it existed in app state
  };

  const handleAddFixedCategory = (category: string, type: 'Ingreso' | 'Egreso') => {
    if (type === 'Ingreso') {
        if (!fixedIncomeCategories.includes(category)) {
            setFixedIncomeCategories(prev => [...prev, category]);
        }
    } else {
        if (!fixedExpenseCategories.includes(category)) {
            setFixedExpenseCategories(prev => [...prev, category]);
        }
    }
  };


  if (!session) {
      return (
          <LoginScreen 
              onLogin={handleLogin} 
              users={systemUsers} 
              tenants={tenants} 
              onResetPassword={handlePasswordReset}
              heroImage={loginHeroImage} // Passing custom images
              featureImage={loginFeatureImage}
          />
      );
  }

  return (
    <Layout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        session={session} 
        onLogout={handleLogout}
        isSyncEnabled={isSyncEnabled}
        toggleSyncMode={toggleSyncMode}
    >
        {currentView === ViewState.SUPER_ADMIN_DASHBOARD && (
            <SuperAdminModule 
                tenants={tenants} 
                onAddTenant={handleCreateTenant} 
                onUpdateTenant={handleUpdateTenant} 
                onDeleteTenant={handleDeleteTenant} // Passed here
            />
        )}

        {currentView !== ViewState.SUPER_ADMIN_DASHBOARD && (
            <>
                {currentView === ViewState.DASHBOARD && <Dashboard onNavigate={setCurrentView} session={session} cashMovements={cashMovements} clients={clients} services={services} />}
                {currentView === ViewState.POS && <SalesModule products={products} clients={clients} categories={categories} purchasesHistory={purchasesHistory} bankAccounts={bankAccounts} locations={locations} onAddClient={handleAddClient} onProcessSale={handleProcessSale} cart={posCart} setCart={setPosCart} client={posClient} setClient={setPosClient} quotations={quotations} onLoadQuotation={handleLoadQuotation} />}
                {currentView === ViewState.INVENTORY && <InventoryModule products={products} brands={brands} categories={categories} onUpdateProduct={(p) => setProducts(products.map(pr => pr.id === p.id ? p : pr))} onAddProduct={(p) => setProducts([...products, p])} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} onNavigate={setCurrentView}/>}
                {currentView === ViewState.INVENTORY_CONTROL && <InventoryControlModule onStart={handleStartInventoryCount} inventoryCount={inventoryCount} onUpdateCount={handleUpdateInventoryCount} onFinalize={handleFinalizeInventoryCount} />}
                {currentView === ViewState.INVENTORY_REPORT && <InventoryReportModule inventoryCountData={inventoryCount} onNavigate={setCurrentView} />}
                {currentView === ViewState.SALES_REPORT && <SalesReportModule salesHistory={salesHistory} />}
                {currentView === ViewState.PROFIT_REPORT && <ProfitReportModule salesHistory={salesHistory} cashMovements={cashMovements} products={products} />}
                {currentView === ViewState.SERVICES && <ServicesModule services={services} products={products} categories={categories} bankAccounts={bankAccounts} clients={clients} onAddService={(s) => setServices([...services, s])} onFinalizeService={handleFinalizeService} onMarkRepaired={(id) => setServices(services.map(s => s.id === id ? { ...s, status: 'Reparado' } : s))} onOpenWhatsApp={handleOpenWhatsApp} />}
                {currentView === ViewState.PURCHASES && <PurchaseModule products={products} suppliers={suppliers} categories={categories} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onProcessPurchase={handleProcessPurchase}/>}
                {currentView === ViewState.CASH && <CashModule movements={cashMovements} onAddMovement={(m) => setCashMovements([...cashMovements, m])} bankAccounts={bankAccounts} onUniversalTransfer={handleUniversalTransfer} fixedExpenseCategories={fixedExpenseCategories} fixedIncomeCategories={fixedIncomeCategories} onAddFixedCategory={handleAddFixedCategory} />}
                {currentView === ViewState.CLIENTS && <ClientsModule clients={clients} onAddClient={handleAddClient} onOpenWhatsApp={handleOpenWhatsApp}/>}
                {currentView === ViewState.QUOTATIONS && <QuotationModule quotations={quotations} onLoadQuotation={handleLoadQuotation} onDeleteQuotation={handleDeleteQuotation}/>}
                {currentView === ViewState.BUSINESS_EVOLUTION && <BusinessEvolutionModule products={products} clients={clients} movements={cashMovements}/>}
                {currentView === ViewState.MANAGE_RESOURCES && <ResourceManagement brands={brands} onAddBrand={(b) => setBrands([...brands, b])} onDeleteBrand={(id) => setBrands(brands.filter(b => b.id !== id))} categories={categories} onAddCategory={(c) => setCategories([...categories, c])} onDeleteCategory={(id) => setCategories(categories.filter(c => c.id !== id))} />}
                {currentView === ViewState.SUPPLIERS && <SuppliersModule suppliers={suppliers} onAddSupplier={(s) => setSuppliers([...suppliers, s])} onDeleteSupplier={(id) => setSuppliers(suppliers.filter(s => s.id !== id))}/>}
                {currentView === ViewState.BANK_ACCOUNTS && <BankAccountsModule bankAccounts={bankAccounts} onAddBankAccount={(b) => setBankAccounts([...bankAccounts, b])} onDeleteBankAccount={(id) => setBankAccounts(bankAccounts.filter(b => b.id !== id))} onUniversalTransfer={handleUniversalTransfer} />}
                {currentView === ViewState.HISTORY_QUERIES && <HistoryQueries initialTab="ventas" salesHistory={salesHistory} purchasesHistory={purchasesHistory} stockMovements={stockMovements}/>}
                {currentView === ViewState.PURCHASES_HISTORY && <HistoryQueries initialTab="compras" salesHistory={salesHistory} purchasesHistory={purchasesHistory} stockMovements={stockMovements}/>}
                {currentView === ViewState.KARDEX_HISTORY && <HistoryQueries initialTab="kardex" salesHistory={salesHistory} purchasesHistory={purchasesHistory} stockMovements={stockMovements}/>}
                {currentView === ViewState.FINANCIAL_STRATEGY && <FinancialStrategyModule products={products} salesHistory={salesHistory} cashMovements={cashMovements} onAddCashMovement={(m) => setCashMovements([...cashMovements, m])} />}
                {currentView === ViewState.FIXED_EXPENSES && <FinanceManagerModule activeTab="EXPENSES" cashMovements={cashMovements} onAddCashMovement={(m) => setCashMovements([...cashMovements, m])} fixedCategories={fixedExpenseCategories} onAddFixedCategory={(cat) => handleAddFixedCategory(cat, 'Egreso')} />}
                {currentView === ViewState.FIXED_INCOME && <FinanceManagerModule activeTab="INCOME" cashMovements={cashMovements} onAddCashMovement={(m) => setCashMovements([...cashMovements, m])} fixedCategories={fixedIncomeCategories} onAddFixedCategory={(cat) => handleAddFixedCategory(cat, 'Ingreso')} />}
                {currentView === ViewState.CONFIG_PRINTER && <PrintConfigModule />}
                {currentView === ViewState.USER_PRIVILEGES && <UserPrivilegesModule users={systemUsers.filter(u => u.companyName === session.businessName)} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
                {currentView === ViewState.CREDIT_NOTE && <CreditNoteModule salesHistory={salesHistory} onProcessCreditNote={handleProcessCreditNote} />}
                {currentView === ViewState.CLIENT_WALLET && <ClientWalletModule clients={clients} locations={locations} onUpdateClientBalance={handleUpdateClientBalance} onAddClient={handleAddClient}/>}
                {currentView === ViewState.LOCATIONS && <LocationsModule locations={locations} onAddLocation={(l) => setLocations([...locations, l])} onDeleteLocation={(id) => setLocations(locations.filter(l => l.id !== id))} />}
                {currentView === ViewState.WHATSAPP && <WhatsAppModule products={products} clients={clients} chats={chats} setChats={setChats} initialContact={waInitialContact}/>}
                {currentView === ViewState.DATABASE_CONFIG && <DatabaseModule 
                    isSyncEnabled={isSyncEnabled}
                    data={{products, clients, movements: cashMovements, sales: salesHistory, services, suppliers, brands, categories, bankAccounts}} 
                    onSyncDownload={handleSyncDownload}
                />}
                {/* NEW MODULE INTEGRATION */}
                {currentView === ViewState.MEDIA_EDITOR && <MediaEditorModule 
                    onUpdateHeroImage={(url) => { setLoginHeroImage(url); alert('Portada de Login actualizada!'); }}
                    onUpdateFeatureImage={(url) => { setLoginFeatureImage(url); alert('Imagen Secundaria actualizada!'); }}
                />}
            </>
        )}
    </Layout>
  );
};

export default App;