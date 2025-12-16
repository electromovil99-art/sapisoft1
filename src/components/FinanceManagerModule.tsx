
import React, { useState } from 'react';
import { Landmark, Receipt, Plus, ArrowRight, TrendingUp, TrendingDown, X } from 'lucide-react';
import { CashMovement, PaymentMethodType } from '../types';

interface FinanceManagerProps {
    activeTab: 'EXPENSES' | 'INCOME';
    cashMovements: CashMovement[];
    onAddCashMovement: (movement: CashMovement) => void;
}

const FinanceManagerModule: React.FC<FinanceManagerProps> = ({ activeTab, cashMovements, onAddCashMovement }) => {
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Efectivo');
    const [modalNature, setModalNature] = useState<'Fijo' | 'Variable'>('Fijo');

    const config = activeTab === 'EXPENSES' ? { type: 'Egreso' as const, nature: 'Fijo' as const, color: 'red', icon: TrendingDown, title: 'Gastos Fijos' } : { type: 'Ingreso' as const, nature: 'Fijo' as const, color: 'emerald', icon: TrendingUp, title: 'Ingresos Fijos' };
    const categories = activeTab === 'EXPENSES' ? ['Alquiler de Local', 'Sueldos Personal', 'Internet / Teléfono', 'Luz / Agua', 'Software / Hosting', 'Pago Préstamo Banco', 'Contador / Legal'] : ['Membresías', 'Alquiler Subarriendo', 'Contratos Servicio Mensual'];
    const variableCategories = activeTab === 'EXPENSES' ? ['Compra Mercadería', 'Comisiones Venta', 'Reparaciones Local', 'Publicidad Facebook/Ads', 'Transporte', 'Útiles Oficina', 'Otros'] : ['Ventas Mostrador', 'Servicios Técnicos', 'Venta de Activos', 'Otros Ingresos'];

    const totalAmount = cashMovements.filter(m => m.type === config.type && m.financialType === config.nature).reduce((acc, m) => acc + m.amount, 0);
    const variableTotal = cashMovements.filter(m => m.type === config.type && m.financialType === 'Variable').reduce((acc, m) => acc + m.amount, 0);

    const handleOpenModal = (nature: 'Fijo' | 'Variable') => { setCategory(''); setDescription(''); setAmount(''); setModalNature(nature); setShowTransactionModal(true); };
    const handleRegisterEntry = () => {
        if (!amount || !description || !category) { alert("Por favor complete monto, descripción y categoría."); return; }
        const newMovement: CashMovement = { id: Math.random().toString(), time: new Date().toLocaleTimeString(), type: config.type, paymentMethod: paymentMethod, concept: description.toUpperCase(), amount: parseFloat(amount), user: 'ADMIN', financialType: modalNature, category: category, referenceId: 'FINANZAS' };
        onAddCashMovement(newMovement); setShowTransactionModal(false);
    };
    const currentModalCategories = modalNature === 'Fijo' ? categories : variableCategories;

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in">
            <div className="flex justify-center items-start pt-10 h-full">
                <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col relative overflow-hidden w-full max-w-2xl transition-colors`}>
                    <div className={`absolute top-0 left-0 w-3 h-full bg-${config.color}-500`}></div>
                    <div className={`p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-${config.color}-50/30 dark:bg-${config.color}-900/10`}>
                        <div><div className="flex items-center gap-3 mb-2"><div className={`p-3 bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400 rounded-xl`}><config.icon size={28}/></div><h3 className="text-2xl font-bold text-slate-800 dark:text-white">{config.title}</h3></div><p className="text-sm text-slate-500 dark:text-slate-400 pl-1">{activeTab === 'EXPENSES' ? 'Costos operativos recurrentes (Mes a Mes).' : 'Entradas de dinero recurrentes o contratos.'}</p></div>
                        <div className="text-right"><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Acumulado {config.nature}</p><p className={`text-4xl font-bold text-${config.color}-600 dark:text-${config.color}-400 mt-1`}>S/ {totalAmount.toFixed(2)}</p><p className="text-xs text-slate-400 mt-2">Variables: S/ {variableTotal.toFixed(2)}</p></div>
                    </div>
                    <div className="flex-1 p-10 flex flex-col items-center justify-center space-y-8">
                        <div className="w-full space-y-4"><h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase text-center mb-2">Categorías Comunes</h4><div className="flex flex-wrap gap-2 justify-center">{categories.map(cat => (<span key={cat} className="px-4 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600">{cat}</span>))}</div></div>
                        <button onClick={() => handleOpenModal('Fijo')} className={`group relative w-full max-w-sm py-5 bg-${config.color}-600 text-white rounded-2xl font-bold shadow-xl shadow-${config.color}-200 dark:shadow-none hover:bg-${config.color}-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg`}><div className="bg-white/20 p-2 rounded-lg group-hover:rotate-90 transition-transform"><Plus size={24}/></div>REGISTRAR {activeTab === 'EXPENSES' ? 'GASTO' : 'INGRESO'} FIJO</button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-700 text-center"><button onClick={() => handleOpenModal('Variable')} className={`text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-${config.color}-600 dark:hover:text-${config.color}-400 flex items-center justify-center gap-2 transition-colors`}>{activeTab === 'EXPENSES' ? '¿Es un gasto variable u ocasional?' : '¿Es un ingreso extra ocasional?'} Regístralo aquí <ArrowRight size={16}/></button></div>
                </div>
            </div>
            {showTransactionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-[450px] shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className={`px-6 py-4 flex justify-between items-center text-white bg-${config.color}-600`}><h3 className="font-bold text-lg flex items-center gap-2"><config.icon size={20}/> Nuevo {config.type} {modalNature}</h3><button onClick={() => setShowTransactionModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={20}/></button></div>
                        <div className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Categoría</label><select className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 outline-none transition-colors" value={category} onChange={e => setCategory(e.target.value)} autoFocus><option value="">-- Seleccionar --</option>{currentModalCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Descripción / Detalle</label><input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 outline-none" placeholder={activeTab === 'EXPENSES' ? "Ej. Pago Luz Diciembre" : "Ej. Alquiler Local B"} value={description} onChange={e => setDescription(e.target.value)}/></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Monto (S/)</label><input type="number" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-lg focus:border-indigo-500 outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}/></div><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Método</label><select className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}><option value="Efectivo">Efectivo</option><option value="Yape">Yape</option><option value="Plin">Plin</option><option value="Tarjeta">Tarjeta</option><option value="Deposito">Depósito</option></select></div></div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex gap-3"><button onClick={() => setShowTransactionModal(false)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancelar</button><button onClick={handleRegisterEntry} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all hover:brightness-110 bg-${config.color}-600`}>Confirmar {config.type}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FinanceManagerModule;
