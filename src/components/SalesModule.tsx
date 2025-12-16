
import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, X, ShoppingCart, User, Smartphone, Banknote, CreditCard, QrCode, Landmark, Wallet, CheckCircle, FileText, Filter, ArrowRight } from 'lucide-react';
import { Product, CartItem, Client, PaymentBreakdown, Category, PurchaseRecord, BankAccount, PaymentMethodType, GeoLocation } from '../types';

interface SalesModuleProps {
    products: Product[];
    clients: Client[];
    categories: Category[]; 
    purchasesHistory: PurchaseRecord[];
    bankAccounts: BankAccount[]; 
    locations: GeoLocation[];
    onAddClient: (client: Client) => void;
    onProcessSale: (cart: CartItem[], total: number, docType: string, clientName: string, paymentBreakdown: PaymentBreakdown, ticketId: string) => void;
}

interface PaymentDetail {
    id: string;
    method: PaymentMethodType;
    amount: number;
    reference?: string;
    accountId?: string;
}

const SalesModule: React.FC<SalesModuleProps> = ({ products, clients, categories, bankAccounts, onAddClient, onProcessSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [clientSearchTerm, setClientSearchTerm] = useState(clients[0]?.name || ''); 
  const [docType, setDocType] = useState('TICKET DE VENTA');
  
  // Estados de Pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentList, setPaymentList] = useState<PaymentDetail[]>([]);
  const [currentPayment, setCurrentPayment] = useState<{method: PaymentMethodType, amount: string, reference: string, accountId: string}>({ method: 'Efectivo', amount: '', reference: '', accountId: '' });

  // Estados de Ticket
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const paymentAmountRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.includes(searchTerm);
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    return (searchTerm.length > 0 || selectedCategory !== '') && matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (product.stock <= 0) return alert("Sin stock disponible");
    if (existing && existing.quantity >= product.stock) return alert("No hay más stock disponible");

    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, discount: 0, total: product.price }]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const removeFromCart = (id: string) => { setCart(cart.filter(item => item.id !== id)); };
  
  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQ = Math.max(1, item.quantity + delta);
        if (product && newQ > product.stock) return item;
        return { ...item, quantity: newQ, total: newQ * item.price };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + item.total, 0);
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
      
      const newPay: PaymentDetail = {
          id: Math.random().toString(),
          method: currentPayment.method,
          amount: amountVal,
          reference: currentPayment.reference,
          accountId: currentPayment.accountId
      };
      const newList = [...paymentList, newPay];
      setPaymentList(newList);
      
      const nextRemaining = Math.max(0, total - newList.reduce((acc, p) => acc + p.amount, 0));
      setCurrentPayment({ method: 'Efectivo', amount: nextRemaining > 0 ? nextRemaining.toFixed(2) : '', reference: '', accountId: '' });
      paymentAmountRef.current?.focus();
  };

  const handleFinalizeSale = () => {
      const totalPaid = getPaymentTotal();
      if (totalPaid < total - 0.1) return alert("Falta cubrir el total de la venta.");

      const breakdown: PaymentBreakdown = {
          cash: paymentList.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + p.amount, 0),
          yape: paymentList.filter(p => p.method === 'Yape' || p.method === 'Plin').reduce((acc, p) => acc + p.amount, 0),
          card: paymentList.filter(p => p.method === 'Tarjeta').reduce((acc, p) => acc + p.amount, 0),
          bank: paymentList.filter(p => p.method === 'Deposito').reduce((acc, p) => acc + p.amount, 0),
          wallet: paymentList.filter(p => p.method === 'Saldo Favor').reduce((acc, p) => acc + p.amount, 0)
      };

      const ticketId = Math.floor(Math.random() * 100000).toString();
      onProcessSale(cart, total, docType, selectedClient?.name || 'Cliente Varios', breakdown, ticketId);

      setTicketData({
          orderId: ticketId,
          date: new Date().toLocaleDateString('es-PE'),
          time: new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'}),
          client: selectedClient?.name,
          items: cart,
          total,
          payments: paymentList,
          change: totalPaid - total
      });
      setShowPaymentModal(false);
      setCart([]);
      setShowTicket(true);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      <div className="flex-1 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4 bg-slate-50/50 dark:bg-slate-700/30">
           <div className="flex-1 flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                 <input ref={searchInputRef} autoFocus type="text" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-100 text-lg text-slate-900 dark:text-white outline-none" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
               </div>
               <div className="relative w-48 shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <select className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm outline-none cursor-pointer font-medium text-slate-700 dark:text-white" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="">Todas</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
               </div>
           </div>
           {filteredProducts.length > 0 && (
              <div className="absolute top-[80px] left-6 right-[350px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                 {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-primary-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                       <div><div className="font-bold text-slate-700 dark:text-white">{p.name}</div><div className="text-xs text-slate-400">Stock: {p.stock}</div></div>
                       <div className="font-bold text-slate-800 dark:text-white">S/ {p.price.toFixed(2)}</div>
                    </div>
                 ))}
              </div>
           )}
        </div>

        <div className="flex-1 overflow-auto p-2">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600"><ShoppingCart size={64}/><p className="mt-4 font-medium">Carrito vacío</p></div>
           ) : (
             <table className="w-full modern-table">
                <thead><tr><th>Producto</th><th className="text-center">Cant.</th><th className="text-right">Precio</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                   {cart.map(item => (
                      <tr key={item.id}>
                         <td><div className="font-semibold text-slate-700 dark:text-white">{item.name}</div></td>
                         <td className="text-center"><div className="flex items-center justify-center gap-2"><button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded"><Minus size={14}/></button><span className="font-bold text-slate-700 dark:text-white">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded"><Plus size={14}/></button></div></td>
                         <td className="text-right text-slate-600 dark:text-slate-300">S/ {item.price.toFixed(2)}</td>
                         <td className="text-right font-bold text-slate-800 dark:text-white">S/ {item.total.toFixed(2)}</td>
                         <td className="text-center"><button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 p-6 rounded-b-xl flex justify-between items-center">
            <span className="text-xl font-bold text-slate-800 dark:text-white">Total a Pagar</span>
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">S/ {total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="w-80 flex flex-col gap-4 shrink-0">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2 block">Cliente</label>
            <div className="flex gap-2 mb-3">
               <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0"><User size={20}/></div>
               <div className="min-w-0 flex-1 relative">
                  <input list="client-suggestions" className="w-full bg-transparent font-bold text-slate-700 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 text-sm py-1" value={clientSearchTerm} onChange={e => { setClientSearchTerm(e.target.value); const found = clients.find(c => c.name === e.target.value); if(found) setSelectedClient(found); }} placeholder="Buscar cliente..."/>
                  <datalist id="client-suggestions">{clients.map(c => <option key={c.id} value={c.name}/>)}</datalist>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{selectedClient?.dni || '---'}</div>
               </div>
            </div>
         </div>
         <button disabled={cart.length === 0} onClick={openPaymentModal} className="bg-primary-600 text-white p-4 rounded-2xl shadow-lg hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-between group">
            <div className="text-left"><div className="text-xs opacity-80 font-medium mb-1">PROCESAR VENTA</div><div className="text-xl font-bold">S/ {total.toFixed(2)}</div></div>
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30"><Banknote size={24}/></div>
         </button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[850px] flex flex-col border border-slate-300 dark:border-slate-700">
              <div className="px-6 py-4 flex justify-between items-center border-b dark:border-slate-700">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white">Confirmar Pago</h3>
                 <button onClick={() => setShowPaymentModal(false)}><X size={24} className="text-slate-400"/></button>
              </div>
              <div className="p-6 flex gap-8">
                   <div className="flex-1">
                       <table className="w-full text-sm mb-4">
                           <thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="p-2 text-left">Método</th><th className="p-2 text-right">Monto</th><th className="w-8"></th></tr></thead>
                           <tbody>{paymentList.map(p => (<tr key={p.id}><td className="p-2">{p.method}</td><td className="p-2 text-right">S/ {p.amount.toFixed(2)}</td><td className="text-center"><button onClick={() => setPaymentList(paymentList.filter(x => x.id !== p.id))}><Trash2 size={14} className="text-red-500"/></button></td></tr>))}</tbody>
                       </table>
                       <div className="flex justify-between items-center text-lg font-bold"><span>Restante:</span><span className={remainingTotal > 0 ? "text-red-500" : "text-emerald-500"}>S/ {remainingTotal.toFixed(2)}</span></div>
                   </div>
                   <div className="w-72 space-y-3">
                       <div className="grid grid-cols-2 gap-2">
                           {['Efectivo', 'Yape', 'Tarjeta', 'Deposito'].map(m => <button key={m} onClick={() => setCurrentPayment({...currentPayment, method: m as any})} className={`p-2 text-xs font-bold border rounded ${currentPayment.method === m ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>{m}</button>)}
                       </div>
                       <input ref={paymentAmountRef} type="number" className="w-full p-3 border rounded text-xl font-bold text-center outline-none" value={currentPayment.amount} onChange={e => setCurrentPayment({...currentPayment, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddPayment()}/>
                       <button onClick={handleAddPayment} className="w-full py-2 bg-slate-800 text-white rounded font-bold">Agregar Pago</button>
                   </div>
              </div>
              <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-3">
                  <button onClick={handleFinalizeSale} disabled={remainingTotal > 0.1} className="px-8 py-2 bg-primary-600 text-white font-bold rounded hover:bg-primary-700 disabled:opacity-50">Confirmar Venta</button>
              </div>
           </div>
        </div>
      )}

      {showTicket && ticketData && (
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                <div className="bg-white w-[300px] p-6 shadow-2xl text-slate-800 font-mono text-xs">
                    <div className="text-center mb-4 border-b border-dashed pb-2">
                        <div className="flex justify-center mb-2"><Smartphone size={24}/></div>
                        <h2 className="font-bold text-sm">SapiSoft ERP</h2>
                        <p>RUC: 20601234567</p>
                    </div>
                    <div className="mb-3 space-y-1">
                        <div className="flex justify-between"><span>Ticket:</span> <span className="font-bold">#{ticketData.orderId}</span></div>
                        <div className="flex justify-between"><span>Cliente:</span> <span className="truncate max-w-[150px]">{ticketData.client}</span></div>
                    </div>
                    <div className="border-y border-dashed py-2 mb-3">
                         {ticketData.items.map((item: any, idx: number) => (
                             <div key={idx} className="flex mb-1"><span className="flex-1 truncate">{item.name}</span><span className="w-16 text-right">{item.total.toFixed(2)}</span></div>
                         ))}
                    </div>
                    <div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>S/ {ticketData.total.toFixed(2)}</span></div>
                    <div className="mt-4 flex gap-2"><button onClick={() => setShowTicket(false)} className="flex-1 py-2 bg-slate-200 rounded">Cerrar</button><button onClick={() => window.print()} className="flex-1 py-2 bg-primary-600 text-white rounded">Imprimir</button></div>
                </div>
           </div>
       )}
    </div>
  );
};
export default SalesModule;
