import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit, Save, X, Package, BarChart, RotateCcw, Filter } from 'lucide-react';
import { Product, Brand, Category } from '../types';

interface InventoryProps {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const InventoryModule: React.FC<InventoryProps> = ({ products, brands, categories, onUpdateProduct, onAddProduct, onDeleteProduct }) => {
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // UI States for "Create New" toggles
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewBrand, setIsNewBrand] = useState(false);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '', name: '', category: '', brand: '', price: 0, stock: 0, location: ''
  });

  const filteredProducts = products.filter(p => {
    const matchesText = p.name.toLowerCase().includes(filterText.toLowerCase()) || p.code.includes(filterText);
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesText && matchesCategory;
  });

  const handleOpenModal = () => {
      setNewProduct({ code: '', name: '', category: '', brand: '', price: 0, stock: 0, location: '' });
      setIsNewCategory(false);
      setIsNewBrand(false);
      setShowModal(true);
  };

  const handleSave = () => {
    if (!newProduct.code || !newProduct.name) return;
    onAddProduct({ ...newProduct, category: newProduct.category || 'GENERAL', id: Math.random().toString() } as Product);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
         <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                   type="text" 
                   className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-64 focus:bg-white dark:focus:bg-slate-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-50 dark:focus:ring-primary-900/30 text-slate-900 dark:text-white transition-all"
                   placeholder="Buscar artículo..."
                   value={filterText}
                   onChange={e => setFilterText(e.target.value)}
                />
             </div>
             
             {/* Category Filter */}
             <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                 <select 
                    className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm appearance-none outline-none focus:bg-white dark:focus:bg-slate-600 cursor-pointer min-w-[150px] text-slate-700 dark:text-white"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                 >
                     <option value="">Todas las Categorías</option>
                     {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                 </select>
             </div>
         </div>

         <button 
           onClick={handleOpenModal} 
           className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-primary-200 dark:shadow-none hover:bg-primary-700 transition-colors flex items-center gap-2"
         >
            <Plus size={16}/> Nuevo Producto
         </button>
      </div>

      {/* Modern Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-1">
         <div className="overflow-auto h-full">
            <table className="w-full modern-table">
               <thead className="sticky top-0 z-10">
                  <tr>
                     <th>Código</th>
                     <th>Descripción</th>
                     <th>Categoría</th>
                     <th>Marca</th>
                     <th className="text-center">Ubicación</th>
                     <th className="text-right">Stock</th>
                     <th className="text-right">Precio</th>
                     <th className="text-center"></th>
                  </tr>
               </thead>
               <tbody>
                  {filteredProducts.map(p => (
                     <tr key={p.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="font-mono text-slate-500 dark:text-slate-400 text-xs">{p.code}</td>
                        <td className="font-medium text-slate-700 dark:text-white">{p.name}</td>
                        <td>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">{p.category}</span>
                        </td>
                        <td className="text-slate-500 dark:text-slate-400">{p.brand}</td>
                        <td className="text-center text-slate-500 dark:text-slate-400">{p.location || '-'}</td>
                        <td className="text-right">
                            <span className={`font-bold px-2 py-1 rounded-md text-xs ${p.stock < 5 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                {p.stock} un.
                            </span>
                        </td>
                        <td className="text-right font-bold text-slate-800 dark:text-white">S/ {p.price.toFixed(2)}</td>
                        <td className="text-center">
                            <button onClick={() => onDeleteProduct(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                <Trash2 size={16}/>
                            </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[500px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Agregar Producto</h3>
                    <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Código</label>
                            <input type="text" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} placeholder="SKU/Cod." autoFocus/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Marca</label>
                            <div className="flex gap-2">
                                {isNewBrand ? (
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase focus:border-primary-500 outline-none animate-in fade-in slide-in-from-left-2" 
                                        value={newProduct.brand} 
                                        onChange={e => setNewProduct({...newProduct, brand: e.target.value})} 
                                        placeholder="Nueva Marca"
                                        autoFocus
                                    />
                                ) : (
                                    <select 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg uppercase bg-white dark:bg-slate-700 text-slate-700 dark:text-white outline-none" 
                                        value={newProduct.brand} 
                                        onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    </select>
                                )}
                                <button 
                                    onClick={() => { setIsNewBrand(!isNewBrand); setNewProduct({...newProduct, brand: ''}) }} 
                                    className={`p-2 rounded-lg border transition-colors ${isNewBrand ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'}`}
                                    title={isNewBrand ? "Volver a lista" : "Crear nueva marca"}
                                >
                                    {isNewBrand ? <RotateCcw size={18}/> : <Plus size={18}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre / Descripción</label>
                        <input type="text" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ej. PANTALLA A50 ORIGINAL"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Categoría</label>
                            <div className="flex gap-2">
                                {isNewCategory ? (
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase focus:border-primary-500 outline-none animate-in fade-in slide-in-from-left-2" 
                                        value={newProduct.category} 
                                        onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                                        placeholder="Nueva Categoría"
                                        autoFocus
                                    />
                                ) : (
                                    <select 
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg uppercase bg-white dark:bg-slate-700 text-slate-700 dark:text-white outline-none" 
                                        value={newProduct.category} 
                                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                )}
                                <button 
                                    onClick={() => { setIsNewCategory(!isNewCategory); setNewProduct({...newProduct, category: ''}) }} 
                                    className={`p-2 rounded-lg border transition-colors ${isNewCategory ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500' : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'}`}
                                    title={isNewCategory ? "Volver a lista" : "Crear nueva categoría"}
                                >
                                    {isNewCategory ? <RotateCcw size={18}/> : <Plus size={18}/>}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ubicación</label>
                            <input type="text" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newProduct.location} onChange={e => setNewProduct({...newProduct, location: e.target.value})} placeholder="Ej. EST-1"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Stock</label>
                            <input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} placeholder="0"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Precio (S/)</label>
                            <input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} placeholder="0.00"/>
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full mt-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md shadow-primary-200 dark:shadow-none">Guardar Producto</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default InventoryModule;