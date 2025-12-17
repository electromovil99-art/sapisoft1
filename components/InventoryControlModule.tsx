
import React, { useState, useEffect, useRef } from 'react';
import { InventoryCountItem, ViewState } from '../types';
import { Search, Barcode, Check, X, Save, AlertTriangle, FileScan } from 'lucide-react';

interface InventoryControlProps {
    onStart: () => void;
    inventoryCount: InventoryCountItem[];
    onUpdateCount: (productId: string, count: number | null) => void;
    onFinalize: (adjustStock: boolean) => void;
}

const InventoryControlModule: React.FC<InventoryControlProps> = ({ onStart, inventoryCount, onUpdateCount, onFinalize }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const itemRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        onStart();
    }, []);

    const filteredItems = inventoryCount.filter(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleScan = () => {
        setShowScanner(true);
        // Simulación de escaneo
        setTimeout(() => {
            if (filteredItems.length > 0) {
                const randomItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
                const inputRef = itemRefs.current[randomItem.productId];
                
                if (inputRef) {
                    inputRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    inputRef.focus();
                    inputRef.select();
                }
                alert(`Simulación: Código de barras para "${randomItem.productName}" escaneado.`);
            } else {
                alert("No hay productos visibles para escanear.");
            }
            setShowScanner(false);
        }, 1500);
    };

    const handleFinalizeClick = (adjust: boolean) => {
        const uncounted = inventoryCount.filter(i => i.physicalCount === null).length;
        const message = adjust 
            ? `¿Confirmas finalizar y AJUSTAR el stock? Se modificarán los productos con diferencias.`
            : `¿Confirmas finalizar y GUARDAR el reporte? El stock no será modificado.`;
        
        if (uncounted > 0) {
            if(!window.confirm(`ADVERTENCIA: Tienes ${uncounted} productos sin contar. ¿Deseas continuar de todas formas?`)) {
                return;
            }
        }

        if (window.confirm(message)) {
            onFinalize(adjust);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {showScanner && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center text-white">
                    <p className="mb-4">Apunte la cámara al código de barras...</p>
                    <div className="w-64 h-32 border-2 border-dashed border-emerald-400 rounded-lg relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    </div>
                    <button onClick={() => setShowScanner(false)} className="mt-6 bg-slate-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
            )}
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileScan className="text-blue-500"/> Toma de Inventario Físico
                </h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={handleScan} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Barcode size={20}/> <span className="hidden sm:inline">Escanear</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="h-full overflow-auto">
                    <table className="w-full modern-table text-sm">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th className="text-center">Stock Sistema</th>
                                <th className="text-center w-40">Conteo Físico</th>
                                <th className="text-center">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => {
                                const diffColor = item.difference > 0 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : item.difference < 0 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : '';
                                return (
                                <tr key={item.productId}>
                                    <td className="font-medium text-slate-700 dark:text-white">{item.productName}</td>
                                    <td className="text-center font-bold text-slate-500 dark:text-slate-400">{item.systemStock}</td>
                                    <td>
                                        <input 
                                            // FIX: Corrected the ref callback to not return a value by wrapping the assignment in curly braces.
                                            ref={el => { itemRefs.current[item.productId] = el; }}
                                            type="number" 
                                            className="w-full p-2 text-center font-bold text-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                                            value={item.physicalCount ?? ''}
                                            onChange={e => onUpdateCount(item.productId, e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className={`text-center font-bold text-lg ${diffColor}`}>
                                        {item.difference > 0 ? `+${item.difference}` : item.difference}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-end items-center gap-3">
                <button onClick={() => handleFinalizeClick(false)} className="w-full sm:w-auto px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <Save size={16}/> Guardar sin Ajustar
                </button>
                <button onClick={() => handleFinalizeClick(true)} className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700">
                    <Check size={18}/> Finalizar y Ajustar Stock
                </button>
            </div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );
};

export default InventoryControlModule;
