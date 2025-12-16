
import React, { useState } from 'react';
import { Smartphone, Search, Wrench, X, User, Phone, Package, Plus, Trash2, CheckCircle, Printer, MessageCircle, MoreVertical, CheckSquare, CornerUpLeft } from 'lucide-react';
import { ServiceOrder, Product, PaymentBreakdown, Category, Client, BankAccount } from '../types';

interface ServicesProps {
  services: ServiceOrder[];
  products: Product[]; 
  categories: Category[]; 
  bankAccounts: BankAccount[]; 
  onAddService: (service: ServiceOrder) => void;
  onFinalizeService: (serviceId: string, total: number, finalStatus: 'Entregado' | 'Devolucion', paymentBreakdown: PaymentBreakdown) => void;
  onMarkRepaired: (serviceId: string) => void;
  clients?: Client[]; 
  onOpenWhatsApp?: (name: string, phone: string, message?: string) => void;
}

const ServicesModule: React.FC<ServicesProps> = ({ services, products, categories, onAddService, onFinalizeService, onMarkRepaired, clients, onOpenWhatsApp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [newOrder, setNewOrder] = useState<Partial<ServiceOrder>>({
      client: '', clientPhone: '', deviceModel: '', issue: '', cost: 0, technician: '', receptionist: 'ADMIN', usedProducts: []
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.client.toLowerCase().includes(searchTerm.toLowerCase()) || s.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveOrder = () => {
      if(!newOrder.client || !newOrder.deviceModel) return alert("Datos incompletos");
      onAddService({
          id: Math.floor(Math.random() * 100000).toString(),
          entryDate: new Date().toLocaleDateString(),
          entryTime: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          client: newOrder.client.toUpperCase(),
          clientPhone: newOrder.clientPhone, 
          deviceModel: newOrder.deviceModel.toUpperCase(),
          issue: newOrder.issue || '',
          status: 'Pendiente',
          technician: newOrder.technician || 'POR ASIGNAR',
          receptionist: 'ADMIN',
          cost: Number(newOrder.cost),
          usedProducts: newOrder.usedProducts || [],
          color: '#ef4444'
      });
      setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
       <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Todos', 'Pendiente', 'Reparado', 'Entregado'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${statusFilter === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{status}</button>
          ))}
       </div>

       <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2 uppercase tracking-wide"><Wrench className="text-primary-500" size={18}/> Ordenes de Servicio</h2>
              <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                  <input type="text" placeholder="Buscar..." className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs w-64 focus:bg-white dark:focus:bg-slate-600 outline-none dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-700 shadow-sm flex items-center gap-2"><Smartphone size={14}/> Nueva Recepción</button>
       </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-1">
            <div className="overflow-visible h-full">
                <table className="w-full text-xs modern-table">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-700">
                        <tr><th>Orden</th><th>Cliente / Equipo</th><th>Falla / Detalle</th><th>Estado</th><th className="text-right">Costo</th><th className="text-center"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredServices.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-4 py-3 font-mono font-bold text-primary-600">#{s.id}</td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-800 dark:text-white">{s.client}</div>
                                    <div className="text-slate-500 dark:text-slate-400">{s.deviceModel}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{s.issue}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold border ${s.status === 'Pendiente' ? 'bg-red-50 text-red-600 border-red-200' : s.status === 'Reparado' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{s.status}</span></td>
                                <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-white">S/ {s.cost.toFixed(2)}</td>
                                <td className="px-4 py-3 text-center relative">
                                    <button onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><MoreVertical size={16}/></button>
                                    {openMenuId === s.id && (
                                        <div className="absolute right-8 top-0 bg-white dark:bg-slate-800 shadow-xl rounded-lg z-50 border border-slate-100 w-40 text-left overflow-hidden">
                                            {s.status === 'Pendiente' && <button onClick={() => onMarkRepaired(s.id)} className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-blue-600 flex gap-2"><CheckSquare size={14}/> Reparado</button>}
                                            {s.status === 'Reparado' && <button onClick={() => onFinalizeService(s.id, s.cost, 'Entregado', {cash: s.cost, yape:0, card:0, bank:0})} className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-emerald-600 flex gap-2"><CheckCircle size={14}/> Entregar</button>}
                                            <button onClick={() => onOpenWhatsApp && onOpenWhatsApp(s.client, s.clientPhone || '', `Su equipo ${s.deviceModel} está listo.`)} className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-emerald-500 flex gap-2"><MessageCircle size={14}/> WhatsApp</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
       </div>

       {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[600px] animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Nueva Recepción</h3>
                    <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold uppercase text-slate-500">Cliente</label><input type="text" className="w-full p-2 border rounded-lg uppercase" value={newOrder.client} onChange={e => setNewOrder({...newOrder, client: e.target.value})} autoFocus/></div>
                        <div><label className="text-xs font-bold uppercase text-slate-500">Teléfono</label><input type="text" className="w-full p-2 border rounded-lg" value={newOrder.clientPhone} onChange={e => setNewOrder({...newOrder, clientPhone: e.target.value})}/></div>
                    </div>
                    <div><label className="text-xs font-bold uppercase text-slate-500">Equipo / Modelo</label><input type="text" className="w-full p-2 border rounded-lg uppercase" value={newOrder.deviceModel} onChange={e => setNewOrder({...newOrder, deviceModel: e.target.value})}/></div>
                    <div><label className="text-xs font-bold uppercase text-slate-500">Falla / Problema</label><textarea className="w-full p-2 border rounded-lg uppercase" value={newOrder.issue} onChange={e => setNewOrder({...newOrder, issue: e.target.value})}></textarea></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold uppercase text-slate-500">Costo Estimado</label><input type="number" className="w-full p-2 border rounded-lg" value={newOrder.cost} onChange={e => setNewOrder({...newOrder, cost: Number(e.target.value)})}/></div>
                        <div><label className="text-xs font-bold uppercase text-slate-500">Técnico</label><select className="w-full p-2 border rounded-lg" onChange={e => setNewOrder({...newOrder, technician: e.target.value})}><option>Isaac Quille</option><option>Otro</option></select></div>
                    </div>
                    <button onClick={handleSaveOrder} className="w-full py-3 bg-primary-600 text-white font-bold rounded-lg shadow-lg">Generar Orden</button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
};
export default ServicesModule;
