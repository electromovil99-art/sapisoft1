
import React, { useState, useRef } from 'react';
import { Search, FileMinus, RotateCcw, AlertTriangle, CheckCircle, Package, ArrowRight, X, Banknote, QrCode, CreditCard, Landmark, Wallet, List } from 'lucide-react';
import { SaleRecord, PaymentMethodType, PaymentBreakdown } from '../types';

interface CreditNoteModuleProps {
    salesHistory: SaleRecord[];
    onProcessCreditNote: (originalSaleId: string, itemsToReturn: { itemId: string, quantity: number }[], totalRefund: number, breakdown: PaymentBreakdown) => void;
}

interface RefundDetail { id: string; method: PaymentMethodType; amount: number; reference?: string; }

const CreditNoteModule: React.FC<CreditNoteModuleProps> = ({ salesHistory, onProcessCreditNote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SaleRecord[]>([]);
    const [foundSale, setFoundSale] = useState<SaleRecord | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ [itemId: string]: number }>({}); 
    
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundList, setRefundList] = useState<RefundDetail[]>([]);
    const [currentRefund, setCurrentRefund] = useState<{ method: PaymentMethodType; amount: string; reference: string; }>({ method: 'Efectivo', amount: '', reference: '' });
    const refundAmountRef = useRef<HTMLInputElement>(null);

    const handleSearch = () => {
        const term = searchTerm.toLowerCase();
        if(!term) return;
        const matches = salesHistory.filter(s => s.id.includes(term) || s.docType.toLowerCase().includes(term) || s.clientName.toLowerCase().includes(term) || s.items.some(item => item.name.toLowerCase().includes(term)));
        if (matches.length === 0) { alert("No se encontraron ventas con ese criterio."); setFoundSale(null); setSearchResults([]); } 
        else if (matches.length === 1) { handleSelectSale(matches[0]); setSearchResults([]); } 
        else { setSearchResults(matches); setFoundSale(null); }
    };

    const handleSelectSale = (sale: SaleRecord) => {
        setFoundSale(sale);
        setSearchResults([]);
        const initialSelection: { [key: string]: number } = {};
        sale.items.forEach(item => { initialSelection[item.id] = 0; });
        setSelectedItems(initialSelection);
    };

    const handleQuantityChange = (itemId: string, maxQty: number, newQty: number) => {
        if (newQty < 0 || newQty > maxQty) return;
        setSelectedItems(prev => ({ ...prev, [itemId]: newQty }));
    };

    const calculateRefundTotal = () => {
        if (!foundSale) return 0;
        return foundSale.items.reduce((acc, item) => { const qtyToReturn = selectedItems[item.id] || 0; return acc + (item.price * qtyToReturn); }, 0);
    };

    const handlePrepareRefund = () => {
        const total = calculateRefundTotal();
        if (total <= 0) { alert("Seleccione items para devolver."); return; }
        setRefundList([]);
        setCurrentRefund({ method: 'Efectivo', amount: total.toFixed(2), reference: '' });
        setShowRefundModal(true);
        setTimeout(() => refundAmountRef.current?.focus(), 100);
    };

    const getTotalRefunded = () => refundList.reduce((acc, r) => acc + r.amount, 0);
    const totalToRefund = calculateRefundTotal();
    const remainingToRefund = Math.max(0, totalToRefund - getTotalRefunded());

    const handleAddRefund = () => {
        const amountVal = parseFloat(currentRefund.amount);
        if (isNaN(amountVal) || amountVal <= 0) return alert("Monto inválido");
        if (amountVal > remainingToRefund + 0.1) return alert("El monto excede el total a devolver");
        const newRefund: RefundDetail = { id: Math.random().toString(), method: currentRefund.method, amount: amountVal, reference: currentRefund.reference };
        const newList = [...refundList, newRefund];
        setRefundList(newList);
        const currentTotal = newList.reduce((acc, r) => acc + r.amount, 0);
        const nextRemaining = Math.max(0, totalToRefund - currentTotal);
        setCurrentRefund({ method: 'Efectivo', amount: nextRemaining > 0 ? nextRemaining.toFixed(2) : '', reference: '' });
        refundAmountRef.current?.focus();
    };

    const handleFinalizeCreditNote = () => {
        if (!foundSale) return;
        if (remainingToRefund > 0.1) { alert("Debe asignar el monto total de la devolución."); return; }
        const breakdown: PaymentBreakdown = { cash: refundList.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + p.amount, 0), yape: refundList.filter(p => p.method === 'Yape' || p.method === 'Plin').reduce((acc, p) => acc + p.amount, 0), card: refundList.filter(p => p.method === 'Tarjeta').reduce((acc, p) => acc + p.amount, 0), bank: refundList.filter(p => p.method === 'Deposito').reduce((acc, p) => acc + p.amount, 0), wallet: refundList.filter(p => p.method === 'Saldo Favor').reduce((acc, p) => acc + p.amount, 0) };
        const itemsToReturn = Object.entries(selectedItems).filter(([_, qty]) => (qty as number) > 0).map(([itemId, quantity]) => ({ itemId, quantity: quantity as number }));
        onProcessCreditNote(foundSale.id, itemsToReturn, totalToRefund, breakdown);
        setShowRefundModal(false); setFoundSale(null); setSearchTerm(''); setSelectedItems({});
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FileMinus className="text-red-500"/> Nota de Crédito / Devoluciones</h2>
                <div className="flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/><input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-red-500 text-slate-900 dark:text-white outline-none" placeholder="Buscar por Ticket, Cliente, DNI o Producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/></div><button onClick={handleSearch} className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"><Search size={18}/> Buscar</button></div>
            </div>
            {searchResults.length > 0 && !foundSale && (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"><h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><List size={18} className="text-blue-500"/> Resultados de Búsqueda ({searchResults.length})</h3></div>
                    <div className="flex-1 overflow-auto p-2"><table className="w-full text-sm text-left"><thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Documento</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-center">Acción</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{searchResults.map(sale => (<tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="px-4 py-3 text-slate-600 dark:text-slate-400"><div className="font-bold">{sale.date}</div><div className="text-xs">{sale.time}</div></td><td className="px-4 py-3"><div className="font-bold text-slate-700 dark:text-white">{sale.docType}</div><div className="text-xs text-slate-500 font-mono">#{sale.id}</div></td><td className="px-4 py-3 text-slate-700 dark:text-white">{sale.clientName}</td><td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-white">S/ {sale.total.toFixed(2)}</td><td className="px-4 py-3 text-center"><button onClick={() => handleSelectSale(sale)} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50">Seleccionar</button></td></tr>))}</tbody></table></div>
                </div>
            )}
            {foundSale ? (
                <div className="flex-1 flex gap-6 min-h-0 animate-in fade-in">
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center"><div><h3 className="font-bold text-slate-700 dark:text-white">Detalle de Venta Original</h3><p className="text-xs text-slate-500 dark:text-slate-400">{foundSale.docType} #{foundSale.id} - {foundSale.date}</p></div><div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Cliente</p><p className="font-bold text-slate-800 dark:text-white">{foundSale.clientName}</p></div></div>
                        <div className="flex-1 overflow-auto p-4"><table className="w-full text-sm"><thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700"><tr><th className="pb-2 text-left">Producto</th><th className="pb-2 text-center">Cant. Orig.</th><th className="pb-2 text-right">Precio Unit.</th><th className="pb-2 text-center w-32">Cant. a Devolver</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{foundSale.items.map(item => (<tr key={item.id} className="group"><td className="py-3"><div className="font-bold text-slate-700 dark:text-slate-200">{item.name}</div><div className="text-xs text-slate-400">{item.code}</div></td><td className="py-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td><td className="py-3 text-right text-slate-600 dark:text-slate-400">S/ {item.price.toFixed(2)}</td><td className="py-3 text-center"><div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-1 w-fit mx-auto"><button onClick={() => handleQuantityChange(item.id, item.quantity, (selectedItems[item.id] || 0) - 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300 font-bold hover:bg-red-50 hover:text-red-500">-</button><span className="w-8 text-center font-bold text-slate-800 dark:text-white">{selectedItems[item.id] || 0}</span><button onClick={() => handleQuantityChange(item.id, item.quantity, (selectedItems[item.id] || 0) + 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300 font-bold hover:bg-emerald-50 hover:text-emerald-500">+</button></div></td></tr>))}</tbody></table></div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center"><button onClick={() => {setFoundSale(null); setSearchResults([]);}} className="text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">← Volver a buscar</button><div className="text-right"><span className="text-xs font-bold text-slate-400 uppercase mr-2">Total Original</span><span className="font-bold text-slate-800 dark:text-white">S/ {foundSale.total.toFixed(2)}</span></div></div>
                    </div>
                    <div className="w-80 flex flex-col gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2"><RotateCcw size={20} className="text-red-500"/> Resumen Devolución</h3>
                            <div className="space-y-4 flex-1">
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30"><p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Total a Reembolsar</p><p className="text-3xl font-bold text-red-700 dark:text-red-300">S/ {totalToRefund.toFixed(2)}</p></div>
                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300"><p className="flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500"/> Confirmación de pago requerida.</p><p className="flex items-center gap-2"><Package size={16} className="text-blue-500"/> Los productos retornarán al stock.</p></div>
                            </div>
                            <button onClick={handlePrepareRefund} disabled={totalToRefund <= 0} className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"><FileMinus size={20}/> Procesar Devolución</button>
                        </div>
                    </div>
                </div>
            ) : (searchResults.length === 0 && (<div className="flex-1 flex items-center justify-center text-slate-400 flex-col"><FileMinus size={64} strokeWidth={1} className="mb-4 text-slate-300 dark:text-slate-600"/><p>Busque una venta para iniciar el proceso de devolución.</p></div>))}
            {showRefundModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[800px] overflow-hidden flex flex-col max-h-[95vh] border border-slate-300 dark:border-slate-700 animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700 bg-red-50 dark:bg-slate-900"><h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2"><RotateCcw size={20} className="text-red-500"/> Confirmar Reembolso</h3><button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button></div>
                        <div className="p-6 flex gap-8 bg-slate-50/50 dark:bg-slate-900/50 flex-1 overflow-y-auto">
                            <div className="flex-1 flex flex-col"><h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">Desglose</h4><div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col"><div className="overflow-y-auto max-h-[300px] flex-1">{refundList.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 p-4"><RotateCcw size={32} className="mb-2"/><p className="text-xs">Agregue métodos de devolución.</p></div>) : (<table className="w-full text-left text-sm"><tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">{refundList.map((p) => (<tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="px-4 py-3 font-medium flex items-center gap-2">{p.method === 'Saldo Favor' ? <Wallet size={14} className="text-blue-500"/> : <Banknote size={14} className="text-slate-400"/>} {p.method}</td><td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">- S/ {p.amount.toFixed(2)}</td><td className="px-4 py-3 text-center w-10"><button onClick={() => setRefundList(refundList.filter(r => r.id !== p.id))} className="text-slate-400 hover:text-red-500"><X size={16}/></button></td></tr>))}</tbody></table>)}</div><div className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 p-4 space-y-2 mt-auto"><div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400">Total a Devolver:</span><span className="font-bold text-slate-800 dark:text-white text-lg">S/ {totalToRefund.toFixed(2)}</span></div><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-500 dark:text-slate-400">Restante:</span><span className={`text-xl font-bold ${remainingToRefund > 0 ? 'text-slate-700 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>S/ {remainingToRefund.toFixed(2)}</span></div></div></div></div>
                            <div className="w-80 flex flex-col"><h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Método</h4><div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4"><div className="grid grid-cols-2 gap-2"><button onClick={() => setCurrentRefund({...currentRefund, method: 'Efectivo'})} className="py-2 px-1 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 bg-slate-800 text-white border-slate-800"><Banknote size={16}/> Efectivo</button><button onClick={() => setCurrentRefund({...currentRefund, method: 'Saldo Favor'})} className="py-2 px-1 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 bg-blue-600 text-white border-blue-600"><Wallet size={16}/> Billetera</button></div><div><label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Monto a Devolver</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span><input ref={refundAmountRef} type="number" className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-2xl font-bold text-slate-800 dark:text-white outline-none focus:border-red-500" placeholder="0.00" value={currentRefund.amount} onChange={e => setCurrentRefund({...currentRefund, amount: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleAddRefund()}/></div></div><button onClick={handleAddRefund} className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"><ArrowRight size={18}/> Agregar</button></div></div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3"><button onClick={() => setShowRefundModal(false)} className="px-6 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button><button onClick={handleFinalizeCreditNote} disabled={remainingToRefund > 0.1} className="px-8 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><CheckCircle size={18}/> Procesar Nota Crédito</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CreditNoteModule;
