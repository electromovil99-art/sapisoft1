
import React, { useState, useRef, useEffect } from 'react';
import { Search, Trash2, Plus, Minus, X, CheckCircle, ShoppingBag, Truck, PackagePlus, Building2, FileText, Calendar, CreditCard, Filter } from 'lucide-react';
import { Product, CartItem, Supplier, Category } from '../types';

interface PurchaseModuleProps {
    products: Product[];
    suppliers: Supplier[];
    categories: Category[]; 
    onAddSupplier: (supplier: Supplier) => void;
    onProcessPurchase: (cart: CartItem[], total: number, docType: string, supplierName: string, paymentCondition: 'Contado' | 'Credito', creditDays: number) => void;
}

const PurchaseModule: React.FC<PurchaseModuleProps> = ({ products, suppliers, categories, onAddSupplier, onProcessPurchase }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(suppliers[0] || null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState(suppliers[0]?.name || '');
  const [docType, setDocType] = useState('FACTURA DE COMPRA');
  const [paymentCondition, setPaymentCondition] = useState<'Contado' | 'Credito'>('Contado');
  const [creditDays, setCreditDays] = useState<number>(30);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({ name: '', ruc: '', phone: '', address: '', contactName: '' });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, discount: 0, total: product.price }]);
    }
  };

  const handleProcess = () => {
      if (cart.length === 0 || !selectedSupplier) return alert("Carrito vacío o proveedor no seleccionado");
      onProcessPurchase(cart, cart.reduce((a,i)=>a+i.total,0), docType, selectedSupplier.name, paymentCondition, creditDays);
      setCart([]);
      alert("Compra registrada correctamente. Stock actualizado.");
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      <div className="flex-1 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 flex gap-4 bg-slate-50/50 dark:bg-slate-700/30">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
             <input type="text" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-xl outline-none" placeholder="Buscar producto a comprar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
           </div>
           {searchTerm && (
                <div className="absolute top-[80px] left-6 bg-white dark:bg-slate-800 border rounded-xl shadow-xl z-50 w-96 max-h-60 overflow-y-auto">
                   {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <div key={p.id} onClick={() => {addToCart(p); setSearchTerm('');}} className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b flex justify-between">
                         <div className="text-sm font-bold text-slate-700 dark:text-white">{p.name}</div>
                         <div className="text-xs text-slate-500">Stock: {p.stock}</div>
                      </div>
                   ))}
                </div>
           )}
        </div>
        <div className="flex-1 overflow-auto p-2">
             <table className="w-full modern-table">
                <thead><tr><th>Producto</th><th className="text-center">Cant.</th><th className="text-right">Costo</th><th className="text-right">Total</th><th></th></tr></thead>
                <tbody>
                   {cart.map(item => (
                      <tr key={item.id}>
                         <td><div className="font-semibold text-slate-700 dark:text-white">{item.name}</div></td>
                         <td className="text-center">{item.quantity}</td>
                         <td className="text-right">S/ {item.price.toFixed(2)}</td>
                         <td className="text-right font-bold">S/ {item.total.toFixed(2)}</td>
                         <td className="text-center"><button onClick={() => setCart(cart.filter(x=>x.id!==item.id))}><Trash2 size={18} className="text-red-500"/></button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
        </div>
      </div>
      <div className="w-80 flex flex-col gap-4 shrink-0">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-1"><Truck size={12}/> Proveedor</label>
            <input list="suppliers" className="w-full p-2 border rounded bg-transparent outline-none text-slate-700 dark:text-white" value={supplierSearchTerm} onChange={e => { setSupplierSearchTerm(e.target.value); const s = suppliers.find(x => x.name === e.target.value); if(s) setSelectedSupplier(s); }} placeholder="Buscar proveedor..."/>
            <datalist id="suppliers">{suppliers.map(s => <option key={s.id} value={s.name}/>)}</datalist>
            <button onClick={() => setShowSupplierModal(true)} className="w-full mt-2 py-2 text-xs border border-dashed rounded text-slate-500 hover:text-orange-500 flex justify-center gap-2"><Plus size={14}/> Nuevo Proveedor</button>
         </div>
         <button onClick={handleProcess} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all font-bold flex justify-center gap-2"><PackagePlus/> Procesar Compra</button>
      </div>
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[400px]">
              <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Nuevo Proveedor</h3>
              <div className="space-y-3">
                  <input type="text" className="w-full p-2 border rounded" placeholder="Razón Social" value={newSupplierData.name} onChange={e => setNewSupplierData({...newSupplierData, name: e.target.value.toUpperCase()})}/>
                  <input type="text" className="w-full p-2 border rounded" placeholder="RUC" value={newSupplierData.ruc} onChange={e => setNewSupplierData({...newSupplierData, ruc: e.target.value})}/>
                  <button onClick={() => { onAddSupplier({id: Math.random().toString(), ...newSupplierData}); setShowSupplierModal(false); }} className="w-full py-2 bg-orange-600 text-white rounded font-bold">Guardar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default PurchaseModule;
