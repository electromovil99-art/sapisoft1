
import React, { useState } from 'react';
import { Search, Calendar, FileText, ArrowRight, ArrowDownRight, ArrowUpRight, Package, ShoppingCart, ShoppingBag, Eye, X } from 'lucide-react';
import { SaleRecord, PurchaseRecord, StockMovement } from '../types';

interface HistoryQueriesProps {
    salesHistory: SaleRecord[];
    purchasesHistory: PurchaseRecord[];
    stockMovements: StockMovement[];
    initialTab: 'ventas' | 'compras' | 'kardex';
}

const HistoryQueries: React.FC<HistoryQueriesProps> = ({ salesHistory, purchasesHistory, stockMovements, initialTab }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    const activeTab = initialTab;

    const getTitle = () => {
        switch(activeTab){
            case 'ventas': return { title: "Consulta de Ventas", icon: ShoppingCart, color: "emerald" };
            case 'compras': return { title: "Consulta de Compras", icon: ShoppingBag, color: "blue" };
            case 'kardex': return { title: "Movimientos (Kardex)", icon: Package, color: "slate" };
        }
    }
    const { title, icon: Icon, color } = getTitle();

    // Filtering
    const getFilteredList = () => {
        const term = searchTerm.toLowerCase();
        if (activeTab === 'ventas') {
            return salesHistory.filter(s => 
                s.clientName.toLowerCase().includes(term) || 
                s.id.includes(term) ||
                s.docType.toLowerCase().includes(term)
            );
        } else if (activeTab === 'compras') {
            return purchasesHistory.filter(p => 
                p.supplierName.toLowerCase().includes(term) ||
                p.docType.toLowerCase().includes(term)
            );
        } else {
            return stockMovements.filter(m => 
                m.productName.toLowerCase().includes(term) ||
                m.reference.toLowerCase().includes(term)
            );
        }
    };

    const filteredData = getFilteredList();

    return (
        <div className="flex flex-col h-full gap-6">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className={`font-bold text-lg text-${color}-600 dark:text-${color}-400 flex items-center gap-3`}>
                    <Icon size={22}/> {title}
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, proveedor, producto..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-72 focus:bg-white dark:focus:bg-slate-600 focus:border-primary-500 text-slate-800 dark:text-white placeholder-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-hidden">
                <div className="h-full overflow-auto">
                    <table className="w-full modern-table">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th>Fecha / Hora</th>
                                <th>{activeTab === 'ventas' ? 'Cliente' : activeTab === 'compras' ? 'Proveedor' : 'Producto'}</th>
                                <th>Documento / Ref</th>
                                {activeTab === 'kardex' ? (
                                    <>
                                        <th>Tipo</th>
                                        <th className="text-right">Cantidad</th>
                                        <th className="text-right">Stock Result.</th>
                                    </>
                                ) : (
                                    <>
                                        <th>Usuario</th>
                                        <th className="text-right">Total</th>
                                        <th className="text-center">Detalle</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="text-slate-500 dark:text-slate-400 text-xs">
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{item.date}</div>
                                        <div>{item.time}</div>
                                    </td>
                                    
                                    {/* Column 2 */}
                                    <td>
                                        <div className="font-bold text-slate-700 dark:text-white">
                                            {activeTab === 'ventas' ? item.clientName : activeTab === 'compras' ? item.supplierName : item.productName}
                                        </div>
                                    </td>

                                    {/* Column 3 */}
                                    <td>
                                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                            {activeTab === 'kardex' ? item.reference : item.docType + (item.id ? ` #${item.id}` : '')}
                                        </div>
                                    </td>

                                    {/* Dynamic Columns */}
                                    {activeTab === 'kardex' ? (
                                        <>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.type === 'ENTRADA' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="text-right font-bold text-slate-800 dark:text-white">
                                                {item.type === 'ENTRADA' ? '+' : '-'}{item.quantity}
                                            </td>
                                            <td className="text-right font-bold text-slate-700 dark:text-slate-300">
                                                {item.currentStock}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="text-xs text-slate-500 dark:text-slate-400">{item.user}</td>
                                            <td className="text-right font-bold text-slate-800 dark:text-white">S/ {item.total.toFixed(2)}</td>
                                            <td className="text-center">
                                                <button onClick={() => setSelectedDetail(item)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg"><Eye size={16}/></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal (Sales/Purchases) */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                        <div className="px-6 py-4 bg-slate-800 dark:bg-slate-900 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText size={18}/> Detalle de {activeTab === 'ventas' ? 'Venta' : 'Compra'}
                            </h3>
                            <button onClick={() => setSelectedDetail(null)}><X className="text-slate-400 hover:text-white"/></button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 text-xs mb-6 text-slate-600 dark:text-slate-300">
                                <div><span className="font-bold block text-slate-400">FECHA:</span> {selectedDetail.date} - {selectedDetail.time}</div>
                                <div><span className="font-bold block text-slate-400">TOTAL:</span> <span className="text-lg font-bold text-slate-800 dark:text-white">S/ {selectedDetail.total.toFixed(2)}</span></div>
                                <div><span className="font-bold block text-slate-400">{activeTab === 'ventas' ? 'CLIENTE' : 'PROVEEDOR'}:</span> {selectedDetail.clientName || selectedDetail.supplierName}</div>
                                <div><span className="font-bold block text-slate-400">DOCUMENTO:</span> {selectedDetail.docType}</div>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Producto</th>
                                            <th className="px-3 py-2 text-center">Cant.</th>
                                            <th className="px-3 py-2 text-right">P. Unit</th>
                                            <th className="px-3 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                                        {selectedDetail.items.map((it: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2">{it.name}</td>
                                                <td className="px-3 py-2 text-center">{it.quantity}</td>
                                                <td className="px-3 py-2 text-right">{it.price.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right font-bold">{(it.price * it.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryQueries;
