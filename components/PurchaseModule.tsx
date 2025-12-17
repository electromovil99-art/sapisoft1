
import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, X, CheckCircle, ShoppingBag, Truck, PackagePlus, Building2, FileText, Calendar, CreditCard, DollarSign, Edit3, Filter } from 'lucide-react';
import { Product, CartItem, Supplier, Category } from '../types';

interface PurchaseModuleProps {
    products: Product[];
    suppliers: Supplier[];
    categories: Category[]; // NEW
    onAddSupplier: (supplier: Supplier) => void;
    onProcessPurchase: (cart: CartItem[], total: number, docType: string, supplierName: string, paymentCondition: 'Contado' | 'Credito', creditDays: number) => void;
}

const PurchaseModule: React.FC<PurchaseModuleProps> = ({ products, suppliers, categories, onAddSupplier, onProcessPurchase }) => {
  // Estado Principal
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // NEW
  
  // Datos de Compra
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState(''); // Estado para buscar proveedor
  const [docType, setDocType] = useState('FACTURA DE COMPRA');
  
  // Condición de Pago
  const [paymentCondition, setPaymentCondition] = useState<'Contado' | 'Credito'>('Contado');
  const [creditDays, setCreditDays] = useState<number>(30); // Default 30 días

  // Modales
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({ name: '', ruc: '', phone: '', address: '', contactName: '' });

  // Edición de Costo (Simulada en el carrito)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempCost, setTempCost] = useState<string>('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (suppliers.length > 0 && !selectedSupplier) {
          const defaultSup = suppliers[0];
          setSelectedSupplier(defaultSup);
          setSupplierSearchTerm(defaultSup.name);
      }
  }, [suppliers]);

  // Handle Supplier Search
  const handleSupplierSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSupplierSearchTerm(val);
      const found = suppliers.find(s => s.name === val.toUpperCase());
      if (found) {
          setSelectedSupplier(found);
      }
  };

  // --- Lógica de Carrito ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.includes(searchTerm);
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    
    return (searchTerm.length > 0 || selectedCategory !== '') && matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
    } else {
      // Al comprar, usamos el precio actual como "Costo estimado", pero permitimos editarlo
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
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ, total: newQ * item.price };
      }
      return item;
    }));
  };

  const startEditingCost = (item: CartItem) => {
      setEditingItemId(item.id);
      setTempCost(item.price.toString());
  };

  const saveCost = (id: string) => {
      const newCost = parseFloat(tempCost);
      if (!isNaN(newCost) && newCost >= 0) {
          setCart(cart.map(item => item.id === id ? { ...item, price: newCost, total: item.quantity * newCost } : item));
      }
      setEditingItemId(null);
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + item.total, 0);
  const total = calculateTotal();

  const handleProcess = () => {
      if (cart.length === 0) return;
      if (!selectedSupplier) {
          alert("Seleccione un proveedor");
          return;
      }
      
      const supplierName = selectedSupplier.name;
      onProcessPurchase(cart, total, docType, supplierName, paymentCondition, creditDays);
      
      // Reset
      setCart([]);
      alert("Compra registrada correctamente. Stock actualizado.");
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
                   className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-lg text-slate-900 dark:text-white placeholder-slate-400"
                   placeholder="Buscar producto a comprar..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               {/* Category Filter */}
               <div className="relative w-48 shrink-0">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <select 
                        className="w-full pl-9 pr-8 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 cursor-pointer font-medium text-slate-700 dark:text-white"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
               </div>
           </div>

           {/* Dropdown Results */}
           {filteredProducts.length > 0 && (
                <div className="absolute top-[80px] left-6 right-[350px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                   {filteredProducts.map(p => (
                      <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 flex justify-between items-center group">
                         <div>
                            <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{p.name}</div>
                            <div className="text-xs text-slate-400 flex gap-2">
                                <span>SKU: {p.code}</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-slate-500 dark:text-slate-400">{p.category}</span>
                                <span>Stock: {p.stock}</span>
                            </div>
                         </div>
                         <div className="font-bold text-slate-800 dark:text-white">Ref: S/ {p.price.toFixed(2)}</div>
                      </div>
                   ))}
                </div>
           )}
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-auto p-2">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                <ShoppingBag size={64} strokeWidth={1}/>
                <p className="mt-4 font-medium">Lista de compra vacía</p>
             </div>
           ) : (
             <table className="w-full modern-table">
                <thead>
                   <tr>
                     <th className="rounded-l-lg">Producto</th>
                     <th className="text-center">Cant.</th>
                     <th className="text-right">Costo Unit.</th>
                     <th className="text-right">Total</th>
                     <th className="rounded-r-lg"></th>
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
                               <span className="w-8 text-center font-bold text-slate-700 dark:text-white">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"><Plus size={14}/></button>
                            </div>
                         </td>
                         <td className="text-right text-slate-600 dark:text-slate-300">
                            {editingItemId === item.id ? (
                                <input 
                                    type="number" 
                                    autoFocus
                                    className="w-24 p-1 border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded text-right font-bold"
                                    value={tempCost}
                                    onChange={e => setTempCost(e.target.value)}
                                    onBlur={() => saveCost(item.id)}
                                    onKeyDown={e => e.key === 'Enter' && saveCost(item.id)}
                                />
                            ) : (
                                <div className="flex items-center justify-end gap-2 group cursor-pointer" onClick={() => startEditingCost(item)}>
                                    <span>S/ {item.price.toFixed(2)}</span>
                                    <Edit3 size={12} className="opacity-0 group-hover:opacity-100 text-blue-500"/>
                                </div>
                            )}
                         </td>
                         <td className="text-right font-bold text-slate-800 dark:text-white">S/ {item.total.toFixed(2)}</td>
                         <td className="text-center">
                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                               <Trash2 size={18}/>
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           )}
        </div>
        
        {/* ... Rest of layout (Totals) ... */}
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
              <span className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign size={20}/> Total Compra
              </span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">S/ {total.toFixed(2)}</span>
           </div>
        </div>
      </div>

      {/* RIGHT: Controls & Checkout */}
      <div className="w-80 flex flex-col gap-4 shrink-0">
         {/* Supplier Card (Searchable) */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-1"><Truck size={12}/> Proveedor</label>
            <div className="flex gap-2 mb-3">
               <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                  <Building2 size={20}/>
               </div>
               <div className="min-w-0 flex-1 relative">
                  {/* Searchable Input */}
                  <input 
                    list="supplier-suggestions"
                    className="w-full bg-transparent font-bold text-slate-700 dark:text-white outline-none border-b border-slate-200 dark:border-slate-700 focus:border-orange-500 text-sm py-1"
                    value={supplierSearchTerm}
                    onChange={handleSupplierSearchChange}
                    placeholder="Escriba para buscar..."
                  />
                  <datalist id="supplier-suggestions">
                     {suppliers.map(s => <option key={s.id} value={s.name}>{s.ruc ? `RUC: ${s.ruc}` : ''}</option>)}
                  </datalist>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">RUC: {selectedSupplier?.ruc || '---'}</p>
               </div>
            </div>
            <button onClick={() => setShowSupplierModal(true)} className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 text-sm hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center justify-center gap-2">
               <Plus size={16}/> Nuevo Proveedor
            </button>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
             <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><FileText size={12}/> Tipo Documento</label>
             <div className="relative">
                 <select 
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                 >
                     <option value="FACTURA DE COMPRA">FACTURA DE COMPRA</option>
                     <option value="BOLETA DE VENTA">BOLETA DE VENTA</option>
                     <option value="GUIA DE REMISION">GUIA DE REMISION</option>
                     <option value="DUA">DUA (DECL. ÚNICA ADUANAS)</option>
                     <option value="NOTA DE ENTRADA">NOTA DE ENTRADA</option>
                 </select>
             </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
             <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><CreditCard size={12}/> Condición de Pago</label>
             
             <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                 <button 
                    onClick={() => setPaymentCondition('Contado')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${paymentCondition === 'Contado' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                    CONTADO
                 </button>
                 <button 
                    onClick={() => setPaymentCondition('Credito')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${paymentCondition === 'Credito' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                    CRÉDITO
                 </button>
             </div>

             {paymentCondition === 'Credito' && (
                 <div className="animate-in fade-in slide-in-from-top-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Días de Crédito / Vencimiento</label>
                     <div className="flex gap-2 items-center">
                         <div className="relative flex-1">
                             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                             <input 
                                type="number" 
                                value={creditDays} 
                                onChange={e => setCreditDays(Number(e.target.value))}
                                className="w-full pl-9 pr-2 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg font-bold text-slate-700 dark:text-white"
                             />
                         </div>
                         <span className="text-xs font-bold text-slate-400">Días</span>
                     </div>
                     <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1 font-medium">
                         Vence: {new Date(Date.now() + creditDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                     </p>
                 </div>
             )}
         </div>

         <div className="flex-1"></div>

         <button 
           disabled={cart.length === 0}
           onClick={handleProcess}
           className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
         >
            <div className="text-left">
               <div className="text-xs opacity-80 font-medium mb-1">PROCESAR COMPRA</div>
               <div className="text-xl font-bold">S/ {total.toFixed(2)}</div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
               <PackagePlus size={24}/>
            </div>
         </button>
      </div>

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* ... Supplier Modal Content (Same as before) ... */}
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[500px] animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><Truck size={20} className="text-orange-600 dark:text-orange-400"/> Nuevo Proveedor</h3>
                  <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Razón Social</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-orange-500 text-sm outline-none uppercase"
                        placeholder="DISTRIBUIDORA ABC S.A.C."
                        value={newSupplierData.name}
                        onChange={e => setNewSupplierData({...newSupplierData, name: e.target.value})}
                        autoFocus
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">RUC</label>
                          <input 
                             type="text" 
                             className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-orange-500 text-sm outline-none"
                             placeholder="20100000001"
                             value={newSupplierData.ruc}
                             onChange={e => setNewSupplierData({...newSupplierData, ruc: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Teléfono</label>
                          <input 
                             type="text" 
                             className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-orange-500 text-sm outline-none"
                             placeholder="01 222 3333"
                             value={newSupplierData.phone}
                             onChange={e => setNewSupplierData({...newSupplierData, phone: e.target.value})}
                          />
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Dirección</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-orange-500 text-sm outline-none uppercase"
                        placeholder="Av. Industrial 555"
                        value={newSupplierData.address}
                        onChange={e => setNewSupplierData({...newSupplierData, address: e.target.value})}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contacto</label>
                      <input 
                        type="text" 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-orange-500 text-sm outline-none uppercase"
                        placeholder="Nombre del vendedor"
                        value={newSupplierData.contactName}
                        onChange={e => setNewSupplierData({...newSupplierData, contactName: e.target.value})}
                      />
                  </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                 <button onClick={() => setShowSupplierModal(false)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancelar</button>
                 <button 
                    onClick={() => {
                        if(newSupplierData.name) {
                            const newSup: Supplier = {
                                id: Math.random().toString(), 
                                name: newSupplierData.name.toUpperCase(), 
                                ruc: newSupplierData.ruc || '00000000000',
                                phone: newSupplierData.phone,
                                address: newSupplierData.address?.toUpperCase(),
                                contactName: newSupplierData.contactName?.toUpperCase()
                            };
                            onAddSupplier(newSup);
                            setSelectedSupplier(newSup);
                            setSupplierSearchTerm(newSup.name); // Update search input
                            setShowSupplierModal(false);
                            setNewSupplierData({ name: '', ruc: '', phone: '', address: '', contactName: '' });
                        } else {
                            alert("La Razón Social es obligatoria");
                        }
                    }}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 dark:shadow-none transition-colors"
                 >
                    Guardar Proveedor
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseModule;
