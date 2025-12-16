import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Search, Filter, Wrench, X, Save, Clock, CheckCircle, AlertCircle, Calendar, User, UserCog, Printer, Package, Plus, Trash2, ArrowRight, UserPlus, CreditCard, Phone, Banknote, QrCode, Landmark, Calculator, Receipt, Ban, CheckSquare, ChevronDown, Edit3, MessageCircle, Send, CornerUpLeft, MoreVertical } from 'lucide-react';
import { ServiceOrder, Product, ServiceProductItem, PaymentBreakdown, Category, Client, BankAccount, PaymentMethodType } from '../types';

interface ServicesProps {
  services: ServiceOrder[];
  products: Product[]; 
  categories: Category[]; 
  bankAccounts: BankAccount[]; 
  onAddService: (service: ServiceOrder) => void;
  onFinalizeService: (serviceId: string, total: number, finalStatus: 'Entregado' | 'Devolucion', paymentBreakdown: PaymentBreakdown) => void;
  onMarkRepaired: (serviceId: string) => void;
  clients?: Client[]; 
  onOpenWhatsApp?: (name: string, phone: string, message?: string) => void; // Updated signature
}

interface PaymentDetail {
    id: string;
    method: PaymentMethodType;
    amount: number;
    reference?: string;
    accountId?: string;
    bankName?: string;
}

const ServicesModule: React.FC<ServicesProps> = ({ services, products, categories, bankAccounts, onAddService, onFinalizeService, onMarkRepaired, clients, onOpenWhatsApp }) => {
  // ... (All existing state code remains same, no logic changes needed here) ...
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 

  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Reparado' | 'Entregado' | 'Devolucion'>('Todos');
  
  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Client Modal State
  const [showClientModal, setShowClientModal] = useState(false);
  const [tempClient, setTempClient] = useState({ name: '', dni: '', phone: '' });

  // Return/Edit Modal State (Pre-Venta Devolución)
  const [showReturnEditModal, setShowReturnEditModal] = useState(false);
  const [returnEditData, setReturnEditData] = useState<Partial<ServiceOrder>>({});

  // Delivery / Close Sale Modal State
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(null);
  const [closingStatus, setClosingStatus] = useState<'Entregado' | 'Devolucion'>('Entregado');
  
  // --- ADVANCED PAYMENT STATE ---
  const [paymentList, setPaymentList] = useState<PaymentDetail[]>([]);
  const [currentPayment, setCurrentPayment] = useState<{
      method: PaymentMethodType;
      amount: string;
      reference: string;
      accountId: string;
  }>({ method: 'Efectivo', amount: '', reference: '', accountId: '' });
  
  const paymentAmountRef = useRef<HTMLInputElement>(null);

  // Ticket State
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  // Initial Form State
  const getCurrentDate = () => new Date().toLocaleDateString('es-PE');
  const getCurrentTime = () => new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'});

  const [newOrder, setNewOrder] = useState<Partial<ServiceOrder>>({
      client: '', 
      clientPhone: '', 
      deviceModel: '', 
      issue: '', 
      cost: 0, 
      technician: '',
      receptionist: 'ADMIN',
      entryDate: '', 
      entryTime: '',
      usedProducts: []
  });

  // Click outside to close menu
  useEffect(() => {
      const handleClickOutside = () => setOpenMenuId(null);
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // ... (All existing functions: openModal, handlePrintTicket, etc.) ...
  
  const calculateOrderTotal = (order: ServiceOrder | Partial<ServiceOrder>) => {
      const productsTotal = (order.usedProducts || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return (order.cost || 0) + productsTotal;
  };

  const handleWhatsAppNotify = (service: ServiceOrder) => {
      if (!service.clientPhone) {
          alert("Este servicio no tiene un número de teléfono registrado.");
          return;
      }
      const total = calculateOrderTotal(service).toFixed(2);
      const message = `Hola *${service.client.split(' ')[0]}*, le informamos que su equipo *${service.deviceModel}* ya está listo para ser recogido.\n\n🛠️ *Estado:* Reparado\n💰 *Total a pagar:* S/ ${total}\n\nLo esperamos en nuestra tienda.`;

      if (onOpenWhatsApp) {
          onOpenWhatsApp(service.client, service.clientPhone, message);
      } else {
          // Fallback
          let phoneNumber = service.clientPhone.replace(/[^0-9]/g, ''); 
          if (phoneNumber.length === 9) phoneNumber = `51${phoneNumber}`;
          window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }
  };

  // ... (Rest of functions: handleOpenReturnEdit, handleAddProductToReturn, etc.) ...
  const openModal = () => {
    setNewOrder({
      client: '', 
      clientPhone: '',
      deviceModel: '', 
      issue: '', 
      cost: 0, 
      technician: '',
      receptionist: 'ADMIN',
      entryDate: getCurrentDate(), 
      entryTime: getCurrentTime(),
      usedProducts: []
    });
    setProductSearch('');
    setSelectedCategory('');
    setShowModal(true);
  }

  const handlePrintTicket = (s: ServiceOrder) => {
      const total = calculateOrderTotal(s);
      const clientData = clients?.find(c => c.name === s.client);
      
      setTicketData({
          orderId: s.id,
          date: s.entryDate,
          time: s.entryTime,
          client: s.client,
          clientDni: clientData?.dni, 
          typeLabel: s.status === 'Devolucion' ? 'DEVOLUCIÓN / DIAGNÓSTICO' : 'SERVICIO TÉCNICO',
          items: [
              { desc: `SERV. TECNICO ${s.deviceModel}`, price: s.cost },
              ...(s.usedProducts || []).map(p => ({ desc: p.productName, price: p.price * p.quantity }))
          ],
          total: total,
          payments: { cash: total, yape: 0, card: 0, bank: 0 }, 
          change: 0
      });
      setShowTicket(true);
  };

  const handleOpenReturnEdit = (service: ServiceOrder) => {
      setReturnEditData({
          ...service,
          usedProducts: service.usedProducts ? [...service.usedProducts] : []
      });
      setProductSearch('');
      setSelectedCategory('');
      setShowReturnEditModal(true);
  };

  const handleAddProductToReturn = (product: Product) => {
      const currentProducts = returnEditData.usedProducts || [];
      const exists = currentProducts.find(p => p.productId === product.id);
      
      let updatedProducts;
      if (exists) {
          updatedProducts = currentProducts.map(p => 
              p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
          );
      } else {
          updatedProducts = [...currentProducts, {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              price: product.price
          }];
      }
      setReturnEditData({ ...returnEditData, usedProducts: updatedProducts });
      setProductSearch('');
  };

  const handleRemoveProductFromReturn = (productId: string) => {
      const currentProducts = returnEditData.usedProducts || [];
      setReturnEditData({ ...returnEditData, usedProducts: currentProducts.filter(p => p.productId !== productId) });
  };

  const handleOpenDeliver = (service: ServiceOrder) => {
      setSelectedService(service);
      setClosingStatus('Entregado');
      
      const total = calculateOrderTotal(service);
      setPaymentList([]);
      setCurrentPayment({ method: 'Efectivo', amount: total.toFixed(2), reference: '', accountId: '' });
      
      setShowDeliverModal(true);
      setTimeout(() => paymentAmountRef.current?.focus(), 100);
  };

  const getPaymentTotal = () => paymentList.reduce((acc, p) => acc + p.amount, 0);

  const handleAddPayment = () => {
      const amountVal = parseFloat(currentPayment.amount);
      if (isNaN(amountVal) || amountVal <= 0) return alert("Ingrese un monto válido");

      if (currentPayment.method !== 'Efectivo') {
          if (!currentPayment.accountId) return alert("Debe seleccionar una cuenta bancaria destino");
          if (!currentPayment.reference) return alert("Debe ingresar el número de operación/referencia");
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

      if (selectedService) {
          const total = calculateOrderTotal(selectedService);
          const currentTotalPaid = newList.reduce((acc, p) => acc + p.amount, 0);
          const nextRemaining = Math.max(0, total - currentTotalPaid);
          
          setCurrentPayment({ 
              method: 'Efectivo', 
              amount: nextRemaining > 0 ? nextRemaining.toFixed(2) : '', 
              reference: '', 
              accountId: '' 
          });
      }
      paymentAmountRef.current?.focus();
  };

  const handleRemovePayment = (id: string) => {
      setPaymentList(paymentList.filter(p => p.id !== id));
  };

  const handleConfirmDeliver = () => {
      if (!selectedService) return;
      
      const total = calculateOrderTotal(selectedService);
      const totalPaid = getPaymentTotal();
      
      if (totalPaid < total - 0.1) { 
          alert("El monto pagado es menor al total del servicio.");
          return;
      }

      const breakdown: PaymentBreakdown = {
          cash: paymentList.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + p.amount, 0),
          yape: paymentList.filter(p => p.method === 'Yape' || p.method === 'Plin').reduce((acc, p) => acc + p.amount, 0),
          card: paymentList.filter(p => p.method === 'Tarjeta').reduce((acc, p) => acc + p.amount, 0),
          bank: paymentList.filter(p => p.method === 'Deposito').reduce((acc, p) => acc + p.amount, 0)
      };

      onFinalizeService(selectedService.id, total, closingStatus, breakdown);
      
      const clientData = clients?.find(c => c.name === selectedService.client);

      setTicketData({
          orderId: selectedService.id,
          date: getCurrentDate(),
          time: getCurrentTime(),
          client: selectedService.client,
          clientDni: clientData?.dni, 
          typeLabel: closingStatus === 'Devolucion' ? 'DEVOLUCIÓN / DIAGNÓSTICO' : 'SERVICIO TÉCNICO',
          items: [
              { desc: `SERV. TECNICO ${selectedService.deviceModel}`, price: selectedService.cost },
              ...(selectedService.usedProducts || []).map(p => ({ desc: p.productName, price: p.price * p.quantity }))
          ],
          total: total,
          detailedPayments: paymentList,
          change: totalPaid - total
      });

      setShowDeliverModal(false);
      setShowTicket(true);
      setSelectedService(null);
  };

  const handleAddProductToOrder = (product: Product) => {
      const currentProducts = newOrder.usedProducts || [];
      const exists = currentProducts.find(p => p.productId === product.id);
      
      let updatedProducts;
      if (exists) {
          updatedProducts = currentProducts.map(p => 
              p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
          );
      } else {
          updatedProducts = [...currentProducts, {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              price: product.price
          }];
      }
      setNewOrder({ ...newOrder, usedProducts: updatedProducts });
      setProductSearch(''); 
  };

  const handleRemoveProductFromOrder = (productId: string) => {
      const currentProducts = newOrder.usedProducts || [];
      setNewOrder({ ...newOrder, usedProducts: currentProducts.filter(p => p.productId !== productId) });
  };

  const handleQuickAddClient = () => {
      setTempClient({ name: '', dni: '', phone: '' });
      setShowClientModal(true);
  };

  const handleSaveClient = () => {
      if (!tempClient.name) return;
      setNewOrder({ 
          ...newOrder, 
          client: tempClient.name.toUpperCase(),
          clientPhone: tempClient.phone 
      });
      setShowClientModal(false);
  };

  const handleSaveOrder = () => {
      if(!newOrder.client || !newOrder.deviceModel) return alert("Complete los datos obligatorios");
      
      const order: ServiceOrder = {
          id: Math.floor(Math.random() * 100000).toString(),
          entryDate: newOrder.entryDate || getCurrentDate(),
          entryTime: newOrder.entryTime || getCurrentTime(),
          client: newOrder.client.toUpperCase(),
          clientPhone: newOrder.clientPhone, 
          deviceModel: newOrder.deviceModel.toUpperCase(),
          issue: newOrder.issue || '',
          status: 'Pendiente',
          technician: newOrder.technician || 'POR ASIGNAR',
          receptionist: newOrder.receptionist || 'ADMIN',
          cost: Number(newOrder.cost),
          usedProducts: newOrder.usedProducts || [],
          color: '#ef4444'
      };
      onAddService(order);
      setShowModal(false);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = productSearch === '' || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.code.includes(productSearch);
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;

    return (productSearch.length > 0 || selectedCategory !== '') && matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full space-y-3">
       <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['Todos', 'Pendiente', 'Reparado', 'Entregado', 'Devolucion'] as const).map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${statusFilter === status ? 'bg-slate-800 text-white border-slate-800 shadow-md dark:bg-slate-600' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{status}</button>
          ))}
       </div>

       <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2 uppercase tracking-wide"><Wrench className="text-primary-500" size={18}/> Ordenes de Servicio</h2>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-600"></div>
              <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={14}/>
                  <input type="text" placeholder="Buscar por orden, cliente o equipo..." className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs w-72 focus:bg-white dark:focus:bg-slate-600 focus:border-primary-500 transition-all outline-none text-slate-700 dark:text-white placeholder-slate-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
          </div>
          <button onClick={openModal} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-700 shadow-sm transition-colors shadow-primary-200 dark:shadow-none flex items-center gap-2"><Smartphone size={14}/> Nueva Recepción</button>
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-1">
            <div className="overflow-visible h-full">
                <table className="w-full text-xs modern-table">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                        <tr><th className="px-4 py-3 text-left w-24">N° Orden</th><th className="px-4 py-3 text-left w-28">Fecha Ing.</th><th className="px-4 py-3 text-left">Cliente / Dispositivo</th><th className="px-4 py-3 text-left">Detalle / Repuestos</th><th className="px-4 py-3 text-left w-32">Personal</th><th className="px-4 py-3 text-center w-28">Estado</th><th className="px-4 py-3 text-right w-24">Total</th><th className="px-4 py-3 text-center min-w-[50px]"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredServices.map(s => {
                            const total = calculateOrderTotal(s); const isFinalized = s.status === 'Entregado' || s.status === 'Devolucion';
                            return (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="px-4 py-2"><span className="font-mono font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded border border-primary-100 dark:border-primary-800">#{s.id}</span></td>
                                <td className="px-4 py-2 text-slate-500 dark:text-slate-400"><div className="font-medium text-slate-700 dark:text-slate-200">{s.entryDate}</div><div className="text-[10px]">{s.entryTime}</div></td>
                                <td className="px-4 py-2">
                                    <div className="font-bold text-slate-700 dark:text-white truncate max-w-[180px]" title={s.client}>{s.client}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><Smartphone size={10}/> {s.deviceModel}</div>
                                    {s.clientPhone && <div className="text-[9px] text-emerald-600 flex items-center gap-0.5"><Phone size={8}/> {s.clientPhone}</div>}
                                </td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-300"><div className="truncate max-w-[200px] mb-1" title={s.issue}>{s.issue}</div>{s.usedProducts && s.usedProducts.length > 0 && (<div className="flex flex-wrap gap-1">{s.usedProducts.map((p, idx) => (<span key={idx} className="text-[9px] bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1 rounded border border-orange-100 dark:border-orange-800 flex items-center gap-1"><Package size={8}/> {p.quantity}x {p.productName}</span>))}</div>)}</td>
                                <td className="px-4 py-2"><div className="flex flex-col gap-0.5"><div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1" title="Técnico"><UserCog size={10} className="text-orange-500"/> {s.technician || '-'}</div><div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1" title="Vendedor"><User size={10} className="text-blue-500"/> {s.receptionist || '-'}</div></div></td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${s.status === 'Entregado' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : s.status === 'Pendiente' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' : s.status === 'Reparado' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                                        {s.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-slate-800 dark:text-white">S/ {total.toFixed(2)}</td>
                                <td className="px-4 py-2 text-center relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded transition-colors"
                                    >
                                        <MoreVertical size={16}/>
                                    </button>
                                    
                                    {openMenuId === s.id && (
                                        <div className="absolute right-8 top-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-xl z-50 border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right text-left">
                                            <button onClick={() => handleWhatsAppNotify(s)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-b border-slate-50 dark:border-slate-700">
                                                <MessageCircle size={14} className="text-emerald-500"/> Notificar (WhatsApp)
                                            </button>
                                            
                                            {!isFinalized && (
                                                <>
                                                    {s.status === 'Pendiente' && (
                                                        <button onClick={() => onMarkRepaired(s.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                                                            <CheckSquare size={14}/> Marcar Reparado
                                                        </button>
                                                    )}
                                                    {(s.status === 'Pendiente' || s.status === 'Reparado') && (
                                                        <>
                                                            <button onClick={() => handleOpenDeliver(s)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400">
                                                                <CheckCircle size={14}/> Entregar / Cobrar
                                                            </button>
                                                            <button onClick={() => handleOpenReturnEdit(s)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400">
                                                                <CornerUpLeft size={14}/> Devolución / Editar
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {isFinalized && (
                                                <button onClick={() => handlePrintTicket(s)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                    <Printer size={14}/> Imprimir Ticket
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
       </div>
       {/* ... rest of the modals ... */}
       {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[900px] h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                {/* ... existing modal content ... */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><Smartphone className="text-primary-600 dark:text-primary-400"/> Nueva Recepción</h3>
                    <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/></button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-[55%] p-6 overflow-y-auto space-y-4 border-r border-slate-100 dark:border-slate-700">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cliente</label>
                            <div className="flex gap-2 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                <input 
                                    type="text" 
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase text-sm font-bold focus:border-primary-500 outline-none" 
                                    placeholder="BUSCAR O INGRESAR CLIENTE..." 
                                    value={newOrder.client} 
                                    onChange={e => setNewOrder({...newOrder, client: e.target.value.toUpperCase()})} 
                                    autoFocus 
                                    list="client-suggestions"
                                />
                                <datalist id="client-suggestions">
                                    {clients?.map(c => <option key={c.id} value={c.name}>{c.phone ? `Telf: ${c.phone}` : ''}</option>)}
                                </datalist>
                                <button onClick={handleQuickAddClient} className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex-shrink-0" title="Nuevo Cliente"><UserPlus size={18}/></button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Phone size={12}/> Teléfono / WhatsApp</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" 
                                placeholder="999 999 999" 
                                value={newOrder.clientPhone} 
                                onChange={e => setNewOrder({...newOrder, clientPhone: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Modelo / Equipo</label>
                                <input type="text" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newOrder.deviceModel} onChange={e => setNewOrder({...newOrder, deviceModel: e.target.value.toUpperCase()})} placeholder="EJ. IPHONE 11" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Costo Serv. (Mano Obra)</label>
                                <input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-bold" value={newOrder.cost} onChange={e => setNewOrder({...newOrder, cost: Number(e.target.value)})} placeholder="0.00" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Falla / Problema</label>
                            <textarea className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg h-20 resize-none uppercase text-sm" value={newOrder.issue} onChange={e => setNewOrder({...newOrder, issue: e.target.value})} placeholder="DESCRIBIR EL PROBLEMA..."></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Técnico Asignado</label>
                                <select className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={newOrder.technician} onChange={e => setNewOrder({...newOrder, technician: e.target.value})}>
                                    <option value="">-- SELECCIONAR --</option>
                                    <option value="Isaac Quille">Isaac Quille</option>
                                    <option value="Kalyoscar Acosta">Kalyoscar Acosta</option>
                                    <option value="Albertina Ortega">Albertina Ortega</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Recepcionado Por</label>
                                <input type="text" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg" value={newOrder.receptionist} readOnly />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                             <h4 className="font-bold text-sm text-slate-700 dark:text-white mb-2 flex items-center gap-2"><Package size={16}/> Repuestos / Productos</h4>
                             {newOrder.usedProducts?.length === 0 ? (
                                 <p className="text-xs text-slate-400 italic">No hay productos seleccionados.</p>
                             ) : (
                                 <div className="space-y-2">
                                     {newOrder.usedProducts?.map((p, i) => (
                                         <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded border border-slate-100 dark:border-slate-700 text-xs">
                                             <div>
                                                 <div className="font-bold text-slate-700 dark:text-white">{p.productName}</div>
                                                 <div className="text-slate-500 dark:text-slate-400">{p.quantity} x S/ {p.price}</div>
                                             </div>
                                             <button onClick={() => handleRemoveProductFromOrder(p.productId)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="w-[45%] bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col">
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Agregar Repuesto</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                                    <input 
                                        type="text" 
                                        className="pl-8 pr-3 py-2 w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm outline-none focus:border-primary-500" 
                                        placeholder="Buscar producto..." 
                                        value={productSearch} 
                                        onChange={e => setProductSearch(e.target.value)} 
                                    />
                                </div>
                                <div className="relative w-32 shrink-0">
                                    <select 
                                        className="w-full pl-2 pr-6 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-lg text-xs appearance-none outline-none focus:border-primary-500 cursor-pointer"
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">Categoría</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12}/>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-h-[400px]">
                                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                    <div key={p.id} onClick={() => handleAddProductToOrder(p)} className="p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer group">
                                        <div className="flex justify-between">
                                            <div className="font-bold text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{p.name}</div>
                                            <div className="font-bold text-xs text-slate-800 dark:text-white">S/ {p.price}</div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                                            <span>Stock: {p.stock}</span>
                                            <span>{p.category}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-xs text-slate-400">
                                        {(productSearch || selectedCategory) ? "No se encontraron productos." : "Busque para agregar."}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-auto bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between text-sm mb-1 text-slate-500 dark:text-slate-400"><span>Mano de Obra:</span><span>S/ {Number(newOrder.cost).toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm mb-2 text-slate-500 dark:text-slate-400"><span>Repuestos:</span><span>S/ {(newOrder.usedProducts?.reduce((a,b)=>a+(b.price*b.quantity),0) || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg text-slate-800 dark:text-white border-t border-slate-100 dark:border-slate-700 pt-2"><span>TOTAL ESTIMADO:</span><span>S/ {calculateOrderTotal(newOrder).toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={() => setShowModal(false)} className="px-6 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleSaveOrder} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-colors">Generar Orden</button>
                </div>
            </div>
        </div>
       )}
       {/* ... rest of the payment modal ... */}
       {showDeliverModal && selectedService && (
           <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
               {/* ... (Existing Delivery Modal Content) ... */}
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[850px] overflow-hidden flex flex-col max-h-[95vh] border border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95">
                  <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                         {closingStatus === 'Entregado' ? <CheckCircle size={20} className="text-emerald-500"/> : <Ban size={20} className="text-red-500"/>} 
                         Confirmar {closingStatus} <span className="text-slate-400 font-normal mx-1">|</span> <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Orden #{selectedService.id}</span>
                     </h3>
                     <button onClick={() => setShowDeliverModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
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
                                                       <td className="px-4 py-3 font-medium flex items-center gap-2">{p.method}</td>
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
                                    <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total Servicio:</span><span className="font-bold text-slate-800 dark:text-white text-lg">S/ {calculateOrderTotal(selectedService).toFixed(2)}</span></div>
                                    <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total Pagado:</span><span className={`font-bold ${getPaymentTotal() >= calculateOrderTotal(selectedService) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>S/ {getPaymentTotal().toFixed(2)}</span></div>
                                    <div className="h-px bg-slate-200 dark:bg-slate-600 my-1"></div>
                                    <div className="flex justify-between items-center"><span className={`text-sm font-bold ${getPaymentTotal() < calculateOrderTotal(selectedService) ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{getPaymentTotal() < calculateOrderTotal(selectedService) ? 'Falta por Pagar:' : 'Vuelto / Cambio:'}</span><span className={`text-xl font-bold ${getPaymentTotal() < calculateOrderTotal(selectedService) ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>S/ {Math.abs(getPaymentTotal() - calculateOrderTotal(selectedService)).toFixed(2)}</span></div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="w-80 flex flex-col">
                           <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2"><Plus size={14}/> Agregar Pago</h4>
                           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
                               <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Método de Pago</label><div className="grid grid-cols-3 gap-2">{['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Deposito'].map((m) => (<button key={m} onClick={() => setCurrentPayment({...currentPayment, method: m as any, reference: '', accountId: ''})} className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${currentPayment.method === m ? 'bg-slate-800 text-white border-slate-800 dark:bg-primary-600 dark:border-primary-600' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{m}</button>))}</div></div>
                               {currentPayment.method !== 'Efectivo' && (<div className="space-y-3 animate-in fade-in slide-in-from-top-2"><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Cuenta Destino</label><select className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-primary-500 transition-colors text-slate-700 dark:text-white" value={currentPayment.accountId} onChange={e => setCurrentPayment({...currentPayment, accountId: e.target.value})}><option value="">-- Seleccionar Cuenta --</option>{bankAccounts.map(bank => (<option key={bank.id} value={bank.id}>{bank.bankName} - {bank.currency} ({bank.alias || bank.accountNumber})</option>))}</select></div><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Nro. Operación / Ref</label><input type="text" className="w-full p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-primary-500 uppercase text-slate-700 dark:text-white" placeholder="Ej. 123456" value={currentPayment.reference} onChange={e => setCurrentPayment({...currentPayment, reference: e.target.value})}/></div></div>)}
                               <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex justify-between"><span>Monto a Cobrar</span></label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span><input ref={paymentAmountRef} type="number" className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 dark:focus:ring-primary-900/20 transition-all placeholder-slate-300" placeholder="0.00" value={currentPayment.amount} onChange={e => setCurrentPayment({...currentPayment, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddPayment()}/></div></div>
                               <button onClick={handleAddPayment} className="w-full py-3 bg-slate-800 dark:bg-primary-600 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"><ArrowRight size={18}/> Agregar Pago</button>
                           </div>
                       </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3"><button onClick={() => setShowDeliverModal(false)} className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">Cancelar</button><button onClick={handleConfirmDeliver} disabled={getPaymentTotal() < calculateOrderTotal(selectedService) - 0.1} className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><CheckCircle size={18}/> Finalizar {closingStatus}</button></div>
               </div>
           </div>
       )}
       {/* ... existing ticket modal ... */}
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
                            <div className="flex justify-between"><span>Orden:</span> <span className="font-bold">#{ticketData.orderId}</span></div>
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
                                <span>TOTAL</span>
                                <span>S/ {ticketData.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded mb-4 text-[10px] text-slate-600 border border-slate-100">
                             <div className="font-bold mb-1">PAGOS:</div>
                             {ticketData.detailedPayments ? (
                                 ticketData.detailedPayments.map((p: any, i: number) => (
                                     <div key={i} className="flex justify-between mb-0.5">
                                         <span>{p.method}:</span>
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
                        <div className="text-center text-[10px] text-slate-500 mt-4 mb-2"><p>¡GRACIAS POR SU PREFERENCIA!</p></div>
                        <div className="mt-8 pt-4 border-t border-dashed border-slate-400">
                            <div className="text-center">
                                <p className="font-bold uppercase text-[10px] mb-1">{ticketData.client}</p>
                                <p className="text-[10px] mb-1">DNI: {ticketData.clientDni || '________'}</p>
                                <p className="text-[9px] text-slate-400">Firma del Cliente</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setShowTicket(false)} className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 text-xs">Cerrar</button>
                        <button onClick={() => window.print()} className="flex-1 py-2 bg-primary-600 text-white font-bold rounded hover:bg-primary-700 text-xs flex items-center justify-center gap-2"><Printer size={14}/> Imprimir</button>
                    </div>
                </div>
           </div>
       )}
    </div>
  );
};

export default ServicesModule;