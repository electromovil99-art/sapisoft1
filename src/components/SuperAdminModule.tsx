

import React, { useState } from 'react';
import { Building2, Plus, Search, User, Globe, CheckCircle, XCircle, Calendar, CreditCard, X, Edit, Power, Lock, Banknote, QrCode, Save, AlertTriangle, TrendingUp, Clock, DollarSign, ArrowUpRight, Flame, Wallet, Zap, Star, Crown, ChevronRight, Check, History, Calculator, ArrowRight, Gift, MessageCircle, FileText, Landmark, Filter, PieChart, Trash2, AlertOctagon } from 'lucide-react';
import { Tenant, SystemUser, IndustryType, PlanType, PaymentMethodType } from '../types';

interface SuperAdminModuleProps {
    tenants: Tenant[];
    onAddTenant: (tenant: Tenant, adminUser: SystemUser) => void;
    onUpdateTenant: (id: string, updates: Partial<Tenant>, newPassword?: string) => void;
    onDeleteTenant: (id: string) => void; // Changed from onClearAllData to onDeleteTenant
}

type MasterPaymentMethod = 'Efectivo' | 'Yape' | 'Plin' | 'Hotmart' | 'Bono' | 'Transferencia';

interface MasterPayment {
    id: string;
    date: string;
    tenantName: string;
    amount: number;
    method: MasterPaymentMethod;
    reference?: string;
    coverageStart?: string; 
    coverageEnd?: string;
    destinyAccount?: string; // Where the money went (Bank Name or 'Caja Chica')
}

// Mock Master Bank Accounts (Where the SaaS owner receives money)
const MASTER_BANK_ACCOUNTS = [
    { id: 'BCP-01', bank: 'BCP', currency: 'S/', number: '193-12345678-0-01', alias: 'Cuenta Principal' },
    { id: 'IBK-01', bank: 'INTERBANK', currency: 'S/', number: '200-300123456', alias: 'Recaudación' },
    { id: 'BBVA-01', bank: 'BBVA', currency: 'S/', number: '0011-0123-45-6789', alias: 'Fondo Reserva' },
];

const PLAN_PRICES: Record<PlanType, number> = {
    'BASICO': 39,
    'INTERMEDIO': 69,
    'FULL': 99
};

// Helper to generate dynamic past dates for consistent demo data
const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('es-PE');
};

const getFutureDate = (daysForward: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysForward);
    return d.toLocaleDateString('es-PE');
};

const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({ tenants, onAddTenant, onUpdateTenant, onDeleteTenant }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // --- MASTER CASH STATE ---
    const [payments, setPayments] = useState<MasterPayment[]>([
        // CELULARES EXPRESS: Bono
        { 
            id: '100', date: getPastDate(5), tenantName: 'CELULARES EXPRESS', amount: 0.00, method: 'Bono', reference: 'PRUEBA 15 DIAS (PLAN FULL)',
            coverageStart: getPastDate(5), coverageEnd: getFutureDate(10), destinyAccount: 'Promo'
        },
        // FARMACIA SALUD+: Historial
        { 
            id: '201', date: getPastDate(60), tenantName: 'FARMACIA SALUD+', amount: 0.00, method: 'Bono', reference: 'PRUEBA 15 DIAS',
            coverageStart: getPastDate(60), coverageEnd: getPastDate(45), destinyAccount: 'Promo'
        },
        { 
            id: '202', date: getPastDate(45), tenantName: 'FARMACIA SALUD+', amount: 69.00, method: 'Hotmart', reference: 'HM-1029 - SUSCRIPCIÓN INICIAL',
            coverageStart: getPastDate(45), coverageEnd: getPastDate(15), destinyAccount: 'Pasarela'
        },
        { 
            id: '203', date: getPastDate(15), tenantName: 'FARMACIA SALUD+', amount: 69.00, method: 'Efectivo', reference: 'EF-0054 - RENOV. MENSUAL',
            coverageStart: getPastDate(15), coverageEnd: getFutureDate(15), destinyAccount: 'Caja Chica'
        }, 
    ]);

    // --- EDIT / MANAGE STATE ---
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [editTab, setEditTab] = useState<'INFO' | 'SUBSCRIPTION'>('INFO');
    const [adminPasswordReset, setAdminPasswordReset] = useState('');
    
    // --- BILLING / CHARGE MODAL STATE ---
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [tenantToCharge, setTenantToCharge] = useState<Tenant | null>(null);
    
    // --- CASHBOX DETAIL MODAL STATE ---
    const [showCashDetailModal, setShowCashDetailModal] = useState(false);

    // Payment Form State
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<MasterPaymentMethod>('Efectivo');
    const [paymentReference, setPaymentReference] = useState('');
    const [selectedMasterAccount, setSelectedMasterAccount] = useState('');
    
    // Upgrade Logic State
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('BASICO');
    const [isUpgradeMode, setIsUpgradeMode] = useState(false);
    const [upgradeDetails, setUpgradeDetails] = useState<{
        credit: number;
        newCost: number;
        diff: number;
        days: number;
        dailyOld: number;
        dailyNew: number;
    } | null>(null);

    // Create Form State
    const [formData, setFormData] = useState({
        companyName: '',
        industry: 'TECH' as IndustryType,
        ownerName: '',
        username: '',
        password: '',
        phone: ''
    });

    // Helper: Parse DD/MM/YYYY
    const parseDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const getDaysRemaining = (expiryDate: string) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const exp = parseDate(expiryDate);
        const diffTime = exp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    };

    // Helper: Add exactly 1 month preserving day if possible
    const addOneMonth = (date: Date) => {
        const d = new Date(date);
        const targetMonth = d.getMonth() + 1;
        d.setMonth(targetMonth);
        // If date rolled over (e.g. Jan 31 -> Mar 3), set to last day of previous month
        if (d.getMonth() !== targetMonth % 12) {
            d.setDate(0); 
        }
        return d;
    };

    const filteredTenants = tenants.filter(t => 
        t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter Expiring Soon
    const expiringTenants = tenants
        .map(t => ({ ...t, daysLeft: getDaysRemaining(t.subscriptionEnd) }))
        .filter(t => t.daysLeft <= 15)
        .sort((a, b) => a.daysLeft - b.daysLeft);

    // --- TOTALS CALCULATION ---
    const totalRevenue = payments.filter(p => p.method !== 'Bono').reduce((acc, p) => acc + p.amount, 0); 
    const totalYape = payments.filter(p => p.method === 'Yape' || p.method === 'Plin').reduce((acc, p) => acc + p.amount, 0);
    const totalHotmart = payments.filter(p => p.method === 'Hotmart').reduce((acc, p) => acc + p.amount, 0);
    const totalCash = payments.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + p.amount, 0);
    const totalBank = payments.filter(p => p.method === 'Transferencia').reduce((acc, p) => acc + p.amount, 0);

    const tenantPaymentHistory = editingTenant 
        ? payments.filter(p => p.tenantName === editingTenant.companyName).sort((a,b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
        : [];

    // --- ACTIONS ---

    const handleOpenEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setEditTab('INFO');
        setSelectedPlan(tenant.planType);
        setPaymentAmount('');
        setIsUpgradeMode(false);
        setUpgradeDetails(null);
    };

    const handleOpenQuickCharge = (tenant: Tenant) => {
        setTenantToCharge(tenant);
        // Pre-fill amount based on current plan
        const price = PLAN_PRICES[tenant.planType];
        setPaymentAmount(price.toFixed(2));
        setSelectedPlan(tenant.planType);
        setIsUpgradeMode(false);
        setPaymentMethod('Efectivo');
        setPaymentReference('');
        setSelectedMasterAccount('');
        setShowChargeModal(true);
    };

    const handleWhatsAppReminder = (tenant: Tenant) => {
        if (!tenant.phone) return alert("La empresa no tiene teléfono registrado.");
        
        const daysLeft = getDaysRemaining(tenant.subscriptionEnd);
        let msg = '';
        
        if (daysLeft < 0) {
            msg = `Hola *${tenant.companyName}*, le saludamos de SapiSoft. Su suscripción venció el *${tenant.subscriptionEnd}*. Por favor realice el pago para reactivar el servicio.`;
        } else {
            msg = `Hola *${tenant.companyName}*, le recordamos que su plan *${tenant.planType}* vence el próximo *${tenant.subscriptionEnd}*. El monto a pagar es S/ ${PLAN_PRICES[tenant.planType]}.00.`;
        }

        const url = `https://wa.me/51${tenant.phone.replace(/\s/g,'')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    const handleDeleteClick = (tenant: Tenant) => {
        if (window.confirm(`¿Estás seguro de ELIMINAR la empresa "${tenant.companyName}"?\n\nEsta acción borrará a todos sus usuarios y su historial de pagos.`)) {
            // Clean up payments locally in SuperAdminModule
            setPayments(prev => prev.filter(p => p.tenantName !== tenant.companyName));
            // Trigger parent cleanup
            onDeleteTenant(tenant.id);
        }
    };

    const handleCreate = () => {
        if (!formData.companyName || !formData.username || !formData.password) {
            alert("Complete todos los campos obligatorios");
            return;
        }

        const newTenantId = Math.random().toString(36).substr(2, 9);
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 15);
        
        const initialPlan: PlanType = 'FULL';
        const bonoValue = 0.00;

        const newTenant: Tenant = {
            id: newTenantId,
            companyName: formData.companyName.toUpperCase(),
            industry: formData.industry,
            ownerName: formData.ownerName,
            phone: formData.phone,
            status: 'ACTIVE',
            planType: initialPlan,
            subscriptionEnd: endDate.toLocaleDateString('es-PE') 
        };

        const newAdminUser: SystemUser = {
            id: Math.random().toString(),
            username: formData.username,
            password: formData.password,
            fullName: formData.ownerName || 'Admin',
            role: 'ADMIN',
            active: true,
            permissions: [],
            industry: formData.industry,
            companyName: formData.companyName.toUpperCase()
        };

        const bonoPayment: MasterPayment = {
            id: Math.random().toString(),
            date: startDate.toLocaleDateString('es-PE'),
            tenantName: formData.companyName.toUpperCase(),
            amount: bonoValue,
            method: 'Bono',
            reference: 'REGALO BIENVENIDA (15 DÍAS - FULL)',
            coverageStart: startDate.toLocaleDateString('es-PE'),
            coverageEnd: endDate.toLocaleDateString('es-PE'),
            destinyAccount: 'Promo'
        };

        setPayments(prev => [bonoPayment, ...prev]); 
        onAddTenant(newTenant, newAdminUser);
        
        setShowCreateModal(false);
        setFormData({ companyName: '', industry: 'TECH', ownerName: '', username: '', password: '', phone: '' });
        alert(`Empresa creada con 15 días de prueba (Plan FULL).\nCosto registrado: S/ 0.00`);
    };

    const handleSaveChanges = () => {
        if (!editingTenant) return;
        onUpdateTenant(editingTenant.id, editingTenant, adminPasswordReset || undefined);
        setEditingTenant(null);
        setAdminPasswordReset('');
        alert("Datos actualizados correctamente.");
    };

    // Logic for Plan Calculation inside Edit Modal (Keeping existing logic)
    const handleSwitchPlan = (newPlan: PlanType) => {
        if(!editingTenant) return;
        setSelectedPlan(newPlan);
        const currentPrice = PLAN_PRICES[editingTenant.planType];
        const newPrice = PLAN_PRICES[newPlan];
        const daysLeft = getDaysRemaining(editingTenant.subscriptionEnd);
        
        // ... (Existing upgrade logic logic retained for "Gestionar" modal) ...
        const tenantPayments = payments.filter(p => p.tenantName === editingTenant.companyName);
        const hasPaidHistory = tenantPayments.some(p => p.method !== 'Bono');

        if (!hasPaidHistory) {
            setIsUpgradeMode(false); setUpgradeDetails(null); setPaymentAmount(newPrice.toFixed(2));
            return;
        }
        if (newPrice > currentPrice && daysLeft > 0) {
            const billingDays = Math.min(daysLeft, 30);
            const dailyOld = currentPrice / 30;
            const dailyNew = newPrice / 30;
            const proratedNew = dailyNew * billingDays;
            const creditOld = dailyOld * billingDays;
            const amountToPay = proratedNew - creditOld;
            setIsUpgradeMode(true);
            setPaymentAmount(amountToPay.toFixed(2));
            setUpgradeDetails({ credit: creditOld, newCost: proratedNew, diff: amountToPay, days: billingDays, dailyOld, dailyNew });
        } else {
            setIsUpgradeMode(false); setUpgradeDetails(null); setPaymentAmount(newPrice.toFixed(2));
        }
    };

    // --- SHARED PAYMENT REGISTRATION LOGIC ---
    const processPayment = (tenant: Tenant, mode: 'QUICK' | 'EDIT') => {
        if (!paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount < 0) return alert("Monto inválido"); 
        
        // Validate Reference/Account
        if ((paymentMethod === 'Yape' || paymentMethod === 'Hotmart' || paymentMethod === 'Plin' || paymentMethod === 'Transferencia') && !paymentReference.trim()) {
            return alert(`Para pagos con ${paymentMethod} es OBLIGATORIO ingresar el Nro. de Operación.`);
        }
        if (paymentMethod === 'Transferencia' && !selectedMasterAccount) {
            return alert("Seleccione la cuenta bancaria de destino.");
        }

        let updatedTenant: Tenant;
        let periodStart: string;
        let periodEnd: string;
        const today = new Date();

        // Determinar destino del dinero
        let destiny = 'Caja Chica';
        if (paymentMethod === 'Transferencia') {
            const acc = MASTER_BANK_ACCOUNTS.find(a => a.id === selectedMasterAccount);
            destiny = acc ? `${acc.bank} ${acc.alias}` : 'Banco';
        } else if (paymentMethod === 'Yape' || paymentMethod === 'Plin') {
            destiny = 'Billetera Digital';
        } else if (paymentMethod === 'Hotmart') {
            destiny = 'Plataforma Hotmart';
        }

        // Logic check: Is it renewal or upgrade?
        // For Quick Charge, we assume Renewal unless explicitly handled otherwise.
        // For Edit Modal, we use `isUpgradeMode`.
        
        const tenantPayments = payments.filter(p => p.tenantName === tenant.companyName);
        const hasPaidHistory = tenantPayments.some(p => p.method !== 'Bono');
        const isUpgrade = mode === 'EDIT' && isUpgradeMode;

        if (isUpgrade) {
            // UPGRADE LOGIC
            updatedTenant = { ...tenant, planType: selectedPlan, status: 'ACTIVE' };
            periodStart = today.toLocaleDateString('es-PE');
            periodEnd = tenant.subscriptionEnd;
            alert(`Upgrade Procesado. Plan actualizado a ${selectedPlan}.`);
        } else {
            // RENEWAL / FIRST PAYMENT LOGIC
            let nextDate: Date;
            let startDateCalc: Date;

            if (!hasPaidHistory) {
                // First real payment after trial
                startDateCalc = new Date();
                nextDate = addOneMonth(today);
            } else {
                const currentEnd = parseDate(tenant.subscriptionEnd);
                if (currentEnd > today) {
                    // Extend existing
                    startDateCalc = currentEnd;
                    nextDate = addOneMonth(currentEnd);
                } else {
                    // Renew expired
                    startDateCalc = new Date();
                    nextDate = addOneMonth(today);
                }
            }
            
            periodStart = startDateCalc.toLocaleDateString('es-PE');
            periodEnd = nextDate.toLocaleDateString('es-PE');

            updatedTenant = {
                ...tenant,
                planType: selectedPlan, // Ensure plan is set to what was charged
                status: 'ACTIVE',
                subscriptionEnd: nextDate.toLocaleDateString('es-PE')
            };
            alert(`Pago Registrado (${paymentMethod}).\nNuevo Vencimiento: ${updatedTenant.subscriptionEnd}`);
        }

        const newPayment: MasterPayment = {
            id: Math.random().toString(),
            date: new Date().toLocaleDateString('es-PE'),
            tenantName: tenant.companyName,
            amount: amount,
            method: paymentMethod,
            reference: paymentReference,
            coverageStart: periodStart,
            coverageEnd: periodEnd,
            destinyAccount: destiny
        };

        setPayments([newPayment, ...payments]);
        onUpdateTenant(tenant.id, updatedTenant);
        
        // Clean up UI
        if (mode === 'EDIT') {
            setEditingTenant(updatedTenant); 
            setIsUpgradeMode(false);
            setUpgradeDetails(null);
        } else {
            setShowChargeModal(false);
            setTenantToCharge(null);
        }
        setPaymentAmount('');
        setPaymentReference('');
        setPaymentMethod('Efectivo');
        setSelectedMasterAccount('');
    };

    // Helper inside render to check if it's trial or paid
    const isTrialMode = (tenantName: string) => {
        const tenantPayments = payments.filter(p => p.tenantName === tenantName);
        return !tenantPayments.some(p => p.method !== 'Bono');
    };

    return (
        <div className="flex flex-col h-full gap-6">
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden border border-slate-800">
                    <div className="relative z-10">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Empresas Activas</p>
                        <h2 className="text-3xl font-bold">{tenants.filter(t => t.status === 'ACTIVE').length}</h2>
                    </div>
                    <Building2 className="absolute right-4 bottom-4 text-slate-800" size={48}/>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative group cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setShowCashDetailModal(true)}>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} className="text-emerald-500"/>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Caja Total (Recaudación)</p>
                    <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        S/ {totalRevenue.toFixed(2)} <TrendingUp size={20}/>
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1">Click para ver detalle</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* LEFT: MAIN TENANT LIST */}
                <div className="flex-1 flex flex-col gap-4 min-h-[500px] lg:min-h-0">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
                                <Globe className="text-purple-600" size={20}/> Gestión de Empresas
                            </h2>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar empresa..." 
                                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm">
                                <Plus size={18}/> Crear Empresa
                            </button>
                        </div>
                    </div>

                    {/* Tenants Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-hidden">
                        <div className="h-full overflow-auto">
                            <table className="w-full text-left modern-table min-w-[700px]">
                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold uppercase text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4">Empresa</th>
                                        <th className="p-4">Plan Actual</th>
                                        <th className="p-4">Vencimiento</th>
                                        <th className="p-4 text-center">Estado</th>
                                        <th className="p-4 text-center">Acciones Rápidas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-300">
                                    {filteredTenants.map(tenant => {
                                        const daysLeft = getDaysRemaining(tenant.subscriptionEnd);
                                        const isTrial = isTrialMode(tenant.companyName);
                                        return (
                                        <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{tenant.companyName}</div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border mt-1 inline-block ${tenant.industry === 'TECH' ? 'bg-blue-50 text-blue-600 border-blue-200' : tenant.industry === 'PHARMA' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                                    {tenant.industry}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-bold text-[10px] uppercase px-2 py-1 rounded border ${
                                                    tenant.planType === 'BASICO' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                                    tenant.planType === 'INTERMEDIO' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    {tenant.planType || 'BASICO'}
                                                </span>
                                                {isTrial && <span className="ml-1 text-[9px] text-orange-500 font-bold">(TRIAL)</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400"/>
                                                    <span className={`font-bold ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {tenant.subscriptionEnd}
                                                    </span>
                                                </div>
                                                {daysLeft < 0 && <span className="text-[10px] text-red-500 font-bold">VENCIDO ({Math.abs(daysLeft)} días)</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                {tenant.status === 'ACTIVE' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded"><CheckCircle size={12}/> Activo</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded"><XCircle size={12}/> Inactivo</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleWhatsAppReminder(tenant)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Enviar Recordatorio WhatsApp">
                                                        <MessageCircle size={16}/>
                                                    </button>
                                                    <button onClick={() => handleOpenQuickCharge(tenant)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Cobrar Suscripción">
                                                        <DollarSign size={16}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenEdit(tenant)} 
                                                        className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 border border-purple-200"
                                                    >
                                                        <Edit size={14}/> Gestionar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(tenant)} 
                                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/30"
                                                        title="Eliminar Empresa"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ALERTS & MASTER CASH SUMMARY */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    {/* ... Existing Right Panel Code (Alerts/Cash) ... */}
                    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden min-h-[350px]">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 uppercase">
                                <DollarSign size={16}/> Caja Suscripciones
                            </h3>
                            <button onClick={() => setShowCashDetailModal(true)} className="text-[10px] font-bold text-emerald-600 hover:underline">Ver Todo</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><QrCode size={10}/> Yape/Plin</p>
                                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">S/ {totalYape.toFixed(2)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Landmark size={10}/> Bancos</p>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">S/ {totalBank.toFixed(2)}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600 col-span-2 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1"><Banknote size={10}/> Efectivo</p>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">S/ {totalCash.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Real</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">S/ {totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500">
                                    <tr><th className="px-3 py-2 text-left">Detalle</th><th className="px-3 py-2 text-right">Monto</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {payments.slice(0, 10).map(p => (
                                        <tr key={p.id} className={p.method === 'Bono' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                                            <td className="px-3 py-2">
                                                <div className="font-bold text-slate-700 dark:text-white truncate max-w-[120px]">{p.tenantName}</div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    {p.method === 'Bono' ? <Gift size={10} className="text-yellow-500"/> : (p.method === 'Yape' || p.method === 'Plin') ? <QrCode size={10}/> : p.method === 'Hotmart' ? <Flame size={10}/> : p.method === 'Transferencia' ? <Landmark size={10}/> : <Banknote size={10}/>}
                                                    {p.method} 
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className={`font-bold ${p.method === 'Bono' ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600'}`}>
                                                    +S/ {p.amount.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Vencimientos */}
                    <div className="h-48 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-900/30">
                            <h3 className="text-xs font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 uppercase"><AlertTriangle size={14}/> Vencimientos (15 días)</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {expiringTenants.length === 0 ? <div className="p-4 text-center text-slate-400 text-xs">No hay vencimientos próximos.</div> : (
                                <div className="space-y-2">{expiringTenants.map(t => (<div key={t.id} className="p-2 bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm flex justify-between items-center"><div className="truncate max-w-[120px]"><span className="font-bold text-xs text-slate-700 dark:text-white block">{t.companyName}</span><span className="text-[10px] text-slate-500">{t.subscriptionEnd}</span></div><button onClick={() => handleOpenQuickCharge(t)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100">Cobrar</button></div>))}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ... Modals (Create, Edit, Charge, Cash Detail) - Unchanged ... */}
            {/* Same modals as before, just ensuring they render */}
            {showCashDetailModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] md:h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-3"><PieChart size={24} className="text-emerald-400"/> Detalle de Cobros & Tesorería</h2>
                            <button onClick={() => setShowCashDetailModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        {/* Body */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Left Summary Sidebar */}
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-r-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 max-h-[30%] md:max-h-full md:h-full">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Total Recaudado</h4>
                                    <div className="text-3xl font-black text-slate-800 dark:text-white">S/ {totalRevenue.toFixed(2)}</div>
                                    <p className="text-[10px] text-slate-400 mt-1">Acumulado Histórico</p>
                                </div>
                                <div className="space-y-3 hidden md:block">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Efectivo</span>
                                            <Banknote size={14} className="text-emerald-500"/>
                                        </div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-white">S/ {totalCash.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Yape / Plin</span>
                                            <QrCode size={14} className="text-purple-500"/>
                                        </div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-white">S/ {totalYape.toFixed(2)}</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Bancos</span>
                                            <Landmark size={14} className="text-blue-500"/>
                                        </div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-white">S/ {totalBank.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 hidden md:block">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Cuentas Destino</h4>
                                    <div className="space-y-2">
                                        {MASTER_BANK_ACCOUNTS.map(acc => (
                                            <div key={acc.id} className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
                                                <span>{acc.bank}:</span>
                                                <span className="font-mono">{acc.number}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right List */}
                            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Todo</button>
                                        <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Hoy</button>
                                        <button className="px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Esta Semana</button>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Filter size={14}/> Filtrar
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto p-0">
                                    <table className="w-full text-left text-sm min-w-[600px]">
                                        <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold uppercase text-xs sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3">Fecha</th>
                                                <th className="px-6 py-3">Empresa</th>
                                                <th className="px-6 py-3">Método / Ref</th>
                                                <th className="px-6 py-3">Destino</th>
                                                <th className="px-6 py-3 text-right">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {payments.map(p => (
                                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{p.date}</td>
                                                    <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">{p.tenantName}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.method === 'Efectivo' ? 'bg-emerald-100 text-emerald-700' : p.method === 'Yape' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                                                {p.method}
                                                            </span>
                                                            {p.reference && <span className="text-xs text-slate-400 font-mono">{p.reference}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400">{p.destinyAccount || '-'}</td>
                                                    <td className="px-6 py-3 text-right font-bold text-slate-800 dark:text-white">S/ {p.amount.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: QUICK CHARGE / COBRO RAPIDO --- */}
            {showChargeModal && tenantToCharge && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
                            <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard size={20}/> Cobrar Suscripción</h3>
                            <button onClick={() => setShowChargeModal(false)}><X className="text-white/70 hover:text-white"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center mb-2">
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white">{tenantToCharge.companyName}</h4>
                                <p className="text-sm text-slate-500">Plan Actual: <span className="font-bold text-blue-600">{tenantToCharge.planType}</span></p>
                            </div>
                            
                            {/* Amount */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Monto a Cobrar (S/)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">S/</span>
                                    <input 
                                        type="number" 
                                        className="w-full pl-8 p-3 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 font-bold text-2xl text-slate-800 dark:text-white focus:border-blue-500 outline-none" 
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Method */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Método de Pago</label>
                                <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-sm" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as MasterPaymentMethod)}>
                                    <option value="Efectivo">Efectivo (Caja Chica)</option>
                                    <option value="Yape">Yape / Plin</option>
                                    <option value="Transferencia">Transferencia Bancaria</option>
                                    <option value="Hotmart">Hotmart</option>
                                </select>
                            </div>

                            {/* Reference / Bank Selection Logic */}
                            {paymentMethod === 'Transferencia' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Cuenta Destino</label>
                                    <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-sm mb-3" value={selectedMasterAccount} onChange={e => setSelectedMasterAccount(e.target.value)}>
                                        <option value="">-- Seleccionar Banco --</option>
                                        {MASTER_BANK_ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.bank} - {acc.alias}</option>)}
                                    </select>
                                </div>
                            )}

                            {(paymentMethod !== 'Efectivo') && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Nro. Operación / Ref.</label>
                                    <input type="text" className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 uppercase" placeholder="Ej. 12345678" value={paymentReference} onChange={e => setPaymentReference(e.target.value)}/>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setShowChargeModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                                <button onClick={() => processPayment(tenantToCharge, 'QUICK')} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-colors">Confirmar Pago</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create Tenant */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <Building2 size={20} className="text-purple-600"/> Crear Nueva Empresa
                            </h3>
                            <button onClick={() => setShowCreateModal(false)}><X className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* NEW: Initial Plan Selector */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm mb-4">
                                <p className="flex items-center gap-2 text-blue-800 dark:text-blue-200 font-bold mb-1"><Gift size={16}/> Prueba Gratuita (15 Días)</p>
                                <p className="text-slate-600 dark:text-slate-400 text-xs">
                                    Todas las cuentas nuevas inician con <strong>PLAN FULL</strong> por 15 días con costo <strong>S/ 0.00</strong>.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre Empresa</label><input type="text" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase" placeholder="Ej. FERRETERIA CENTRAL" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} autoFocus/></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Rubro</label><select className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value as IndustryType})}><option value="TECH">Tecnología / Celulares</option><option value="PHARMA">Farmacia / Botica</option><option value="RETAIL">Retail / General</option></select></div>
                            </div>
                            
                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                <h4 className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-2"><User size={16}/> Usuario Administrador Inicial</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre Dueño</label><input type="text" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Juan Perez" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})}/></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Teléfono</label><input type="text" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="999 000 111" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Usuario (Login)</label><input type="text" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="admin_empresa" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/></div>
                                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Contraseña</label><input type="password" className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="****" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/></div>
                                </div>
                            </div>
                            <button onClick={handleCreate} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg mt-2">Registrar Empresa & Generar Bono</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal EDIT/MANAGE Tenant */}
            {editingTenant && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 flex flex-col overflow-hidden max-h-[90vh]">
                        {/* Header Unchanged */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    <Building2 size={20} className="text-purple-600"/> {editingTenant.companyName}
                                </h3>
                                <p className="text-xs text-slate-500">ID: {editingTenant.id}</p>
                            </div>
                            <button onClick={() => setEditingTenant(null)}><X className="text-slate-400 hover:text-slate-600"/></button>
                        </div>
                        
                        <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
                            <button onClick={() => setEditTab('INFO')} className={`flex-1 py-3 text-sm font-bold border-b-2 ${editTab === 'INFO' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Información & Accesos</button>
                            <button onClick={() => setEditTab('SUBSCRIPTION')} className={`flex-1 py-3 text-sm font-bold border-b-2 ${editTab === 'SUBSCRIPTION' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Suscripción & Pagos</button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {editTab === 'INFO' && (
                                <>
                                    {/* ... Info Content (Same) ... */}
                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-700 dark:text-white flex items-center gap-2"><Power size={16}/> Estado del Servicio</h4>
                                            <p className="text-xs text-slate-500">Si desactivas, el cliente no podrá ingresar.</p>
                                        </div>
                                        <button onClick={() => setEditingTenant({...editingTenant, status: editingTenant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'})} className={`relative w-14 h-7 rounded-full transition-colors ${editingTenant.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${editingTenant.status === 'ACTIVE' ? 'left-8' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre Empresa</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 uppercase" value={editingTenant.companyName} onChange={e => setEditingTenant({...editingTenant, companyName: e.target.value})}/></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dueño</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600" value={editingTenant.ownerName} onChange={e => setEditingTenant({...editingTenant, ownerName: e.target.value})}/></div>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-white mb-2 flex items-center gap-2"><Lock size={14}/> Credenciales de Acceso</h4>
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                            <label className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase mb-1 block">Nueva Contraseña Admin</label>
                                            <div className="flex gap-2"><input type="text" className="flex-1 p-2 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-white dark:bg-slate-800" placeholder="Escribe para cambiar..." value={adminPasswordReset} onChange={e => setAdminPasswordReset(e.target.value)}/></div>
                                            <p className="text-[10px] text-yellow-600 mt-1">Dejar en blanco para mantener la actual.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {editTab === 'SUBSCRIPTION' && (
                                <>
                                    {/* CONDITIONAL RENDER: Check if Paid or Trial */}
                                    {isTrialMode(editingTenant.companyName) ? (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center border border-orange-200 dark:border-orange-800 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10"><Gift size={64}/></div>
                                            <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold flex justify-center items-center gap-1">
                                                <AlertTriangle size={14}/> Fin de Prueba Gratuita
                                            </p>
                                            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 my-1">{editingTenant.subscriptionEnd}</p>
                                            <p className="text-xs text-orange-600/80 mt-1">
                                                Plan Demo: <strong className="uppercase">{editingTenant.planType || 'FULL'}</strong> (Modo Prueba)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-900">
                                            <p className="text-xs text-blue-600 uppercase font-bold flex justify-center items-center gap-1">
                                                <CheckCircle size={14}/> Vencimiento Suscripción
                                            </p>
                                            <p className="text-3xl font-bold text-blue-800 dark:text-blue-400">{editingTenant.subscriptionEnd}</p>
                                            <p className="text-xs text-blue-500 mt-1">Plan Contratado: <strong className="uppercase">{editingTenant.planType}</strong></p>
                                        </div>
                                    )}

                                    {/* PLAN EVOLUTION VISUALIZATION */}
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-white mb-3 flex items-center gap-2"><Zap size={14}/> Evolución de Nivel (Upgrade)</h4>
                                        <div className="flex items-center justify-between relative mb-2 px-2">
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-600 -z-10 rounded-full"></div>
                                            
                                            {(['BASICO', 'INTERMEDIO', 'FULL'] as PlanType[]).map((plan) => (
                                                <div key={plan} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => handleSwitchPlan(plan)}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${selectedPlan === plan ? 'bg-slate-800 border-slate-200 text-white scale-110 shadow-lg' : 'bg-white border-slate-300 text-slate-300'}`}>
                                                        {plan === 'BASICO' ? <Star size={16} fill="currentColor"/> : plan === 'INTERMEDIO' ? <Zap size={16} fill="currentColor"/> : <Crown size={16} fill="currentColor"/>}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[10px] font-bold uppercase ${selectedPlan === plan ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{plan}</p>
                                                        <p className="text-[9px] text-slate-400">S/ {PLAN_PRICES[plan]}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* UPGRADE EXPLANATION BOX */}
                                    {isUpgradeMode && upgradeDetails && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
                                            <h5 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-3">
                                                <Calculator size={14}/> 
                                                Cálculo Proporcional ({upgradeDetails.days} días restantes)
                                            </h5>
                                            
                                            <div className="space-y-3 text-xs bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                                    <span>Plan Nuevo (x {upgradeDetails.days} días):</span>
                                                    <span className="font-mono">S/ {upgradeDetails.newCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                                    <span>(-) Crédito Plan Anterior:</span>
                                                    <span className="font-mono font-bold">- S/ {upgradeDetails.credit.toFixed(2)}</span>
                                                </div>
                                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                                <div className="flex justify-between items-center font-bold text-lg text-blue-800 dark:text-blue-200">
                                                    <span>DIFERENCIA A PAGAR:</span>
                                                    <span>S/ {upgradeDetails.diff.toFixed(2)}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1 italic text-center">
                                                    * Formula: (Costo Nuevo / 30 * Días) - (Costo Anterior / 30 * Días)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-white mb-3 flex items-center gap-2"><CreditCard size={14}/> Registrar {isUpgradeMode ? 'Upgrade' : 'Pago / Renovación'}</h4>
                                        
                                        <div className="space-y-4">
                                            {/* AMOUNT INPUT */}
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Monto a Registrar (S/)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">S/</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-full pl-8 p-3 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 font-bold text-lg" 
                                                        placeholder="0.00"
                                                        value={paymentAmount}
                                                        onChange={e => setPaymentAmount(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* METHOD */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Método de Pago</label>
                                                    <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 text-sm" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as MasterPaymentMethod)}>
                                                        <option value="Efectivo">Efectivo (Caja)</option>
                                                        <option value="Yape">Yape / Plin</option>
                                                        <option value="Transferencia">Transferencia</option>
                                                        <option value="Hotmart">Hotmart</option>
                                                        <option value="Bono">Bono (Solo 1 vez)</option>
                                                    </select>
                                                </div>
                                                
                                                {(paymentMethod !== 'Efectivo') && (
                                                    <div className="animate-in fade-in slide-in-from-left-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                                                            {paymentMethod === 'Bono' ? 'Referencia Bono' : 'Nro. Op / Ref'}
                                                        </label>
                                                        <input type="text" className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700" placeholder={paymentMethod === 'Bono' ? 'Ej. PROMO INICIO' : 'Ej. 123456'} value={paymentReference} onChange={e => setPaymentReference(e.target.value)}/>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button onClick={() => processPayment(editingTenant, 'EDIT')} className={`w-full py-3 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${isUpgradeMode ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}>
                                                    {isUpgradeMode ? <ArrowUpRight size={18}/> : <Save size={18}/>} 
                                                    {isUpgradeMode ? 'Procesar Upgrade' : 'Registrar Pago'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TENANT PAYMENT HISTORY */}
                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <h4 className="font-bold text-sm text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                                            <History size={14}/> Historial de Pagos del Cliente
                                        </h4>
                                        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 max-h-[150px] overflow-y-auto">
                                            {tenantPaymentHistory.length === 0 ? <div className="p-4 text-center text-xs text-slate-400">No hay pagos registrados para esta empresa.</div> : (
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold sticky top-0">
                                                        <tr>
                                                            <th className="px-3 py-2">Fecha</th>
                                                            <th className="px-3 py-2">Método</th>
                                                            <th className="px-3 py-2 text-center">Periodo Cubierto</th>
                                                            <th className="px-3 py-2 text-right">Monto</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                                                        {tenantPaymentHistory.map(p => (
                                                            <tr key={p.id} className={p.method === 'Bono' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                                                                <td className="px-3 py-2">{p.date}</td>
                                                                <td className="px-3 py-2">
                                                                    <div className="flex items-center gap-1">
                                                                        {p.method === 'Bono' ? <Gift size={10} className="text-yellow-500"/> : (p.method === 'Yape' || p.method === 'Plin') ? <QrCode size={10}/> : p.method === 'Hotmart' ? <Flame size={10}/> : <Banknote size={10}/>}
                                                                        {p.method}
                                                                    </div>
                                                                    {p.reference && <div className="text-[9px] text-slate-400 truncate max-w-[100px]" title={p.reference}>{p.reference}</div>}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {p.coverageStart && p.coverageEnd ? (
                                                                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 text-[9px] inline-block font-mono text-slate-600 dark:text-slate-300">
                                                                            {p.coverageStart} - {p.coverageEnd}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-slate-400">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-bold text-slate-700 dark:text-slate-300">S/ {p.amount.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setEditingTenant(null)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveChanges} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                <Save size={18}/> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminModule;