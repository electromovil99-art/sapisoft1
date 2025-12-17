
import React, { useMemo } from 'react';
import { SaleRecord, CashMovement, Product } from '../types';
import { PieChart, DollarSign, TrendingDown, TrendingUp, BarChart, Award, Lightbulb } from 'lucide-react';

const DailyProfitChart: React.FC<{ data: { day: string; profit: number }[] }> = ({ data }) => {
    const maxProfit = Math.max(...data.map(d => d.profit), 1);
    const minProfit = Math.min(...data.map(d => d.profit), 0);
    const range = maxProfit - minProfit;

    return (
        <div className="h-64 flex items-end gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full h-full flex items-end">
                        <div 
                            className={`w-full rounded-t-md group-hover:opacity-80 transition-all ${d.profit >= 0 ? 'bg-emerald-200 dark:bg-emerald-900/30' : 'bg-red-200 dark:bg-red-900/30'}`}
                            style={{ height: `${(Math.abs(d.profit) / range) * 100}%`, transform: d.profit < 0 ? `translateY(-${(minProfit / range) * 100}%)` : '' }}
                        ></div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            S/ {d.profit.toFixed(2)}
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{d.day}</span>
                </div>
            ))}
        </div>
    );
};

const ProfitReportModule: React.FC<{ salesHistory: SaleRecord[], cashMovements: CashMovement[], products: Product[] }> = ({ salesHistory, cashMovements, products }) => {
    
    const profitData = useMemo(() => {
        const totalSales = salesHistory.reduce((acc, sale) => acc + sale.total, 0);

        const cmv = salesHistory.flatMap(s => s.items).reduce((acc, item) => {
            const productCost = products.find(p => p.id === item.id)?.cost || item.price * 0.7; // Fallback cost
            return acc + (productCost * item.quantity);
        }, 0);
        
        const operatingExpenses = cashMovements
            .filter(m => m.type === 'Egreso' && m.category !== 'Compra' && m.category !== 'Devoluciones')
            .reduce((acc, m) => acc + m.amount, 0);
            
        const netProfit = totalSales - cmv - operatingExpenses;

        const productProfit: { [key: string]: { name: string, profit: number } } = {};
        salesHistory.forEach(sale => {
            sale.items.forEach(item => {
                if (!productProfit[item.id]) {
                    productProfit[item.id] = { name: item.name, profit: 0 };
                }
                const cost = products.find(p => p.id === item.id)?.cost || item.price * 0.7;
                productProfit[item.id].profit += (item.price - cost) * item.quantity;
            });
        });

        const topProfitableProducts = Object.values(productProfit)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5);

        // Daily Profit Chart Data
        const today = new Date();
        const dailyData: { [key: string]: { sales: number, cmv: number, expenses: number } } = {};
         for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            dailyData[d.toLocaleDateString('es-PE')] = { sales: 0, cmv: 0, expenses: 0 };
        }
        salesHistory.forEach(s => {
            if (dailyData[s.date] !== undefined) {
                dailyData[s.date].sales += s.total;
                dailyData[s.date].cmv += s.items.reduce((acc, item) => acc + ((products.find(p=>p.id===item.id)?.cost || 0) * item.quantity), 0);
            }
        });

        const profitChartData = Object.keys(dailyData).map(dateKey => {
            const date = new Date(dateKey.split('/').reverse().join('-'));
            const data = dailyData[dateKey];
            return {
                day: date.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.',''),
                profit: data.sales - data.cmv // Simplified for chart, excluding daily fixed expenses
            };
        });
        
        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const monthlyProfitProjection = (netProfit / (dayOfMonth || 1)) * daysInMonth;

        return { totalSales, cmv, operatingExpenses, netProfit, topProfitableProducts, profitChartData, monthlyProfitProjection };
    }, [salesHistory, cashMovements, products]);

    return (
        <div className="flex flex-col h-full gap-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PieChart className="text-emerald-500"/> Reporte de Utilidades
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700"><div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Ventas Brutas</div><div className="text-2xl font-bold text-slate-800 dark:text-white">S/ {profitData.totalSales.toFixed(2)}</div></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700"><div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Costo Mercadería (CMV)</div><div className="text-2xl font-bold text-slate-800 dark:text-white">- S/ {profitData.cmv.toFixed(2)}</div></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700"><div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Gastos Operativos</div><div className="text-2xl font-bold text-slate-800 dark:text-white">- S/ {profitData.operatingExpenses.toFixed(2)}</div></div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800"><div className="text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">Utilidad Neta</div><div className={`text-3xl font-bold ${profitData.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>S/ {profitData.netProfit.toFixed(2)}</div></div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4">Utilidad Diaria (Últimos 7 Días)</h3>
                    <DailyProfitChart data={profitData.profitChartData} />
                    <div className="mt-4 text-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Proyección de Utilidad Mensual: </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">S/ {profitData.monthlyProfitProjection.toFixed(0)}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400"/> Inteligencia de Negocio</h3>
                    <div className="space-y-3">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                             <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2"><Award size={16}/> Top 5 Productos Rentables</h4>
                             <ul className="mt-3 space-y-2">
                                {profitData.topProfitableProducts.map((p, i) => (
                                    <li key={i} className="flex justify-between text-xs border-b border-amber-200 dark:border-amber-800/50 pb-1 last:border-0">
                                        <span className="font-medium text-amber-900 dark:text-amber-100 truncate pr-2">{p.name}</span>
                                        <span className="font-bold text-amber-700 dark:text-amber-300">S/ {p.profit.toFixed(2)}</span>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitReportModule;
