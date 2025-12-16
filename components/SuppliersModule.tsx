import React, { useState } from 'react';
import { Truck, Plus, Trash2, Search, MapPin, Phone, FileText } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersModuleProps {
    suppliers: Supplier[];
    onAddSupplier: (s: Supplier) => void;
    onDeleteSupplier: (id: string) => void;
}

const SuppliersModule: React.FC<SuppliersModuleProps> = ({ suppliers, onAddSupplier, onDeleteSupplier }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newSupplier, setNewSupplier] = useState({ name: '', ruc: '', phone: '', address: '', contactName: '' });

    const filteredSuppliers = suppliers.filter(item => 
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ruc && item.ruc.includes(searchTerm))
    );

    const handleAdd = () => {
        if (newSupplier.name) {
            onAddSupplier({ id: Math.random().toString(), ...newSupplier });
            setNewSupplier({ name: '', ruc: '', phone: '', address: '', contactName: '' });
        } else {
            alert("La Razón Social es obligatoria");
        }
    };

    return (
        <div className="flex h-full gap-6">
            
            {/* Left: Form */}
            <div className="w-80 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col shrink-0">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Plus size={20} className="text-orange-500"/> Nuevo Proveedor
                </h3>
                
                <div className="space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Razón Social</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value.toUpperCase()})} placeholder="EJ. COMERCIAL JORGE"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">RUC</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={newSupplier.ruc} onChange={e => setNewSupplier({...newSupplier, ruc: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Teléfono</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Dirección</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre Contacto</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg uppercase" value={newSupplier.contactName} onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})}/>
                    </div>
                </div>
                
                <button onClick={handleAdd} className="w-full py-3 mt-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 dark:shadow-none">
                    Guardar Proveedor
                </button>
            </div>

            {/* Right: List */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-700/30">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg"><Truck size={20}/></div>
                    <div className="flex-1">
                        <h2 className="font-bold text-slate-700 dark:text-white">Directorio de Proveedores</h2>
                        <p className="text-xs text-slate-400">
                            {filteredSuppliers.length} registrados
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input type="text" className="pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-64 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 text-slate-900 dark:text-white placeholder-slate-400" placeholder="Buscar proveedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
                    {filteredSuppliers.map((s) => (
                        <div key={s.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-orange-200 dark:hover:border-orange-900 transition-colors group bg-white dark:bg-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{s.name}</div>
                                <button onClick={() => onDeleteSupplier(s.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                            </div>
                            <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2"><FileText size={14} className="text-slate-400"/> <span className="font-mono">{s.ruc}</span></div>
                                {s.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> <span>{s.phone}</span></div>}
                                {s.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> <span className="text-xs uppercase">{s.address}</span></div>}
                            </div>
                            {s.contactName && (
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Contacto: {s.contactName}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default SuppliersModule;