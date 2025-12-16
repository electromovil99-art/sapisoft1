
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, CloudUpload, CloudDownload, CheckCircle, AlertTriangle, Save, Server, Loader2 } from 'lucide-react';
import { Product, Client, CashMovement, SaleRecord, ServiceOrder } from '../types';

interface DatabaseModuleProps {
    data: {
        products: Product[];
        clients: Client[];
        movements: CashMovement[];
        sales: SaleRecord[];
        services: ServiceOrder[];
    };
    onSyncDownload: (data: any) => void;
}

const DatabaseModule: React.FC<DatabaseModuleProps> = ({ data, onSyncDownload }) => {
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const storedUrl = localStorage.getItem('supabase_url');
        const storedKey = localStorage.getItem('supabase_key');
        if (storedUrl) setSupabaseUrl(storedUrl);
        if (storedKey) setSupabaseKey(storedKey);
        if (storedUrl && storedKey) checkConnection(storedUrl, storedKey);
    }, []);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const checkConnection = async (url: string, key: string) => {
        try {
            const supabase = createClient(url, key);
            // Intentar una consulta ligera para verificar conexión
            const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
            
            // Si el error es 404 (tabla no existe) o null (éxito), asumimos conectado pero quizás sin tablas
            if (error && error.code !== 'PGRST116') { 
                throw error;
            }
            setStatus('CONNECTED');
            addLog("Conexión exitosa con Supabase.");
        } catch (e: any) {
            setStatus('ERROR');
            addLog(`Error de conexión: ${e.message || 'Verifique URL/Key'}`);
        }
    };

    const handleSaveConfig = () => {
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        checkConnection(supabaseUrl, supabaseKey);
    };

    const handleUpload = async () => {
        if (status !== 'CONNECTED') return alert("Sin conexión a base de datos");
        setLoading(true);
        addLog("Iniciando subida de datos...");
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            // 1. Products
            const { error: pErr } = await supabase.from('products').upsert(data.products.map(p => ({
                id: p.id, code: p.code, name: p.name, category: p.category, price: p.price, stock: p.stock, location: p.location, brand: p.brand
            })));
            if (pErr) throw pErr;
            addLog(`✅ Productos sincronizados (${data.products.length})`);

            // 2. Clients
            const { error: cErr } = await supabase.from('clients').upsert(data.clients.map(c => ({
                id: c.id, name: c.name, dni: c.dni, phone: c.phone, email: c.email, address: c.address, 
                department: c.department, province: c.province, district: c.district,
                credit_line: c.creditLine, credit_used: c.creditUsed, total_purchases: c.totalPurchases,
                payment_score: c.paymentScore, digital_balance: c.digitalBalance
            })));
            if (cErr) throw cErr;
            addLog(`✅ Clientes sincronizados (${data.clients.length})`);

            // 3. Sales (Simple map for demo)
            const { error: sErr } = await supabase.from('sales').upsert(data.sales.map(s => ({
                id: s.id, date: s.date, time: s.time, client_name: s.clientName, doc_type: s.docType, 
                total: s.total, user_name: s.user, items: s.items, payment_breakdown: s.paymentBreakdown
            })));
            if (sErr) throw sErr;
            addLog(`✅ Ventas sincronizadas (${data.sales.length})`);

            // 4. Movements
            const { error: mErr } = await supabase.from('cash_movements').upsert(data.movements.map(m => ({
                id: m.id, time: m.time, type: m.type, payment_method: m.paymentMethod, concept: m.concept,
                amount: m.amount, user_name: m.user, financial_type: m.financialType, category: m.category, reference_id: m.referenceId
            })));
            if (mErr) throw mErr;
            addLog(`✅ Movimientos Caja sincronizados (${data.movements.length})`);

            // 5. Services
            const { error: svErr } = await supabase.from('service_orders').upsert(data.services.map(s => ({
                id: s.id, client: s.client, device_model: s.deviceModel, issue: s.issue, status: s.status,
                cost: s.cost, entry_date: s.entryDate, technician: s.technician, used_products: s.usedProducts
            })));
            if (svErr) throw svErr;
            addLog(`✅ Servicios sincronizados (${data.services.length})`);

            addLog("🚀 Sincronización completada exitosamente.");
        } catch (e: any) {
            addLog(`❌ Error al subir: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (status !== 'CONNECTED') return alert("Sin conexión a base de datos");
        setLoading(true);
        addLog("Descargando datos de la nube...");
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            const { data: prodData } = await supabase.from('products').select('*');
            const { data: cliData } = await supabase.from('clients').select('*');
            const { data: saleData } = await supabase.from('sales').select('*');
            const { data: movData } = await supabase.from('cash_movements').select('*');
            const { data: servData } = await supabase.from('service_orders').select('*');

            const mappedData = {
                products: prodData?.map((p: any) => ({ ...p, id: p.id })) || [],
                clients: cliData?.map((c: any) => ({ ...c, creditLine: c.credit_line, creditUsed: c.credit_used, totalPurchases: c.total_purchases, paymentScore: c.payment_score, digitalBalance: c.digital_balance })) || [],
                sales: saleData?.map((s: any) => ({ ...s, clientName: s.client_name, docType: s.doc_type, user: s.user_name, paymentBreakdown: s.payment_breakdown })) || [],
                movements: movData?.map((m: any) => ({ ...m, paymentMethod: m.payment_method, user: m.user_name, financialType: m.financial_type, referenceId: m.reference_id })) || [],
                services: servData?.map((s: any) => ({ ...s, deviceModel: s.device_model, entryDate: s.entry_date, usedProducts: s.used_products })) || []
            };

            onSyncDownload(mappedData);
            addLog("📥 Datos descargados y aplicados a la sesión local.");
        } catch (e: any) {
            addLog(`❌ Error al descargar: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                    <Database className="text-blue-500"/> Configuración
                </h2>
                
                <div className="space-y-4 flex-1">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Supabase Project URL</label>
                        <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" placeholder="https://xyz.supabase.co" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Supabase Anon Key</label>
                        <input type="password" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" placeholder="eyJhbGciOiJIUzI1NiIsInR5..." value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)}/>
                    </div>
                    
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : status === 'ERROR' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        {status === 'CONNECTED' ? <CheckCircle/> : status === 'ERROR' ? <AlertTriangle/> : <Server/>}
                        <div>
                            <p className="font-bold text-sm">{status === 'CONNECTED' ? 'Conectado' : status === 'ERROR' ? 'Error de Conexión' : 'Desconectado'}</p>
                            <p className="text-xs opacity-80">{status === 'CONNECTED' ? 'Listo para sincronizar' : 'Configure URL y Key'}</p>
                        </div>
                    </div>
                </div>

                <button onClick={handleSaveConfig} className="w-full py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl mt-4 hover:opacity-90 flex justify-center gap-2">
                    <Save size={18}/> Guardar y Probar
                </button>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                    <CloudUpload className="text-purple-500"/> Sincronización
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={handleUpload} disabled={loading || status !== 'CONNECTED'} className="p-6 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:border-purple-800 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            {loading ? <Loader2 className="animate-spin"/> : <CloudUpload size={24}/>}
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-purple-800 dark:text-purple-300">Subir Datos Locales</p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Sobreescribe la nube con lo que ves aquí</p>
                        </div>
                    </button>

                    <button onClick={handleDownload} disabled={loading || status !== 'CONNECTED'} className="p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:border-blue-800 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            {loading ? <Loader2 className="animate-spin"/> : <CloudDownload size={24}/>}
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-800 dark:text-blue-300">Descargar de Nube</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Reemplaza datos locales con la BD</p>
                        </div>
                    </button>
                </div>

                <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-green-400 shadow-inner">
                    {logs.length === 0 ? <span className="opacity-50">// Esperando acciones...</span> : logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
                </div>
            </div>
        </div>
    );
};

export default DatabaseModule;
