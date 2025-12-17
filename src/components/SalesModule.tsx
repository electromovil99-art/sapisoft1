
import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, CreditCard, Banknote, UserPlus, FileText, Printer, Plus, Minus, X, Check, ShoppingCart, User, Smartphone, Receipt, QrCode, Landmark, CheckCircle, Edit3, Lock, ShieldAlert, MapPin, Filter, History, AlertTriangle, ArrowRight, Wallet, RotateCcw, ClipboardList, Upload, DollarSign } from 'lucide-react';
import { Product, CartItem, Client, PaymentBreakdown, Category, PurchaseRecord, BankAccount, PaymentMethodType, GeoLocation, Quotation } from '../types';

interface SalesModuleProps {
    products: Product[];
    clients: Client[];
    categories: Category[]; 
    purchasesHistory: PurchaseRecord[];
    bankAccounts: BankAccount[]; 
    locations: GeoLocation[];
    onAddClient: (client: Client) => void;
    onProcessSale: (cart: CartItem[], total: number, docType: string, clientName: string, paymentBreakdown: PaymentBreakdown, ticketId: string) => void;
    
    // Lifted State
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    client: Client | null;
    setClient: (client: Client | null) => void;

    // Quotation props
    quotations: Quotation[];
    onLoadQuotation: (quotation: Quotation) => void;
}

// Internal interface for the payment list
interface PaymentDetail {
    id: string;
    method: PaymentMethodType;
    amount: number;
    reference?: string;
    accountId?: string;
    bankName?: string; 
}

const SalesModule: React.FC<SalesModuleProps> = ({ products, clients, categories, purchasesHistory, bankAccounts, locations, onAddClient, onProcessSale, cart, setCart, client, setClient, quotations, onLoadQuotation }) => {
  // Estado Principal
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 

  // Datos de Venta
  const [clientSearchTerm, setClientSearchTerm] = useState(''); 
  const [docType, setDocType] = useState('TICKET DE VENTA');
  
  // Modales
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  
  // --- PAYMENT LOGIC ---
  const [paymentList, setPaymentList] = useState<PaymentDetail[]>([]);
  const [currentPayment, setCurrentPayment] = useState<{
      method: PaymentMethodType;
      amount: string;
      reference: string;
      accountId: string;
  }>({ method: 'Efectivo', amount: '', reference: '', accountId: '' });

  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ 
      name: '', dni: '', phone: '', address: '', email: '',
      department: '', province: '', district: '' 
  });

  // Derived locations for Client Modal
  const departments = locations.filter(l => l.type === 'DEP');
  const provinces = locations.filter(l => l.type === 'PROV' && l.parentId === (departments.find(d => d.name === newClientData.department)?.id));
  const districts = locations.filter(l => l.type === 'DIST' && l.parentId === (locations.find(p => p.type === 'PROV' && p.name === newClientData.province && p.parentId === (departments.find(d => d.name === newClientData.department)?.id))?.id));

  // Ticket State
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  // --- PRICE EDITING STATES ---
  const [priceEditItem, setPriceEditItem] = useState<CartItem | null>(null); 
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [authPassword, setAuthPassword] = useState(''); 
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [newPriceInput, setNewPriceInput] = useState('');

  // --- COST HISTORY STATES ---
  const [showCostModal, setShowCostModal] = useState(false);
  const [costHistoryItem, setCostHistoryItem] = useState<{product: CartItem, history: any[], avgCost: number, lastCost: number} | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const paymentAmountRef = useRef<HTMLInputElement>(null);
  
  // Sync local search term with client from parent state
  useEffect(() => {
    if (client) {
        setClientSearchTerm(client.name);
    }
  }, [client]);

  // Handle Client Search Selection
  const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setClientSearchTerm(val);
      const found = clients.find(c => c.name.toUpperCase() === val.toUpperCase());
      if (found) {
          setClient(found);
      }
  };

  // --- Lógica ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.includes(searchTerm);
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    
    return (searchTerm.length > 0 || selectedCategory !== '') && matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (product.stock <= 0) {
        alert("Sin stock disponible");
        return;
    }
    if (existing && existing.quantity >= product.stock) {
        alert("No hay más stock disponible");
        return;
    }

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, discount: 0, total: product.price }]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        if(!product) return item;

        const newQ = Math.max(1, item.quantity + delta);
        if (newQ > product.stock) {
            alert("Excede el stock disponible");
            return item;
        }
        return { ...item, quantity: newQ, total: newQ * item.price };
      }
      return item;
    }));
  };

  // --- COST HISTORY LOGIC ---
  const handleShowHistory = (item: CartItem) => {
      const history: any[] = [];
      purchasesHistory.forEach(purchase => {
          const purchasedItem = purchase.items.find(pi => pi.id === item.id);
          if (purchasedItem) {
              history.push({
                  date: purchase.date,
                  supplier: purchase.supplierName,
                  quantity: purchasedItem.quantity,
                  cost: purchasedItem.price
              });
          }
      });
      if (history.length === 0) {
          history.push({ date: '01/12/2025', supplier: 'PROVEEDOR LIMA', quantity: 10, cost: item.price * 0.7 });
      }

      const totalCost = history.reduce((sum, h) => sum + h.cost, 0);
      const avgCost = history.length > 0 ? totalCost / history.length : 0;
      const lastCost = history.length > 0 ? history[0].cost : 0;
      
      setCostHistoryItem({
          product: item,
          history: history.reverse(),
          avgCost,
          lastCost
      });
      setShowCostModal(true);
  };

  // --- PRICE EDIT LOGIC ---
  const handleInitiatePriceEdit = (item: CartItem) => {
      setPriceEditItem(item);
      setAuthPassword('');
      setIsAuthorized(false);
      setNewPriceInput(item.price.toString());
      setShowAuthModal(true);
  };
  const handleVerifyPassword = () => {
      if (authPassword === '1234') {
          setIsAuthorized(true);
      } else { 
          alert("Contraseña incorrecta. Intente de nuevo."); 
          setAuthPassword(''); 
      }
  };
  const handleUpdatePrice = () => {
      if (!priceEditItem) return;
      const newPrice = parseFloat(newPriceInput);
      if (isNaN(newPrice) || newPrice < 0) { alert("Precio inválido"); return; }
      setCart(cart.map(item => item.id === priceEditItem.id ? { ...item, price: newPrice, total: item.quantity * newPrice } : item));
      setShowAuthModal(false);
      setPriceEditItem(null);
  };

  const handleRestoreOriginalPrice = () => {
      if (!priceEditItem) return;
      const originalProduct = products.find(p => p.id === priceEditItem.id);
      if (originalProduct) {
          setNewPriceInput(originalProduct.price.toString());
      }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + item.total, 0);
  const total = calculateTotal();

  // --- NEW PAYMENT HANDLERS ---
  const getPaymentTotal = () => paymentList.reduce((acc, p) => acc + p.amount, 0);
  const remainingTotal = Math.max(0, total - getPaymentTotal());

  const openPaymentModal = () => {
      setPaymentList([]);
      setCurrentPayment({ method: 'Efectivo', amount: total.toFixed(2), reference: '', accountId: '' });
      setShowPaymentModal(true);
      setTimeout(() => paymentAmountRef.current?.focus(), 100);
  };

  const handleAddPayment = () => {
      const amountVal = parseFloat(currentPayment.amount);
      if (isNaN(amountVal) || amountVal <= 0) return alert("Ingrese un monto válido");

      if (currentPayment.method !== 'Efectivo' && currentPayment.method !== 'Saldo Favor') {
          if (!currentPayment.accountId) return alert("Debe seleccionar una cuenta bancaria destino");
          if (!currentPayment.reference) return alert("Debe ingresar el número de operación/referencia");
      }

      // Check Wallet Balance Logic
      if (currentPayment.method === 'Saldo Favor') {
          const walletBalance = client?.digitalBalance || 0;
          const alreadyUsedWallet = paymentList.filter(p => p.method === 'Saldo Favor').reduce((acc,p) => acc + p.amount, 0);
          if (amountVal > (walletBalance - alreadyUsedWallet)) {
              alert(`Saldo insuficiente. El cliente solo tiene S/ ${(walletBalance - alreadyUsedWallet).toFixed(2)} disponibles.`);
              return;
          }
      }

      const bankInfo = bankAccounts.find(b => b.id === currentPayment.accountId);

      const newPay: PaymentDetail = {
          id: Math.random().toString(),
          method: currentPayment.method,
          amount: amountVal,
          reference: currentPayment.reference,
          accountId: currentPayment.accountId,
          bankName: bankInfo ? `${bankInfo.bankName} - ${bankInfo.currency}` : undefined
      };

      const newList = [...paymentList, newPay];
      setPaymentList(newList);

      // Auto-calculate next remaining
      const currentTotalPaid = newList.reduce((acc, p) => acc + p.amount, 0);
      const nextRemaining = Math.max(0, total - currentTotalPaid);
      
      setCurrentPayment({ 
          method: 'Efectivo', 
          amount: nextRemaining > 0 ? nextRemaining.toFixed(2) : '', 
          reference: '', 
          accountId: '' 
      });
      paymentAmountRef.current?.focus();
  };

  const handleRemovePayment = (id: string) => {
      setPaymentList(paymentList.filter(p => p.id !== id));
  };

  const handleOpenClientModal = () => {
      // Set Default Location to CUSCO
      setNewClientData({ 
          name: '', dni: '', phone: '', address: '', email: '',
          department: 'CUSCO', province: 'CUSCO', district: '' 
      });
      setShowClientModal(true);
  };

  const handleSaveNewClient = () => {
      if (!newClientData.name || !newClientData.dni) { alert("Nombre y DNI son obligatorios."); return; }
      const newClient: Client = {
          id: Math.random().toString(),
          name: newClientData.name.toUpperCase(),
          dni: newClientData.dni,
          phone: newClientData.phone,
          address: newClientData.address,
          email: newClientData.email,
          department: newClientData.department,
          province: newClientData.province,
          district: newClientData.district,
          creditLine: 0, creditUsed: 0, totalPurchases: 0, paymentScore: 3, tags: ['Nuevo'],
          digitalBalance: 0 // Init
      };
      onAddClient(newClient);
      setClient(newClient);
      setClientSearchTerm(newClient.name); // Update search input
      setShowClientModal(false);
  };

  const handleFinalizeSale = () => {
      const totalPaid = getPaymentTotal();
      if (totalPaid < total - 0.1) {
          alert("El monto pagado es menor al total de la venta.");
          return;
      }

      const breakdown: PaymentBreakdown = {
          cash: paymentList.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + p.amount, 0),
          yape: paymentList.filter(p => p.method === 'Yape' || p.method === 'Plin').reduce((acc, p) => acc + p.amount, 0),
          card: paymentList.filter(p => p.method === 'Tarjeta').reduce((acc, p) => acc + p.amount, 0),
          bank: paymentList.filter(p => p.method === 'Deposito').reduce((acc, p) => acc + p.amount, 0),
          wallet: paymentList.filter(p => p.method === 'Saldo Favor').reduce((acc, p) => acc + p.amount, 0)
      };

      const ticketId = Math.floor(Math.random() * 100000).toString();

      onProcessSale(cart, total, docType, client?.name || 'Cliente Varios', breakdown, ticketId);

      setTicketData({
          orderId: ticketId,
          date: new Date().toLocaleDateString('es-PE'),
          time: new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'}),
          client: client?.name,
          typeLabel: docType,
          items: cart.map(item => ({ desc: item.name, price: item.total })),
          total: total,
          detailedPayments: paymentList, 
          change: totalPaid - total
      });

      setShowPaymentModal(false);
      setShowTicket(true);
  };

  return (
    <div className="flex h-full gap-6">
      
      {/* LEFT: Product & Cart Section */}
      <div className="flex-1 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header / Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4 bg-slate-50/50 dark:bg-slate-700/30">
           <div className="flex-1 flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                 <input 
                   ref={searchInputRef}
                   autoFocus
                   type="text" 
                   className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-lg text-slate-900 dark:text-white placeholder-slate-400"
                   placeholder="Buscar producto..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               {/* Category Filter */}
               <div className="relative w-48 shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <select 
                        className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer font-medium text-slate-700 dark:text-white"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
               </div>
           </div>

           <button 
                onClick={() => setShowRecoverModal(true)}
                className="relative shrink-0 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-colors text-slate-500 dark:text-slate-300"
                title="Recuperar Venta Guardada"
            >
                <ClipboardList size={20} />
                {quotations.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-slate-700/30">
                        {quotations.length}
                    </span>
                )}
            </button>
           
           {/* Dropdown Results */}
           {filteredProducts.length > 0 && (
              <div className="absolute top-[80px] left-6 right-[350px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                 {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-primary-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 flex justify-between items-center group">
                       <div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary-700 dark:group-hover:text-primary-400">{p.name}</div>
                          <div className="text-xs text-slate-400 flex gap-2">
                              <span>SKU: {p.code}</span>
                              <span className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500 dark:text-slate-400">{p.category}</span>
                              <span>Stock: {p.stock}</span>
                          </div>
                       </div>
                       <div className="font-bold text-slate-800 dark:text-white">S/ {p.price.toFixed(2)}</div>
                    </div>
                 ))}
              </div>
           )}
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-auto p-2">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                <ShoppingCart size={64} strokeWidth={1}/>
                <p className="mt-4 font-medium">El carrito está vacío</p>
             </div>
           ) : (
             <table className="w-full modern-table">
                <thead>
                   <tr>
                     <th className="rounded-l-lg">Producto</th>
                     <th className="text-center">Cant.</th>
                     <th className="text-right">Precio</th>
                     <th className="text-right">Total</th>
                     <th className="rounded-r-lg text-center w-24">Acciones</th>
                   </tr>
                </thead>
                <tbody>
                   {cart.map(item => (
                      <tr key={item.id}>
                         <td>
                            <div className="font-semibold text-slate-700 dark:text-white">{item.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{item.code}</div>
                         </td>
                         <td className="text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Minus size={14}/></button>
                               <span className="w-8 text-center font-bold text-slate-700 dark:text-slate-200">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Plus size={14}/></button>
                            </div>
                         </td>
                         <td className="text-right text-slate-600 dark:text-slate-300 group relative">
                            <div className="flex items-center justify-end gap-2">
                                <span>S/ {item.price.toFixed(2)}</span>
                                <button 
                                    onClick={() => handleInitiatePriceEdit(item)}
                                    className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-opacity"
                                    title="Editar Precio (Requiere Clave)"
                                >
                                    <Edit3 size={14}/>
                                </button>
                            </div>
                         </td>
                         <td className="text-right font-bold text-slate-800 dark:text-white">S/ {item.total.toFixed(2)}</td>
                         <td className="text-center">
                            <div className="flex justify-center gap-1">
                                <button 
                                    onClick={() => handleShowHistory(item)} 
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Ver Historial de Costos"
                                >
                                   <History size={18}/>
                                </button>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                                   <Trash2 size={18}/>
                                </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>

        {/* Totals Section */}
        <div className="bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 p-6 rounded-b-xl">
           <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">S/ {(total / 1.18).toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">IGV (18%)</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">S/ {(total - (total / 1.18)).toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><DollarSign size={20}/>Total a Pagar</span>
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">S/ {total.toFixed(2)}</span>
           </div>
        </div>
      </div>
      
      {/* RIGHT: Controls & Checkout */}
      <div className="w-80 flex flex-col gap-4 shrink-0">
         {/* Client Selector */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block flex items-center gap-1.5"><User size={14}/>Cliente</label>
            <div className="flex gap-2 mb-3">
               <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <User size={20}/>
               </div>
               <div className="min-w-0 flex-1 relative">
                  <input 
                    list="client-suggestions"
                    className="w-full bg-transparent font-bold text-slate-700 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 focus:border-primary-500 text-sm py-1"
                    value={clientSearchTerm}
                    onChange={handleClientSearchChange}
                    placeholder="Escriba para buscar..."
                  />
                  <datalist id="client-suggestions">
                     {clients.map(c => <option key={c.id} value={c.name}>{c.dni ? `DNI: ${c.dni}` : ''}</option>)}
                  </datalist>
                  <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{client?.dni || '---'}</span>
                      {client && client.digitalBalance > 0 && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Wallet size={10}/> S/ {client.digitalBalance.toFixed(2)}
                          </span>
                      )}
                  </div>
               </div>
            </div>
            <button onClick={handleOpenClientModal} className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 text-sm hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
               <UserPlus size={16}/> Nuevo Cliente
            </button>
         </div>

         {/* Document Selector */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
             <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1.5"><FileText size={14}/>Documento</label>
             <div className="relative">
                 <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                 <select 
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-primary-500 appearance-none cursor-pointer"
                 >
                     <option value="TICKET DE VENTA">TICKET DE VENTA</option>
                     <option value="BOLETA DE VENTA">BOLETA DE VENTA</option>
                     <option value="FACTURA ELECTRONICA">FACTURA ELECTRONICA</option>
                     <option value="NOTA DE VENTA">NOTA DE VENTA</option>
                 </select>
             </div>
         </div>

         <div className="flex-1"></div>

         <button 
           disabled={cart.length === 0}
           onClick={openPaymentModal}
           className="bg-primary-600 text-white p-4 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
         >
            <div className="text-left">
               <div className="text-xs opacity-80 font-medium mb-1">PROCESAR VENTA</div>
               <div className="text-xl font-bold">S/ {total.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
               <Banknote size={24}/>
            </div>
         </button>
      </div>

      {/* --- RECOVER QUOTATION MODAL --- */}
      {showRecoverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <ClipboardList size={20} className="text-blue-500"/> Recuperar Venta Guardada
                    </h3>
                    <button onClick={() => setShowRecoverModal(false)}><X className="text-slate-400 hover:text-red-500"/></button>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {quotations.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No hay ventas guardadas.</p>
                    ) : (
                        quotations.map(q => (
                            <div key={q.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-700 dark:text-white">#{q.id.substring(0, 6)} - {q.clientName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{q.date} {q.time} - {q.items.length} items</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">S/ {q.total.toFixed(2)}</span>
                                    <button 
                                        onClick={() => {
                                            onLoadQuotation(q);
                                            setShowRecoverModal(false);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 hover:bg-blue-700"
                                    >
                                        <Upload size={14}/> Cargar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[850px] overflow-hidden flex flex-col max-h-[95vh] border border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95">
              <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                     <Banknote size={20} className="text-primary-600 dark:text-primary-400"/> 
                     Confirmar Pago <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{docType}</span>
                 </h3>
                 <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
              <div className="p-6 flex gap-8 bg-slate-50/50 dark:bg-slate-900/50 flex-1 overflow-y-auto">
                   <div className="flex-1 flex flex-col">
                       <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><Receipt size={14}/> Desglose de Pagos</h4>
                       <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
                           {paymentList.length === 0 ? (
                               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-70"><CreditCard size={32} className="mb-2"/><p className="text-sm">No hay pagos registrados</p></div>
                           ) : (
                               <div className="overflow-y-auto max-h-[300px]">
                                   <table className="w-full text-left text-sm">
                                       <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase font-bold sticky top-0"><tr><th className="px-4 py-3">Método</th><th className="px-4 py-3">Ref / Cuenta</th><th className="px-4 py-3 text-right">Monto</th><th className="px-4 py-3 w-10"></th></tr></thead>
                                       <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                                           {paymentList.map((p) => (
                                               <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                   <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                       {p.method === 'Saldo Favor' ? <Wallet size={14} className="text-blue-500"/> : null} {p.method}
                                                   </td>
                                                   <td className="px-4 py-3 text-xs">{p.method === 'Efectivo' ? '-' : <div className="flex flex-col"><span className="font-mono">{p.reference}</span><span className="text-[10px] text-slate-400">{p.bankName}</span></div>}</td>
                                                   <td className="px-4 py-3 text-right font-bold">S/ {p.amount.toFixed(2)}</td>
                                                   <td className="px-4 py-3 text-center"><button onClick={() => handleRemovePayment(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></td>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           )}
                           <div className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 p-4 space-y-2 mt-auto">
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total Venta:</span><span className="font-bold text-slate-800 dark:text-white text-lg">S/ {total.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total Pagado:</span><span className={`font-bold ${getPaymentTotal() >= total ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>S/ {getPaymentTotal().toFixed(2)}</span></div>
                                <div className="h-px bg-slate-200 dark:bg-slate-600 my-1"></div>
                                <div className="flex justify-between items-center"><span className={`text-sm font-bold ${getPaymentTotal() < total ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{getPaymentTotal() < total ? 'Falta por Pagar:' : 'Vuelto / Cambio:'}</span><span className={`text-xl font-bold ${getPaymentTotal() < total ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>S/ {Math.abs(getPaymentTotal() - total).toFixed(2)}</span></div>
                           </div>
                       </div>
                   </div>
                   <div className="w-80 flex flex-col">
                       <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><Plus size={14}/> Agregar Pago</h4>
                       <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
                           <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Método de Pago</label><div className="grid grid-cols-2 gap-2">
                               <button onClick={() => setCurrentPayment({...currentPayment, method: 'Efectivo', reference: '', accountId: ''})} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${currentPayment.method === 'Efectivo' ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Efectivo</button>
                               <button onClick={() => setCurrentPayment({...currentPayment, method: 'Yape', reference: '', accountId: ''})} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${currentPayment.method === 'Yape' ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Yape/Plin</button>
                               <button onClick={() => setCurrentPayment({...currentPayment, method: 'Tarjeta', reference: '', accountId: ''})} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${currentPayment.method === 'Tarjeta' ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Tarjeta</button>
                               <button onClick={() => setCurrentPayment({...currentPayment, method: 'Saldo Favor', reference: '', accountId: ''})} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${currentPayment.method === 'Saldo Favor' ? 'bg-emerald-600 text-white border-emerald-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}><Wallet size={12}/> Saldo Favor</button>
                           </div></div>
                           
                           {currentPayment.method === 'Saldo Favor' && (
                               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                                   <div className="font-bold flex justify-between"><span>Saldo Disponible:</span> <span>S/ {client?.digitalBalance.toFixed(2)}</span></div>
                                   {remainingTotal > (client?.digitalBalance || 0) && <div className="text-red-500 mt-1 font-bold">Saldo insuficiente para cubrir total.</div>}
                               </div>
                           )}

                           {currentPayment.method !== 'Efectivo' && currentPayment.method !== 'Saldo Favor' && (<div className="space-y-3 animate-in fade-in slide-in-from-top-2"><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Cuenta Destino</label><select className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-primary-500 transition-colors text-slate-700 dark:text-white" value={currentPayment.accountId} onChange={e => setCurrentPayment({...currentPayment, accountId: e.target.value})}><option value="">-- Seleccionar Cuenta --</option>{bankAccounts.map(bank => (<option key={bank.id} value={bank.id}>{bank.bankName} - {bank.currency} ({bank.alias || bank.accountNumber})</option>))}</select></div><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Nro. Operación / Ref</label><input type="text" className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-primary-500 uppercase text-slate-700 dark:text-white" placeholder="Ej. 123456" value={currentPayment.reference} onChange={e => setCurrentPayment({...currentPayment, reference: e.target.value})}/></div></div>)}
                           <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex justify-between"><span>Monto a Cobrar</span><span className="text-[10px] text-primary-600 dark:text-primary-400 cursor-pointer hover:underline" onClick={() => setCurrentPayment({...currentPayment, amount: remainingTotal.toFixed(2)})}>Restante: {remainingTotal.toFixed(2)}</span></label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span><input ref={paymentAmountRef} type="number" className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 dark:focus:ring-primary-900/20 transition-all placeholder-slate-300" placeholder="0.00" value={currentPayment.amount} onChange={e => setCurrentPayment({...currentPayment, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddPayment()}/></div></div>
                           <button onClick={handleAddPayment} className="w-full py-3 bg-slate-800 dark:bg-primary-600 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"><ArrowRight size={18}/> Agregar Pago</button>
                       </div>
                   </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3"><button onClick={() => setShowPaymentModal(false)} className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Cancelar</button><button onClick={handleFinalizeSale} disabled={getPaymentTotal() < total - 0.1} className="px-8 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><CheckCircle size={18}/> Confirmar Venta</button></div>
           </div>
        </div>
      )}
      
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[350px] animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Lock size={20} className="text-slate-400"/> Autorización Requerida</h3>
                {!isAuthorized ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ingrese la clave de administrador para modificar el precio.</p>
                        <input 
                            type="password" 
                            autoFocus
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg text-center text-lg tracking-widest bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="****"
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleVerifyPassword()}
                        />
                        <button onClick={handleVerifyPassword} className="w-full py-2 bg-slate-800 dark:bg-slate-600 text-white rounded-lg font-bold">Verificar</button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span>Producto:</span>
                            <span className="font-bold text-slate-700 dark:text-white">{priceEditItem?.code}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg text-xs flex justify-between items-center text-slate-500 dark:text-slate-300">
                            <span>Precio Lista: <strong className="text-slate-700 dark:text-white">S/ {products.find(p => p.id === priceEditItem?.id)?.price.toFixed(2)}</strong></span>
                            <span>Actual: <strong className="text-blue-600 dark:text-blue-400">S/ {priceEditItem?.price.toFixed(2)}</strong></span>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nuevo Precio</label>
                            <input 
                                type="number" 
                                autoFocus
                                className="w-full p-3 border border-emerald-500 rounded-lg text-center text-2xl font-bold bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 outline-none"
                                value={newPriceInput}
                                onChange={e => setNewPriceInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleUpdatePrice()}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button onClick={handleRestoreOriginalPrice} className="p-2 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700" title="Restaurar Precio Original">
                                <RotateCcw size={20}/>
                            </button>
                            <button onClick={handleUpdatePrice} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">Actualizar Precio</button>
                        </div>
                    </div>
                )}
                <button onClick={() => {setShowAuthModal(false); setPriceEditItem(null);}} className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm">Cancelar</button>
            </div>
        </div>
      )}

      {showCostModal && costHistoryItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-[500px] overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[80vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Historial de Costos</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{costHistoryItem.product.name}</p>
                    </div>
                    <button onClick={() => setShowCostModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/></button>
                </div>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4 bg-white dark:bg-slate-800">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Costo Promedio</span>
                        <div className="text-xl font-bold text-blue-800 dark:text-blue-200">S/ {costHistoryItem.avgCost.toFixed(2)}</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Último Costo</span>
                        <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">S/ {costHistoryItem.lastCost.toFixed(2)}</div>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-white dark:bg-slate-800">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="pb-2">Fecha</th>
                                <th className="pb-2">Proveedor</th>
                                <th className="pb-2 text-right">Cant.</th>
                                <th className="pb-2 text-right">Costo Unit.</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 dark:text-slate-300">
                            {costHistoryItem.history.map((h, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-700 last:border-0">
                                    <td className="py-2 text-xs">{h.date}</td>
                                    <td className="py-2 font-medium">{h.supplier}</td>
                                    <td className="py-2 text-right">{h.quantity}</td>
                                    <td className="py-2 text-right font-bold">S/ {h.cost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[700px] animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col max-h-[95vh]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><UserPlus size={20} className="text-primary-600"/> Nuevo Cliente</h3>
                  <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Nombre Completo / Razón Social</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none uppercase"
                        placeholder="Ej. JUAN PEREZ"
                        value={newClientData.name}
                        onChange={e => setNewClientData({...newClientData, name: e.target.value})}
                        autoFocus
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">DNI / RUC</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none"
                            placeholder="00000000"
                            value={newClientData.dni}
                            onChange={e => setNewClientData({...newClientData, dni: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Teléfono / Celular</label>
                          <input 
                            type="text" 
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none"
                            placeholder="999 999 999"
                            value={newClientData.phone}
                            onChange={e => setNewClientData({...newClientData, phone: e.target.value})}
                          />
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Dirección</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none uppercase"
                        placeholder="Av. La Cultura 123"
                        value={newClientData.address}
                        onChange={e => setNewClientData({...newClientData, address: e.target.value})}
                      />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Departamento</label>
                          <select 
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                            value={newClientData.department}
                            onChange={e => setNewClientData({...newClientData, department: e.target.value, province: '', district: ''})}
                          >
                              <option value="">-- SELECCIONAR --</option>
                              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Provincia</label>
                          <select 
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                            value={newClientData.province}
                            onChange={e => setNewClientData({...newClientData, province: e.target.value, district: ''})}
                            disabled={!newClientData.department}
                          >
                              <option value="">-- SELECCIONAR --</option>
                              {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Distrito</label>
                          <select 
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                            value={newClientData.district}
                            onChange={e => setNewClientData({...newClientData, district: e.target.value})}
                            disabled={!newClientData.province}
                          >
                              <option value="">-- SELECCIONAR --</option>
                              {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                          </select>
                      </div>
                  </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                 <button onClick={() => setShowClientModal(false)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancelar</button>
                 <button 
                    onClick={handleSaveNewClient}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-colors"
                 >
                    Guardar Cliente
                 </button>
              </div>
           </div>
        </div>
      )}

      {showTicket && ticketData && (
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                <div className="bg-zinc-100 p-2 shadow-2xl rounded-lg animate-in fade-in zoom-in-95">
                    <div className="bg-white w-[300px] p-6 shadow-sm font-mono text-xs text-slate-800 relative">
                        <div className="text-center mb-4 pb-2 border-b-2 border-dashed border-slate-300">
                            <div className="flex justify-center mb-2 text-slate-800"><Smartphone size={24}/></div>
                            <h2 className="font-bold text-sm uppercase">SapiSoft ERP</h2>
                            <p className="text-[10px] text-slate-500">RUC: 20601234567</p>
                        </div>
                        <div className="mb-3 space-y-1">
                            <div className="flex justify-between"><span>Ticket:</span> <span className="font-bold">#{ticketData.orderId}</span></div>
                            <div className="flex justify-between"><span>Fecha:</span> <span>{ticketData.date} {ticketData.time}</span></div>
                            <div className="flex justify-between"><span>Cliente:</span> <span className="font-bold uppercase truncate max-w-[150px]">{ticketData.client}</span></div>
                        </div>
                        <div className="border-t border-b border-dashed border-slate-300 py-2 mb-3">
                             <div className="font-bold text-center mb-2">{ticketData.typeLabel}</div>
                             {ticketData.items.map((item: any, idx: number) => (
                                 <div key={idx} className="flex mb-1 last:mb-0">
                                     <span className="flex-1 uppercase truncate pr-2">{item.desc}</span>
                                     <span className="w-16 text-right">{item.price.toFixed(2)}</span>
                                 </div>
                             ))}
                        </div>
                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-1 mt-1">
                                <span>TOTAL A PAGAR</span>
                                <span>S/ {ticketData.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded mb-4 text-[10px] text-slate-600 border border-slate-100">
                             <div className="font-bold mb-1">PAGOS RECIBIDOS:</div>
                             {ticketData.detailedPayments ? (
                                 ticketData.detailedPayments.map((p: any, i: number) => (
                                     <div key={i} className="flex justify-between mb-0.5">
                                         <span>{p.method} {p.reference ? `(${p.reference})` : ''}:</span>
                                         <span>S/ {p.amount.toFixed(2)}</span>
                                     </div>
                                 ))
                             ) : (
                                 Object.entries(ticketData.payments).map(([key, val]) => 
                                     Number(val) > 0 && <div key={key} className="flex justify-between uppercase"><span>{key}:</span><span>S/ {Number(val).toFixed(2)}</span></div>
                                 )
                             )}
                             <div className="flex justify-between font-bold border-t border-slate-200 mt-1 pt-1"><span>VUELTO:</span><span>S/ {ticketData.change.toFixed(2)}</span></div>
                        </div>
                        <div className="text-center text-[10px] text-slate-500 mt-4"><p>¡GRACIAS POR SU PREFERENCIA!</p></div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        {/* FIX: Clear cart when closing the ticket modal to start a new sale. */}
                        <button onClick={() => { setShowTicket(false); setCart([]); }} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 text-xs">Cerrar</button>
                        <button onClick={() => window.print()} className="flex-1 py-3 bg-primary-600 text-white font-bold rounded hover:bg-primary-700 text-xs flex items-center justify-center gap-2"><Printer size={14}/> Imprimir</button>
                    </div>
                </div>
           </div>
       )}
    </div>
  );
};

export default SalesModule;
