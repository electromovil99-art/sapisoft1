
import React, { useState } from 'react';
import { Landmark, Plus, Trash2, Search, Building2, CreditCard } from 'lucide-react';
import { BankAccount } from '../types';

interface BankAccountsModuleProps {
    bankAccounts: BankAccount[];
    onAddBankAccount: (b: BankAccount) => void;
    onDeleteBankAccount: (id: string) => void;
}

const BankAccountsModule: React.FC<BankAccountsModuleProps> = ({ bankAccounts, onAddBankAccount, onDeleteBankAccount }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', currency: 'PEN', alias: '' });

    const filteredBanks = bankAccounts.filter(item => (item.bankName && item.bankName.toLowerCase().includes(searchTerm.toLowerCase())) || (item.alias && item.alias.toLowerCase().includes(searchTerm.toLowerCase())));

    const handleAdd = () => {
        if (newBank.bankName && newBank.accountNumber) {
            onAddBankAccount({ id: Math.random().toString(), ...newBank } as BankAccount);
            setNewBank({ bankName: '', accountNumber: '', currency: 'PEN', alias: '' });
        } else { alert("Banco y Nro de Cuenta son obligatorios"); }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-80 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col shrink-0">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Plus size={20} className="text-emerald-500 dark:text-emerald-400"/> Nueva Cuenta</h3>
                <div className="space-y-4 flex-1">
                    <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Entidad Bancaria</label><input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg outline-none focus:border-emerald-500 transition-colors" value={newBank.bankName} onChange={e => setNewBank({...newBank, bankName: e.target.value})} placeholder="Ej. BCP, INTERBANK"/></div>
                    <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nro. Cuenta / CCI</label><input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg outline-none focus:border-emerald-500 transition-colors" value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})}/></div>
                    <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Moneda</label><select className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg outline-none focus:border-emerald-500 transition-colors" value={newBank.currency} onChange={e => setNewBank({...newBank, currency: e.target.value as any})}><option value="PEN">Soles (PEN)</option><option value="USD">Dólares (USD)</option></select></div>
                    <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Titular / Alias</label><input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg outline-none focus:border-emerald-500 transition-colors" value={newBank.alias} onChange={e => setNewBank({...newBank, alias: e.target.value})} placeholder="Ej. Cuenta Principal"/></div>
                </div>
                <button onClick={handleAdd} className="w-full py-3 mt-6 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 dark:shadow-none">Guardar Cuenta</button>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-700/30">
                     <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Landmark size={20}/></div>
                     <div className="flex-1"><h2 className="font-bold text-slate-700 dark:text-white">Cuentas Bancarias</h2><p className="text-xs text-slate-400">{filteredBanks.length} cuentas registradas</p></div>
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input type="text" className="pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-colors" placeholder="Buscar banco..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
                </div>
                <div className="flex-1 overflow-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 content-start">
                    {filteredBanks.map((b) => (
                        <div key={b.id} className="relative overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50">
                            <div className="absolute right-0 top-0 p-4 opacity-10 dark:opacity-5"><Building2 size={64} className="dark:text-white"/></div>
                            <div className="flex justify-between items-start mb-4 relative z-10"><div><div className="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-2">{b.bankName}<span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.currency === 'PEN' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{b.currency}</span></div><div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.alias}</div></div><button onClick={() => onDeleteBankAccount(b.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button></div>
                            <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-3 rounded-lg flex items-center gap-3 relative z-10 shadow-sm"><CreditCard size={20} className="text-slate-400 dark:text-slate-500"/><span className="font-mono text-lg font-bold text-slate-600 dark:text-slate-200 tracking-wider">{b.accountNumber}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default BankAccountsModule;
