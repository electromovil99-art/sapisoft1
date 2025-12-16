
import React, { useState } from 'react';
import { Building2, Globe, CheckCircle, XCircle, Calendar, DollarSign, TrendingUp, Plus, Search } from 'lucide-react';
import { Tenant, SystemUser, IndustryType } from '../types';

interface SuperAdminModuleProps {
    tenants: Tenant[];
    onAddTenant: (tenant: Tenant, adminUser: SystemUser) => void;
    onUpdateTenant: (id: string, updates: Partial<Tenant>) => void;
}

const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({ tenants, onAddTenant, onUpdateTenant }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ companyName: '', industry: 'TECH', ownerName: '', username: '', password: '', phone: '' });

    const handleCreate = () => {
        const newTenant: Tenant = { id: Math.random().toString(), companyName: formData.companyName.toUpperCase(), industry: formData.industry as IndustryType, ownerName: formData.ownerName, phone: formData.phone, status: 'ACTIVE', planType: 'FULL', subscriptionEnd: '30/12/2025' };
        const newUser: SystemUser = { id: Math.random().toString(), username: formData.username, password: formData.password, fullName: 'Admin', role: 'ADMIN', active: true, permissions: [], industry: formData.industry as IndustryType, companyName: formData.companyName.toUpperCase() };
        onAddTenant(newTenant, newUser);
        setShowModal(false);
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden"><div className="relative z-10"><p className="text-slate-400 text-xs font-bold uppercase mb-1">Empresas Activas</p><h2 className="text-3xl font-bold">{tenants.filter(t => t.status === 'ACTIVE').length}</h2></div><Building2 className="absolute right-4 bottom-4 text-slate-800" size={48}/></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><p className="text-slate-500 text-xs font-bold uppercase mb-1">Recaudación Total</p><h2 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">S/ {tenants.length * 99}.00 <TrendingUp size={20}/></h2></div>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><Globe className="text-purple-600" size={20}/> Gestión de Empresas SaaS</h2>
                    <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={16}/> Nueva Empresa</button>
                </div>
                <div className="flex-1 overflow-auto"><table className="w-full text-left modern-table"><thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs"><tr><th className="p-4">Empresa</th><th className="p-4">Plan</th><th className="p-4">Vencimiento</th><th className="p-4 text-center">Estado</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{tenants.map(t => (<tr key={t.id}><td className="p-4"><div className="font-bold">{t.companyName}</div><span className="text-xs text-slate-500">{t.industry}</span></td><td className="p-4"><span className="font-bold text-[10px] uppercase px-2 py-1 rounded bg-slate-100 border">{t.planType}</span></td><td className="p-4 font-bold text-slate-600">{t.subscriptionEnd}</td><td className="p-4 text-center">{t.status === 'ACTIVE' ? <span className="text-emerald-600 font-bold flex items-center justify-center gap-1"><CheckCircle size={14}/> Activo</span> : <span className="text-red-500 font-bold flex items-center justify-center gap-1"><XCircle size={14}/> Inactivo</span>}</td></tr>))}</tbody></table></div>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
                        <h3 className="font-bold text-lg">Nueva Empresa</h3>
                        <input className="w-full p-2 border rounded" placeholder="Nombre Empresa" onChange={e => setFormData({...formData, companyName: e.target.value})}/>
                        <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, industry: e.target.value})}><option value="TECH">Tecnología</option><option value="PHARMA">Farmacia</option></select>
                        <input className="w-full p-2 border rounded" placeholder="Usuario Admin" onChange={e => setFormData({...formData, username: e.target.value})}/>
                        <input className="w-full p-2 border rounded" placeholder="Contraseña" onChange={e => setFormData({...formData, password: e.target.value})}/>
                        <div className="flex gap-2"><button onClick={handleCreate} className="flex-1 py-2 bg-purple-600 text-white rounded font-bold">Crear</button><button onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-500">Cancelar</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SuperAdminModule;
