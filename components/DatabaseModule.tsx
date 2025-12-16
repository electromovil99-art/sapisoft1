
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database, CloudUpload, CloudDownload, CheckCircle, AlertTriangle, Save, Server, Loader2, Zap } from 'lucide-react';
import { Product, Client, CashMovement, SaleRecord, ServiceOrder, Supplier, Brand, Category, BankAccount } from '../types';

interface DatabaseModuleProps {
    data: {
        products: Product[];
        clients: Client[];
        movements: CashMovement[];
        sales: SaleRecord[];
        services: ServiceOrder[];
        suppliers: Supplier[];
        brands: Brand[];
        categories: Category[];
        bankAccounts: BankAccount[];
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
            const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
            if (error && error.code !== '42P01' && error.code !== 'PGRST116') throw error;
            setStatus('CONNECTED');
            addLog("✅ Conexión exitosa con Supabase.");
        } catch (e: any) {
            setStatus('ERROR');
            addLog(`❌ Error de conexión: ${e.message || 'Verifique URL/Key'}`);
        }
    };
    
    const handleSaveConfig = () => {
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        addLog("Configuración guardada. Probando conexión...");
        checkConnection(supabaseUrl, supabaseKey);
    };

    const handleCreateTableSchema = async () => {
        if (status !== 'CONNECTED') return alert("Sin conexión a base de datos");
        setLoading(true);
        addLog("⚙️ Iniciando creación de esquema de tablas...");
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        const schemaSQL = `
            CREATE TABLE IF NOT EXISTS public.tenants ( id TEXT PRIMARY KEY, company_name TEXT, industry TEXT, status TEXT, subscription_end TEXT, owner_name TEXT, phone TEXT, plan_type TEXT );
            CREATE TABLE IF NOT EXISTS public.system_users ( id TEXT PRIMARY KEY, username TEXT UNIQUE, full_name TEXT, email TEXT, "password" TEXT, "role" TEXT, active BOOLEAN, permissions TEXT[], company_name TEXT );
            CREATE TABLE IF NOT EXISTS public.products ( id TEXT PRIMARY KEY, code TEXT, name TEXT, category TEXT, price NUMERIC, stock INTEGER, location TEXT, brand TEXT );
            CREATE TABLE IF NOT EXISTS public.clients ( id TEXT PRIMARY KEY, name TEXT, dni TEXT, phone TEXT, email TEXT, address TEXT, district TEXT, province TEXT, department TEXT, credit_line NUMERIC, credit_used NUMERIC, total_purchases NUMERIC, last_purchase_date TEXT, payment_score INTEGER, tags TEXT[], digital_balance NUMERIC );
            CREATE TABLE IF NOT EXISTS public.sales ( id TEXT PRIMARY KEY, date TEXT, "time" TEXT, client_name TEXT, doc_type TEXT, total NUMERIC, items JSONB, payment_breakdown JSONB, user_name TEXT );
            CREATE TABLE IF NOT EXISTS public.purchases ( id TEXT PRIMARY KEY, date TEXT, "time" TEXT, supplier_name TEXT, doc_type TEXT, total NUMERIC, items JSONB, payment_condition TEXT, user_name TEXT );
            CREATE TABLE IF NOT EXISTS public.cash_movements ( id TEXT PRIMARY KEY, "time" TEXT, type TEXT, payment_method TEXT, concept TEXT, reference_id TEXT, amount NUMERIC, user_name TEXT, related_items JSONB, financial_type TEXT, category TEXT );
            CREATE TABLE IF NOT EXISTS public.service_orders ( id TEXT PRIMARY KEY, entry_date TEXT, entry_time TEXT, client TEXT, client_phone TEXT, device_model TEXT, issue TEXT, status TEXT, technician TEXT, receptionist TEXT, cost NUMERIC, used_products JSONB, exit_date TEXT, exit_time TEXT, color TEXT );
            CREATE TABLE IF NOT EXISTS public.suppliers ( id TEXT PRIMARY KEY, name TEXT, ruc TEXT, phone TEXT, email TEXT, address TEXT, contact_name TEXT );
            CREATE TABLE IF NOT EXISTS public.brands ( id TEXT PRIMARY KEY, name TEXT UNIQUE );
            CREATE TABLE IF NOT EXISTS public.categories ( id TEXT PRIMARY KEY, name TEXT UNIQUE );
            CREATE TABLE IF NOT EXISTS public.bank_accounts ( id TEXT PRIMARY KEY, bank_name TEXT, account_number TEXT, currency TEXT, alias TEXT );
        `;
        
        try {
            addLog("Intentando ejecutar script SQL vía RPC...");
            const { error } = await supabase.rpc('execute_sql', { sql: schemaSQL });
            if (error) throw error;
            
            addLog("✅ ¡Éxito! Todas las 12 tablas fueron creadas/verificadas.");
            addLog("-> tenants, system_users, products, clients, sales, purchases, cash_movements, service_orders, suppliers, brands, categories, bank_accounts");
            addLog("🎉 ¡Listo para sincronizar datos!");
        } catch (e: any) {
            addLog(`❌ Error al crear esquema: ${e.message}`);
            addLog("💡 SOLUCIÓN: Copie y ejecute el siguiente script en el 'SQL Editor' de Supabase y luego intente de nuevo:");
            addLog(`create or replace function execute_sql(sql text) returns void as $$ begin execute sql; end; $$ language plpgsql;`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (status !== 'CONNECTED') return alert("Sin conexión a base de datos");
        setLoading(true);
        addLog("Iniciando subida de datos...");
        const supabase = createClient(supabaseUrl, supabaseKey);
        try {
            const { error: pErr } = await supabase.from('products').upsert(data.products); if (pErr) throw pErr; addLog(`✅ Productos: ${data.products.length} registros.`);
            const { error: cErr } = await supabase.from('clients').upsert(data.clients.map(c => ({...c, credit_line: c.creditLine, credit_used: c.creditUsed, total_purchases: c.totalPurchases, payment_score: c.paymentScore, digital_balance: c.digitalBalance, last_purchase_date: c.lastPurchaseDate }))); if (cErr) throw cErr; addLog(`✅ Clientes: ${data.clients.length} registros.`);
            const { error: sErr } = await supabase.from('sales').upsert(data.sales.map(s=>({...s, client_name: s.clientName, doc_type: s.docType, user_name: s.user, payment_breakdown: s.paymentBreakdown}))); if (sErr) throw sErr; addLog(`✅ Ventas: ${data.sales.length} registros.`);
            const { error: mErr } = await supabase.from('cash_movements').upsert(data.movements.map(m=>({...m, payment_method: m.paymentMethod, reference_id: m.referenceId, user_name: m.user, financial_type: m.financialType, related_items: m.relatedItems}))); if (mErr) throw mErr; addLog(`✅ Mov. Caja: ${data.movements.length} registros.`);
            const { error: svErr } = await supabase.from('service_orders').upsert(data.services.map(s=>({...s, entry_date:s.entryDate, entry_time:s.entryTime, client_phone: s.clientPhone, device_model: s.deviceModel, used_products: s.usedProducts, exit_date: s.exitDate, exit_time: s.exitTime}))); if (svErr) throw svErr; addLog(`✅ Serv. Técnico: ${data.services.length} registros.`);
            const { error: supErr } = await supabase.from('suppliers').upsert(data.suppliers.map(s => ({...s, contact_name: s.contactName}))); if (supErr) throw supErr; addLog(`✅ Proveedores: ${data.suppliers.length} registros.`);
            const { error: brandErr } = await supabase.from('brands').upsert(data.brands); if (brandErr) throw brandErr; addLog(`✅ Marcas: ${data.brands.length} registros.`);
            const { error: catErr } = await supabase.from('categories').upsert(data.categories); if (catErr) throw catErr; addLog(`✅ Categorías: ${data.categories.length} registros.`);
            const { error: bankErr } = await supabase.from('bank_accounts').upsert(data.bankAccounts.map(b => ({...b, bank_name: b.bankName, account_number: b.accountNumber}))); if (bankErr) throw bankErr; addLog(`✅ Cuentas Bancarias: ${data.bankAccounts.length} registros.`);
            addLog("🚀 Sincronización completada.");
        } catch (e: any) { addLog(`❌ Error al subir: ${e.message}`); } 
        finally { setLoading(false); }
    };

    const handleDownload = async () => {
        if (status !== 'CONNECTED') return alert("Sin conexión a base de datos");
        setLoading(true);
        addLog("Descargando datos de la nube...");
        const supabase = createClient(supabaseUrl, supabaseKey);
        try {
            const { data: products } = await supabase.from('products').select('*');
            const { data: clients } = await supabase.from('clients').select('*');
            const { data: sales } = await supabase.from('sales').select('*');
            const { data: movements } = await supabase.from('cash_movements').select('*');
            const { data: services } = await supabase.from('service_orders').select('*');
            const { data: suppliers } = await supabase.from('suppliers').select('*');
            const { data: brands } = await supabase.from('brands').select('*');
            const { data: categories } = await supabase.from('categories').select('*');
            const { data: bankAccounts } = await supabase.from('bank_accounts').select('*');
            
            const mappedData = {
                products: products || [],
                clients: clients?.map(c => ({...c, creditLine: c.credit_line, creditUsed: c.credit_used, totalPurchases: c.total_purchases, paymentScore: c.payment_score, digitalBalance: c.digital_balance, lastPurchaseDate: c.last_purchase_date})) || [],
                sales: sales?.map(s => ({...s, clientName: s.client_name, docType: s.doc_type, user: s.user_name, paymentBreakdown: s.payment_breakdown})) || [],
                movements: movements?.map(m => ({...m, paymentMethod: m.payment_method, user: m.user_name, financialType: m.financial_type, referenceId: m.reference_id, relatedItems: m.related_items})) || [],
                services: services?.map(s => ({...s, deviceModel: s.device_model, entryDate: s.entry_date, entryTime: s.entry_time, clientPhone: s.client_phone, usedProducts: s.used_products, exitDate: s.exit_date, exitTime: s.exit_time})) || [],
                suppliers: suppliers?.map(s => ({...s, contactName: s.contact_name })) || [],
                brands: brands || [],
                categories: categories || [],
                bankAccounts: bankAccounts?.map(b => ({...b, bankName: b.bank_name, accountNumber: b.account_number })) || []
            };
            onSyncDownload(mappedData);
            addLog("📥 Datos descargados y aplicados.");
        } catch (e: any) { addLog(`❌ Error al descargar: ${e.message}`); } 
        finally { setLoading(false); }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6"><Database className="text-blue-500"/> Configuración</h2>
                <div className="space-y-4 flex-1">
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Supabase Project URL</label><input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" placeholder="https://xyz.supabase.co" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)}/></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Supabase Anon Key</label><input type="password" className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm" placeholder="eyJhbGciOiJIUzI1NiIsInR5..." value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)}/></div>
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${status === 'CONNECTED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : status === 'ERROR' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>{status === 'CONNECTED' ? <CheckCircle/> : status === 'ERROR' ? <AlertTriangle/> : <Server/>}<div><p className="font-bold text-sm">{status === 'CONNECTED' ? 'Conectado' : status === 'ERROR' ? 'Error de Conexión' : 'Desconectado'}</p><p className="text-xs opacity-80">{status === 'CONNECTED' ? 'Listo para sincronizar' : 'Configure URL y Key'}</p></div></div>
                </div>
                <button onClick={handleSaveConfig} className="w-full py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl mt-4 hover:opacity-90 flex justify-center gap-2"><Save size={18}/> Guardar y Probar</button>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Zap className="text-yellow-500"/> Paso 1: Configurar Esquema</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Este botón creará la estructura de tablas necesaria en tu base de datos Supabase para que la aplicación funcione. Solo necesitas ejecutarlo una vez.</p>
                    <button onClick={handleCreateTableSchema} disabled={loading || status !== 'CONNECTED'} className="w-full py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Zap size={18}/> Crear Estructura de Tablas</button>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6"><CloudUpload className="text-purple-500"/> Paso 2: Sincronización</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button onClick={handleUpload} disabled={loading || status !== 'CONNECTED'} className="p-6 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:border-purple-800 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"><div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">{loading ? <Loader2 className="animate-spin"/> : <CloudUpload size={24}/>}</div><div className="text-center"><p className="font-bold text-purple-800 dark:text-purple-300">Subir Datos Locales</p><p className="text-xs text-purple-600 dark:text-purple-400">Sobreescribe la nube</p></div></button>
                        <button onClick={handleDownload} disabled={loading || status !== 'CONNECTED'} className="p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/10 dark:border-blue-800 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"><div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">{loading ? <Loader2 className="animate-spin"/> : <CloudDownload size={24}/>}</div><div className="text-center"><p className="font-bold text-blue-800 dark:text-blue-300">Descargar de Nube</p><p className="text-xs text-blue-600 dark:text-blue-400">Reemplaza datos locales</p></div></button>
                    </div>
                    <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-green-400 shadow-inner">
                        {logs.length === 0 ? <span className="opacity-50">// Esperando acciones...</span> : logs.map((l, i) => <div key={i} className="mb-1 whitespace-pre-wrap">{l}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseModule;
