import React, { useState } from 'react';
// FIX: Replaced ArrowDownRight and ArrowUpRight with TrendingUp and TrendingDown to resolve import errors and improve icon semantics.
import { Plus, Minus, Wallet, Banknote, QrCode, Landmark, CreditCard, LayoutGrid, Eye, FileText, Filter, ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { CashMovement, PaymentMethodType } from '../types';

interface CashModuleProps {
    movements: CashMovement[];
    onAddMovement: (m: CashMovement) => void;
}

const CashModule: React.FC<CashModuleProps> = ({ movements, onAddMovement }) => {
  const [modalType, setModalType] = useState<'Ingreso' | 'Egreso' | null>(null);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Efectivo');
  const [filterMethod, setFilterMethod] = useState<'TODOS' | PaymentMethodType | 'DIGITAL'>('TODOS');
  const [viewDocument, setViewDocument] = useState<CashMovement | null>(null);

  const filteredMovements = movements.filter(m => {
      if (filterMethod === 'TODOS') return true;
      if (filterMethod === 'DIGITAL') return m.paymentMethod !== 'Efectivo';
      return m.paymentMethod === filterMethod;
  });

  const calculateBalance = (method: PaymentMethodType | 'DIGITAL' | 'TODOS') => {
      return movements.reduce((acc, m) => {
          const isTarget = method === 'TODOS' ? true : method === 'DIGITAL' ? m.paymentMethod !== 'Efectivo' : m.paymentMethod === method;
          if (isTarget) return m.type === 'Ingreso' ? acc + m.amount : acc - m.amount;
          return acc;
      }, 0);
  };
  
  const displayedSaldoEfectivo = filterMethod === 'TODOS' || filterMethod === 'Efectivo' ? calculateBalance('Efectivo') : 0;
  const displayedSaldoDigital = filterMethod === 'TODOS' || filterMethod === 'DIGITAL' || filterMethod !== 'Efectivo' ? calculateBalance('DIGITAL') : 0;
  const currentTotal = filteredMovements.reduce((acc, m) => m.type === 'Ingreso' ? acc + m.amount : acc - m.amount, 0);

  const getMethodIcon = (method: PaymentMethodType) => {
      switch(method) {
          case 'Efectivo': return <Banknote size={14} className="text-emerald-600 dark:text-emerald-400"/>;
          case 'Yape': return <QrCode size={14} className="text-purple-600 dark:text-purple-400"/>;
          case 'Plin': return <QrCode size={14} className="text-sky-500 dark:text-sky-400"/>;
          case 'Tarjeta': return <CreditCard size={14} className="text-blue-600 dark:text-blue-400"/>;
          case 'Deposito': return <Landmark size={14} className="text-slate-600 dark:text-slate-400"/>;
          default: return <Banknote size={14}/>;
      }
  };

  const handleSave = () => {
    if (!amount || !concept) return;
    const val = parseFloat(amount);
    if(isNaN(val) || val <= 0) return;

    onAddMovement({
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        type: modalType!,
        paymentMethod,
        concept: concept.toUpperCase(),
        amount: val,
        user: 'ADMIN', // Should come from session in real app
        category: 'Manual',
        financialType: 'Variable'
    });
    setModalType(null);
    setConcept('');
    setAmount('');
};

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border transition-all ${filterMethod === 'Efectivo' ? 'ring-2 ring-emerald-400 border-emerald-400' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="flex justify-between items-start"><div><p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Banknote size={14}/> Saldo Efectivo</p><p className="text-3xl font-bold text-slate-800 dark:text-white">S/ {displayedSaldoEfectivo.toFixed(2)}</p></div><div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Wallet/></div></div>
            </div>
            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border transition-all ${filterMethod === 'DIGITAL' ? 'ring-2 ring-blue-400 border-blue-400' : 'border-slate-100 dark:border-slate-700'}`}>
                <div className="flex justify-between items-start"><div><p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Landmark size={14}/> Saldo Bancos / Digital</p><p className="text-3xl font-bold text-slate-800 dark:text-white">S/ {displayedSaldoDigital.toFixed(2)}</p></div><div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><QrCode/></div></div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between ring-1 ring-primary-100 dark:ring-primary-900">
                <div><p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Saldo Total (Vista Actual)</p><p className={`text-3xl font-bold ${currentTotal >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500 dark:text-red-400'}`}>S/ {(currentTotal).toFixed(2)}</p></div><div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl"><LayoutGrid/></div>
            </div>
        </div>
        <div className="flex gap-6 flex-1 min-h-0">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30"><h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><FileText size={18}/> Movimientos</h3><div className="flex gap-2"><button onClick={() => setModalType('Ingreso')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"><Plus size={16}/> Ingreso</button><button onClick={() => setModalType('Egreso')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"><Minus size={16}/> Egreso</button></div></div>
                <div className="overflow-auto flex-1"><table className="w-full modern-table"><thead className="sticky top-0 z-10"><tr><th>Ref. Doc</th><th>Hora</th><th>Tipo</th><th>Método</th><th>Concepto</th><th className="text-right">Monto</th><th className="text-center">Ver</th></tr></thead><tbody>{filteredMovements.map(m => (<tr key={m.id}><td className="font-mono text-slate-500 dark:text-slate-400 text-xs font-bold">{m.referenceId ? `#${m.referenceId}` : '-'}</td><td className="font-mono text-slate-500 dark:text-slate-400 text-xs">{m.time}</td><td><span className={`px-2 py-1 rounded-md text-xs font-bold ${m.type === 'Ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{m.type.toUpperCase()}</span></td><td><div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">{getMethodIcon(m.paymentMethod)}{m.paymentMethod.toUpperCase()}</div></td><td className="text-slate-700 dark:text-slate-200 font-medium text-xs truncate max-w-[200px]">{m.concept}{m.category && <div className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 rounded px-1 w-fit mt-0.5">{m.financialType} - {m.category}</div>}</td><td className={`text-right font-bold ${m.type === 'Ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{m.type === 'Ingreso' ? '+' : '-'} S/ {m.amount.toFixed(2)}</td><td className="text-center"><button className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1" title="Ver Documento"><Eye size={16}/></button></td></tr>))}</tbody></table></div>
            </div>
            <div className="w-72 flex flex-col gap-4 shrink-0"><div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"><h3 className="text-sm font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide"><Filter size={16}/> Arqueo / Filtros</h3><div className="space-y-2"><button onClick={() => setFilterMethod('TODOS')} className={`w-full flex justify-between items-center p-3 rounded-lg text-xs font-bold transition-all ${filterMethod === 'TODOS' ? 'bg-slate-800 text-white shadow-lg dark:bg-slate-600' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><span>Todos</span><span>S/ {calculateBalance('TODOS').toFixed(2)}</span></button><div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div><button onClick={() => setFilterMethod('Efectivo')} className={`w-full flex justify-between items-center p-3 rounded-lg text-xs font-bold transition-all ${filterMethod === 'Efectivo' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'}`}><span className="flex items-center gap-2"><Banknote size={14}/> Efectivo</span><span>S/ {calculateBalance('Efectivo').toFixed(2)}</span></button><button onClick={() => setFilterMethod('DIGITAL')} className={`w-full flex justify-between items-center p-3 rounded-lg text-xs font-bold transition-all ${filterMethod === 'DIGITAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}><span className="flex items-center gap-2"><QrCode size={14}/> Digital (Global)</span><span>S/ {calculateBalance('DIGITAL').toFixed(2)}</span></button></div></div></div>
        </div>

        {/* Modal Entry */}
        {modalType && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-[400px] border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        {/* FIX: Replaced icons with ones that better represent income (TrendingUp) and expenses (TrendingDown). */}
                        {modalType === 'Ingreso' ? <TrendingUp className="text-emerald-500"/> : <TrendingDown className="text-red-500"/>}
                        Registrar {modalType}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monto</label>
                            <input type="number" autoFocus className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl text-xl font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Concepto</label>
                            <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. Pago de Luz"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Método</label>
                            <select className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Yape">Yape</option>
                                <option value="Plin">Plin</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Deposito">Depósito</option>
                            </select>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setModalType(null)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Cancelar</button>
                            <button onClick={handleSave} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${modalType === 'Ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const CreditCardIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);

// FIX: Add default export to the component.
export default CashModule;
