
import React, { useState } from 'react';
import { Plus, Minus, Wallet, Banknote, QrCode, Landmark, CreditCard, LayoutGrid, Eye, FileText, Filter, ArrowRight, TrendingDown, TrendingUp, X, ArrowRightLeft, HelpCircle } from 'lucide-react';
import { CashMovement, PaymentMethodType, BankAccount } from '../types';

interface CashModuleProps {
    movements: CashMovement[];
    onAddMovement: (m: CashMovement) => void;
    bankAccounts: BankAccount[];
    onUniversalTransfer: (fromId: string, toId: string, amount: number, exchangeRate: number, reference: string) => void;
    fixedExpenseCategories: string[];
    fixedIncomeCategories: string[];
    onAddFixedCategory: (category: string, type: 'Ingreso' | 'Egreso') => void;
}

const CashModule: React.FC<CashModuleProps> = ({ movements, onAddMovement, bankAccounts, onUniversalTransfer, fixedExpenseCategories, fixedIncomeCategories, onAddFixedCategory }) => {
  
  const [showMovementModal, setShowMovementModal] = useState<'Ingreso' | 'Egreso' | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewCategoryPrompt, setShowNewCategoryPrompt] = useState<string | null>(null);
  
  // State for Movement Modal
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Efectivo');
  const [bankAccountId, setBankAccountId] = useState('');
  const [reference, setReference] = useState('');

  // State for Transfer Modal
  const [transferData, setTransferData] = useState({ from: 'CASH_BOX', to: '', amount: '', rate: '1', reference: '' });
  
  // State for Filtering
  const [filterMethod, setFilterMethod] = useState<'TODOS' | PaymentMethodType | 'DIGITAL'>('TODOS');
  
  const filteredMovements = movements.filter(m => {
      if (filterMethod === 'TODOS') return true;
      if (filterMethod === 'DIGITAL') return m.paymentMethod !== 'Efectivo';
      return m.paymentMethod === filterMethod;
  });

  const calculateBalance = (method: 'Efectivo' | 'DIGITAL' | 'TODOS') => {
      return movements.reduce((acc, m) => {
          const isTarget = method === 'TODOS' ? true : method === 'DIGITAL' ? m.paymentMethod !== 'Efectivo' : m.paymentMethod === method;
          if (isTarget) return m.type === 'Ingreso' ? acc + m.amount : acc - m.amount;
          return acc;
      }, 0);
  };
  
  const saldoEfectivo = calculateBalance('Efectivo');
  const saldoDigital = calculateBalance('DIGITAL');
  const saldoTotal = saldoEfectivo + saldoDigital;

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

  const handleOpenMovementModal = (type: 'Ingreso' | 'Egreso') => {
      setAmount(''); setConcept(''); setCategory(''); setPaymentMethod('Efectivo');
      setBankAccountId(''); setReference('');
      setShowMovementModal(type);
  };

  const handleCategoryBlur = () => {
      if (!category.trim()) return;
      const allFixed = [...fixedExpenseCategories, ...fixedIncomeCategories];
      if (!allFixed.find(c => c.toLowerCase() === category.toLowerCase())) {
          setShowNewCategoryPrompt(category);
      }
  };

  const handleSaveNewCategory = (isFixed: boolean) => {
      if (isFixed && showNewCategoryPrompt && showMovementModal) {
          onAddFixedCategory(showNewCategoryPrompt.toUpperCase(), showMovementModal);
      }
      setShowNewCategoryPrompt(null);
  };

  const handleSave = () => {
    if (!amount || !concept || !category) return alert("Complete todos los campos.");
    const val = parseFloat(amount);
    if(isNaN(val) || val <= 0) return alert("Monto inválido.");

    if (paymentMethod !== 'Efectivo' && !bankAccountId) {
        return alert("Seleccione la cuenta de destino para el pago digital.");
    }

    const allFixed = [...fixedExpenseCategories, ...fixedIncomeCategories];
    const isFixed = !!allFixed.find(c => c.toLowerCase() === category.toLowerCase());

    onAddMovement({
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        type: showMovementModal!,
        paymentMethod,
        concept: concept.toUpperCase(),
        amount: val,
        user: 'ADMIN',
        category: category.toUpperCase(),
        financialType: isFixed ? 'Fijo' : 'Variable',
        referenceId: reference || undefined,
    });
    setShowMovementModal(null);
  };

  const handleExecuteTransfer = () => {
    const amountNum = parseFloat(transferData.amount);
    const rateNum = parseFloat(transferData.rate || '1');
    if (!transferData.from || !transferData.to) return alert("Seleccione origen y destino.");
    if (isNaN(amountNum) || amountNum <= 0) return alert("Monto inválido.");
    onUniversalTransfer(transferData.from, transferData.to, amountNum, rateNum, transferData.reference);
    setShowTransferModal(false);
  };

  const isDigitalPayment = paymentMethod !== 'Efectivo' && paymentMethod !== 'Saldo Favor';
  const categories = showMovementModal === 'Ingreso' ? fixedIncomeCategories : fixedExpenseCategories;

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase flex items-center gap-1"><Banknote size={14}/> Saldo Efectivo</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">S/ {saldoEfectivo.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase flex items-center gap-1"><Landmark size={14}/> Saldo Bancos / Digital</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">S/ {saldoDigital.toFixed(2)}</p>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Saldo Total</p>
                <p className={`text-3xl font-bold mt-1 ${saldoTotal >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>S/ {saldoTotal.toFixed(2)}</p>
            </div>
        </div>
        <div className="flex gap-6 flex-1 min-h-0">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                    <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><FileText size={18}/> Movimientos</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setShowTransferModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"><ArrowRightLeft size={14}/> Transferir Dinero</button>
                        <button onClick={() => handleOpenMovementModal('Ingreso')} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"><Plus size={16}/> Ingreso</button>
                        <button onClick={() => handleOpenMovementModal('Egreso')} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"><Minus size={16}/> Egreso</button>
                    </div>
                </div>
                <div className="overflow-auto flex-1"><table className="w-full modern-table"><thead><tr><th>Ref. Doc</th><th>Hora</th><th>Tipo</th><th>Método</th><th>Concepto</th><th className="text-right">Monto</th><th className="text-center">Ver</th></tr></thead><tbody>{filteredMovements.map(m => (<tr key={m.id}><td className="font-mono text-slate-500 dark:text-slate-400 text-xs font-bold">{m.referenceId ? `#${m.referenceId}` : '-'}</td><td className="font-mono text-slate-500 dark:text-slate-400 text-xs">{m.time}</td><td><span className={`px-2 py-1 rounded-md text-xs font-bold ${m.type === 'Ingreso' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{m.type.toUpperCase()}</span></td><td><div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">{getMethodIcon(m.paymentMethod)}{m.paymentMethod.toUpperCase()}</div></td><td className="text-slate-700 dark:text-slate-200 font-medium text-xs truncate max-w-[200px]">{m.concept}{m.category && <div className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 rounded px-1 w-fit mt-0.5">{m.financialType} - {m.category}</div>}</td><td className={`text-right font-bold ${m.type === 'Ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{m.type === 'Ingreso' ? '+' : '-'} S/ {m.amount.toFixed(2)}</td><td className="text-center"><button className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"><Eye size={16}/></button></td></tr>))}</tbody></table></div>
            </div>
            {/* ... other components ... */}
        </div>

        {/* Movement Modal */}
        {showMovementModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-[500px] shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className={`px-6 py-4 flex justify-between items-center text-white ${showMovementModal === 'Ingreso' ? 'bg-emerald-600' : 'bg-red-600'}`}><h3 className="font-bold text-lg flex items-center gap-2">{showMovementModal === 'Ingreso' ? <TrendingUp/> : <TrendingDown/>} Registrar {showMovementModal}</h3><button onClick={() => setShowMovementModal(null)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button></div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Categoría</label><input list="categories-list" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white" value={category} onChange={e => setCategory(e.target.value)} onBlur={handleCategoryBlur} placeholder="Seleccione o escriba" autoFocus/><datalist id="categories-list">{categories.map(c => <option key={c} value={c}/>)}</datalist></div>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Monto (S/)</label><input type="number" className="w-full p-2 border rounded-lg text-lg font-bold bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"/></div>
                        </div>
                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Concepto / Detalle</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white" value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. Pago de Alquiler"/></div>
                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Método de Pago</label><select className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethodType)}><option>Efectivo</option><option>Yape</option><option>Plin</option><option>Tarjeta</option><option>Deposito</option></select></div>
                        {isDigitalPayment && (
                            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 animate-in fade-in">
                                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Cuenta Destino</label><select className="w-full p-2 border rounded-lg text-xs" value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}><option value="">-- Seleccionar --</option>{bankAccounts.map(b => <option key={b.id} value={b.id}>{b.alias || b.bankName} ({b.currency})</option>)}</select></div>
                                <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Nro. de Operación</label><input type="text" className="w-full p-2 border rounded-lg text-xs uppercase" value={reference} onChange={e => setReference(e.target.value)}/></div>
                            </div>
                        )}
                        <div className="flex gap-3 pt-2"><button onClick={() => setShowMovementModal(null)} className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">Cancelar</button><button onClick={handleSave} className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${showMovementModal === 'Ingreso' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirmar {showMovementModal}</button></div>
                    </div>
                </div>
            </div>
        )}

        {showNewCategoryPrompt && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-96 shadow-xl text-center">
                    <HelpCircle className="mx-auto text-blue-500 mb-2" size={32}/>
                    <h4 className="font-bold text-slate-800 dark:text-white">Nueva Categoría Detectada</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">La categoría <strong className="text-blue-600">"{showNewCategoryPrompt}"</strong> no existe. ¿Es un movimiento recurrente?</p>
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => handleSaveNewCategory(false)} className="flex-1 py-2 text-slate-600 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">No, es Variable</button>
                        <button onClick={() => handleSaveNewCategory(true)} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Sí, es Fijo</button>
                    </div>
                </div>
            </div>
        )}

        {showTransferModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl w-[500px] shadow-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center"><h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><ArrowRightLeft size={16}/> Transferencia</h3><button onClick={() => setShowTransferModal(false)}><X size={20}/></button></div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Origen</label><select className="w-full p-3 border rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white" value={transferData.from} onChange={e => setTransferData({...transferData, from: e.target.value})}><option value="CASH_BOX">Caja Chica (Efectivo)</option>{bankAccounts.map(b => <option key={b.id} value={b.id}>{b.alias || b.bankName} ({b.currency})</option>)}</select></div>
                            <ArrowRight size={20} className="text-slate-400 mb-3"/>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Destino</label><select className="w-full p-3 border rounded-lg bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white" value={transferData.to} onChange={e => setTransferData({...transferData, to: e.target.value})}><option value="">-- Seleccionar --</option><option value="CASH_BOX">Caja Chica (Efectivo)</option>{bankAccounts.filter(b => b.id !== transferData.from).map(b => <option key={b.id} value={b.id}>{b.alias || b.bankName} ({b.currency})</option>)}</select></div>
                        </div>
                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monto</label><input type="number" className="w-full p-3 border rounded-lg text-lg font-bold bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} placeholder="0.00"/></div>
                        <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Referencia</label><input type="text" className="w-full p-3 border rounded-lg text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white" value={transferData.reference} onChange={e => setTransferData({...transferData, reference: e.target.value})} placeholder="Ej. Depósito BCP"/></div>
                        <button onClick={handleExecuteTransfer} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Confirmar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CashModule;
