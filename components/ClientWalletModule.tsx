import React, { useState } from 'react';
import { Search, Wallet, TrendingUp, TrendingDown, ArrowRight, User, Plus, X, UserPlus } from 'lucide-react';
import { Client, CashMovement, GeoLocation } from '../types';

interface ClientWalletProps {
    clients: Client[];
    locations: GeoLocation[];
    onUpdateClientBalance: (clientId: string, amountChange: number, reason: string) => void;
    onAddClient: (client: Client) => void;
}

const ClientWalletModule: React.FC<ClientWalletProps> = ({ clients, locations, onUpdateClientBalance, onAddClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [transactionType, setTransactionType] = useState<'Deposit' | 'Withdraw'>('Deposit');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Client Creation State
    const [showClientModal, setShowClientModal] = useState(false);
    const [newClientData, setNewClientData] = useState({ 
        name: '', dni: '', phone: '', address: '', email: '',
        department: '', province: '', district: '' 
    });

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.dni.includes(searchTerm)
    );

    // Locations Logic for Client Modal
    const departments = locations.filter(l => l.type === 'DEP');
    const provinces = locations.filter(l => l.type === 'PROV' && l.parentId === (departments.find(d => d.name === newClientData.department)?.id));
    const districts = locations.filter(l => l.type === 'DIST' && l.parentId === (locations.find(p => p.type === 'PROV' && p.name === newClientData.province && p.parentId === (departments.find(d => d.name === newClientData.department)?.id))?.id));

    const handleOpenTransaction = (client: Client, type: 'Deposit' | 'Withdraw') => {
        setSelectedClient(client);
        setTransactionType(type);
        setAmount('');
        setReason('');
        setShowModal(true);
    };

    const handleExecuteTransaction = () => {
        if (!amount || !reason || !selectedClient) return alert("Complete los datos");
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return alert("Monto inválido");

        if (transactionType === 'Withdraw' && val > selectedClient.digitalBalance) {
            return alert("Saldo insuficiente");
        }

        const change = transactionType === 'Deposit' ? val : -val;
        onUpdateClientBalance(selectedClient.id, change, reason);
        setShowModal(false);
    };

    const handleOpenClientModal = () => {
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
            digitalBalance: 0 
        };
        onAddClient(newClient);
        setSelectedClient(newClient); // Select immediately
        setShowClientModal(false);
    };

    return (
        <div className="flex h-full gap-6">
            {/* List */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Wallet className="text-blue-500"/> Billeteras de Clientes
                    </h3>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={handleOpenClientModal} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors" title="Crear Nuevo Cliente">
                            <UserPlus size={18}/>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredClients.map(client => (
                        <div key={client.id} onClick={() => setSelectedClient(client)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedClient?.id === client.id ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white border-slate-100 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">{client.name}</div>
                                    <div className="text-xs text-slate-400">{client.dni}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${client.digitalBalance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                        S/ {client.digitalBalance.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Saldo</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center">
                {selectedClient ? (
                    <div className="w-full max-w-lg">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                                <User size={40}/>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedClient.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400">DNI: {selectedClient.dni}</p>
                            {selectedClient.district && <p className="text-xs text-slate-400 mt-1">{selectedClient.department} - {selectedClient.province} - {selectedClient.district}</p>}
                            <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-400 uppercase mb-1">Saldo Disponible</p>
                                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">S/ {selectedClient.digitalBalance.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleOpenTransaction(selectedClient, 'Deposit')} className="py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                <TrendingUp size={20}/> Recargar Saldo
                            </button>
                            <button onClick={() => handleOpenTransaction(selectedClient, 'Withdraw')} className="py-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
                                <TrendingDown size={20}/> Retirar / Devolver
                            </button>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center text-slate-400 text-sm">
                            <p>Historial de transacciones no disponible en esta vista preliminar.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400">
                        <Wallet size={64} className="mx-auto mb-4 opacity-50"/>
                        <p>Seleccione un cliente para gestionar su billetera.</p>
                    </div>
                )}
            </div>

            {/* Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-[400px] rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                {transactionType === 'Deposit' ? 'Recargar Saldo' : 'Retirar Fondos'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monto (S/)</label>
                                <input type="number" autoFocus className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl text-2xl font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:border-blue-500" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Motivo / Referencia</label>
                                <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej. Depósito en efectivo"/>
                            </div>
                            {transactionType === 'Deposit' && (
                                <p className="text-xs text-blue-500 flex items-center gap-1"><Plus size={12}/> Esto generará un Ingreso de Caja.</p>
                            )}
                            {transactionType === 'Withdraw' && (
                                <p className="text-xs text-red-500 flex items-center gap-1"><ArrowRight size={12}/> Esto generará un Egreso de Caja.</p>
                            )}
                            <button onClick={handleExecuteTransaction} className={`w-full py-3 text-white font-bold rounded-xl mt-2 ${transactionType === 'Deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                Confirmar Transacción
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Client Creation Modal (Reused Logic) */}
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
                            <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none uppercase" placeholder="Ej. JUAN PEREZ" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">DNI / RUC</label>
                                <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none" placeholder="00000000" value={newClientData.dni} onChange={e => setNewClientData({...newClientData, dni: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Teléfono / Celular</label>
                                <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none" placeholder="999 999 999" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Dirección</label>
                            <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:border-primary-500 text-sm outline-none uppercase" placeholder="Av. La Cultura 123" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} />
                        </div>
                        
                        {/* Location Selectors */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Departamento</label>
                                <select className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs" value={newClientData.department} onChange={e => setNewClientData({...newClientData, department: e.target.value, province: '', district: ''})}>
                                    <option value="">-- SELECCIONAR --</option>
                                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Provincia</label>
                                <select className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs" value={newClientData.province} onChange={e => setNewClientData({...newClientData, province: e.target.value, district: ''})} disabled={!newClientData.department}>
                                    <option value="">-- SELECCIONAR --</option>
                                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Distrito</label>
                                <select className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs" value={newClientData.district} onChange={e => setNewClientData({...newClientData, district: e.target.value})} disabled={!newClientData.province}>
                                    <option value="">-- SELECCIONAR --</option>
                                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button onClick={() => setShowClientModal(false)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors">Cancelar</button>
                        <button onClick={handleSaveNewClient} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-colors">Guardar Cliente</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default ClientWalletModule;