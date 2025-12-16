import React, { useState } from 'react';
import { Search, UserPlus, Filter, Star, CreditCard, ShoppingBag, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Wallet, MessageCircle } from 'lucide-react';
import { Client } from '../types';

interface ClientsModuleProps {
    clients: Client[];
    onAddClient: (client: Client) => void;
    onOpenWhatsApp?: (name: string, phone: string, message?: string) => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ clients, onAddClient, onOpenWhatsApp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rankingFilter, setRankingFilter] = useState<'all' | 'vip' | 'good' | 'risk'>('all');
  
  // Logic for Dashboard Stats
  const totalClients = clients.length;
  const activeCredit = clients.reduce((acc, c) => acc + (c.creditUsed || 0), 0);
  const totalPurchases = clients.reduce((acc, c) => acc + (c.totalPurchases || 0), 0);
  const bestClient = [...clients].sort((a,b) => b.totalPurchases - a.totalPurchases)[0];

  // Filtering Logic
  const filteredClients = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.dni.includes(searchTerm);
      
      let matchesRank = true;
      if (rankingFilter === 'vip') matchesRank = client.paymentScore === 5;
      if (rankingFilter === 'good') matchesRank = client.paymentScore >= 3 && client.paymentScore < 5;
      if (rankingFilter === 'risk') matchesRank = client.paymentScore <= 2;

      return matchesSearch && matchesRank;
  });

  // Helper to render stars
  const renderStars = (score: number) => {
      return (
          <div className="flex text-yellow-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < score ? "currentColor" : "none"} className={i < score ? "" : "text-slate-200"} />
              ))}
          </div>
      );
  };

  return (
    <div className="flex flex-col gap-6 h-full">
        
        {/* Clients Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><ShoppingBag size={20}/></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Compras Totales</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">S/ {totalPurchases.toLocaleString()}</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><Wallet size={20}/></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Crédito en Uso</span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">S/ {activeCredit.toLocaleString()}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp size={20}/></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Mejor Cliente</span>
                </div>
                <div className="text-sm font-bold text-slate-800 dark:text-white truncate" title={bestClient?.name}>{bestClient?.name || '---'}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">S/ {bestClient?.totalPurchases.toLocaleString()}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><ShieldCheck size={20}/></div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Cartera Total</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalClients} <span className="text-sm text-slate-400 font-medium">Clientes</span></div>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Buscar cliente por nombre o DNI..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-80 focus:bg-white dark:focus:bg-slate-600 focus:border-primary-500 transition-all text-slate-800 dark:text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
                    <button onClick={() => setRankingFilter('all')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${rankingFilter === 'all' ? 'bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>Todos</button>
                    <button onClick={() => setRankingFilter('vip')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${rankingFilter === 'vip' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}><Star size={12}/> VIP</button>
                    <button onClick={() => setRankingFilter('risk')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${rankingFilter === 'risk' ? 'bg-white dark:bg-slate-600 shadow text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'}`}><AlertTriangle size={12}/> Riesgo</button>
                </div>
            </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-1">
            <div className="overflow-auto h-full">
                <table className="w-full modern-table">
                    <thead className="sticky top-0 z-10">
                        <tr>
                            <th>Cliente / Contacto</th>
                            <th>Ubicación</th>
                            <th>Ranking / Puntuación</th>
                            <th className="text-right">Linea Crédito</th>
                            <th className="text-right">Compras Totales</th>
                            <th className="text-right">Estado Deuda</th>
                            <th className="text-center w-16">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredClients.map(client => (
                            <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs shrink-0">
                                            {client.name.substring(0,2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700 dark:text-white text-xs">{client.name}</div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                                <span>DNI: {client.dni}</span>
                                                {client.phone && <span className="text-slate-300">|</span>}
                                                {client.phone && <span>{client.phone}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {client.tags?.map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="text-xs text-slate-500 dark:text-slate-400">{client.address || '-'}</td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        {renderStars(client.paymentScore)}
                                        <span className={`text-[10px] font-bold ${client.paymentScore >= 4 ? 'text-emerald-500 dark:text-emerald-400' : client.paymentScore <= 2 ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-500'}`}>
                                            {client.paymentScore >= 4 ? 'Excelente Pagador' : client.paymentScore <= 2 ? 'Riesgo Alto' : 'Regular'}
                                        </span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="font-mono font-bold text-slate-700 dark:text-white text-xs">S/ {client.creditLine.toLocaleString()}</div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 mt-1">
                                        <div 
                                            className={`h-1 rounded-full ${client.creditUsed / client.creditLine > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                            style={{ width: `${Math.min((client.creditUsed / client.creditLine) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">S/ {client.totalPurchases.toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-400">Ult: {client.lastPurchaseDate || '-'}</div>
                                </td>
                                <td className="text-right">
                                    {client.creditUsed > 0 ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                            - S/ {client.creditUsed.toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-emerald-500 font-medium">Al día</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <button 
                                        onClick={() => onOpenWhatsApp && client.phone ? onOpenWhatsApp(client.name, client.phone) : alert('Sin teléfono')} 
                                        className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
                                        title="Contactar por WhatsApp"
                                    >
                                        <MessageCircle size={16}/>
                                    </button>
                                </td>
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