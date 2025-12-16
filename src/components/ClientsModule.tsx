
import React, { useState } from 'react';
import { Search, UserPlus, Star, ShoppingBag, TrendingUp, ShieldCheck, Wallet, MessageCircle } from 'lucide-react';
import { Client } from '../types';

interface ClientsModuleProps { clients: Client[]; onAddClient: (client: Client) => void; onOpenWhatsApp?: (name: string, phone: string, message?: string) => void; }

const ClientsModule: React.FC<ClientsModuleProps> = ({ clients, onOpenWhatsApp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20}/></div><span className="text-xs font-bold uppercase text-slate-500">Total Compras</span></div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">S/ {clients.reduce((a,c)=>a+(c.totalPurchases||0),0).toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wallet size={20}/></div><span className="text-xs font-bold uppercase text-slate-500">Crédito Uso</span></div>
                <div className="text-2xl font-bold text-red-600">S/ {clients.reduce((a,c)=>a+(c.creditUsed||0),0).toFixed(2)}</div>
            </div>
        </div>

        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input type="text" placeholder="Buscar cliente..." className="pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm w-80 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1">
            <div className="overflow-auto h-full">
                <table className="w-full modern-table">
                    <thead><tr><th>Cliente</th><th>Ubicación</th><th>Ranking</th><th className="text-right">Crédito</th><th className="text-right">Compras</th><th className="text-center">WhatsApp</th></tr></thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="hover:bg-slate-50">
                                <td><div className="font-bold text-slate-700">{client.name}</div><div className="text-xs text-slate-400">{client.dni} {client.phone && `| ${client.phone}`}</div></td>
                                <td className="text-xs text-slate-500">{client.address || '-'}</td>
                                <td><div className="flex text-yellow-400">{[...Array(5)].map((_,i)=><Star key={i} size={12} fill={i<client.paymentScore?"currentColor":"none"} className={i>=client.paymentScore?"text-slate-200":""}/>)}</div></td>
                                <td className="text-right font-mono font-bold">S/ {client.creditLine}</td>
                                <td className="text-right font-bold">S/ {client.totalPurchases}</td>
                                <td className="text-center"><button onClick={() => onOpenWhatsApp && client.phone && onOpenWhatsApp(client.name, client.phone)} className="text-emerald-500 hover:bg-emerald-50 p-2 rounded"><MessageCircle size={18}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
export default ClientsModule;
