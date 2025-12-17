
import React, { useMemo } from 'react';
import { InventoryCountItem, ViewState } from '../types';
import { FileBarChart, ArrowUp, ArrowDown, CheckCircle, FileScan } from 'lucide-react';

interface InventoryReportProps {
    inventoryCountData: InventoryCountItem[];
    onNavigate: (view: ViewState) => void;
}

const InventoryReportModule: React.FC<InventoryReportProps> = ({ inventoryCountData, onNavigate }) => {
    
    const summary = useMemo(() => {
        const shortages = inventoryCountData.filter(i => i.difference < 0);
        const surpluses = inventoryCountData.filter(i => i.difference > 0);
        const correct = inventoryCountData.filter(i => i.difference === 0 && i.physicalCount !== null);
        
        return {
            shortageCount: shortages.length,
            surplusCount: surpluses.length,
            correctCount: correct.length,
            uncounted: inventoryCountData.filter(i => i.physicalCount === null).length,
            totalItems: inventoryCountData.length
        };
    }, [inventoryCountData]);

    const hasData = inventoryCountData.length > 0;

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileBarChart className="text-purple-500"/> Reporte de Inventario
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Resultados de la última toma de inventario físico.
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate(ViewState.INVENTORY_CONTROL)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                    <FileScan size={16}/> Realizar Nuevo Conteo
                </button>
            </div>

            {hasData ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-800">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400 rounded-lg"><ArrowDown size={20}/></div>
                                <span className="text-red-700 dark:text-red-300 text-xs font-bold uppercase">Productos Faltantes</span>
                            </div>
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.shortageCount}</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><ArrowUp size={20}/></div>
                                <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">Productos Sobrantes</span>
                            </div>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{summary.surplusCount}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-lg"><CheckCircle size={20}/></div>
                                <span className="text-blue-700 dark:text-blue-300 text-xs font-bold uppercase">Conteo Correcto</span>
                            </div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.correctCount}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Sin Contar / Total</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-600 dark:text-slate-300">{summary.uncounted} / {summary.totalItems}</div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="h-full overflow-auto">
                            <table className="w-full modern-table text-sm">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th className="text-center">Stock Sistema</th>
                                        <th className="text-center">Conteo Físico</th>
                                        <th className="text-center">Diferencia</th>
                                        <th className="text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryCountData.map(item => {
                                        const statusColor = item.difference > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                            : item.difference < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                            : item.physicalCount === null ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
                                        
                                        const statusText = item.difference > 0 ? 'SOBRANTE' 
                                            : item.difference < 0 ? 'FALTANTE' 
                                            : item.physicalCount === null ? 'SIN CONTEO'
                                            : 'CORRECTO';

                                        return (
                                        <tr key={item.productId}>
                                            <td className="font-medium text-slate-700 dark:text-white">{item.productName}</td>
                                            <td className="text-center font-bold text-slate-500 dark:text-slate-400">{item.systemStock}</td>
                                            <td className="text-center font-bold text-lg text-slate-800 dark:text-white">{item.physicalCount ?? '-'}</td>
                                            <td className={`text-center font-bold text-lg ${item.difference > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.difference > 0 ? `+${item.difference}` : item.difference !== 0 ? item.difference : '-'}
                                            </td>
                                            <td className="text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${statusColor}`}>{statusText}</span>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <FileBarChart size={48} strokeWidth={1}/>
                    <p className="mt-4 font-medium">No se ha realizado ninguna toma de inventario.</p>
                    <p className="text-xs mt-1">Inicia un nuevo conteo desde el módulo de inventario.</p>
                </div>
            )}
        </div>
    );
};

export default InventoryReportModule;
