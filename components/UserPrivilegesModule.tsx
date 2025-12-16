
import React, { useState, useEffect } from 'react';
import { User, Shield, Check, Lock, Plus, Trash2, Edit2, Search, Users, ShoppingCart, ShoppingBag, Wrench, X, Key } from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface UserPrivilegesModuleProps {
    users: SystemUser[];
    onAddUser: (u: SystemUser) => void;
    onUpdateUser: (u: SystemUser) => void;
    onDeleteUser: (id: string) => void;
}

const ALL_PERMISSIONS = {
    VENTAS: ['Acceso Módulo', 'Realizar Venta', 'Anular Venta', 'Ver Historial', 'Editar Precios', 'Aplicar Descuentos'],
    COMPRAS: ['Acceso Módulo', 'Registrar Compra', 'Ver Proveedores', 'Editar Proveedores'],
    INVENTARIO: ['Acceso Módulo', 'Ver Stock', 'Agregar Productos', 'Editar Productos', 'Eliminar Productos', 'Ajuste Stock'],
    SERVICIOS: ['Acceso Módulo', 'Recepcionar Equipo', 'Actualizar Estado', 'Entregar Equipo', 'Ver Todos los Tickets'],
    CAJA: ['Acceso Módulo', 'Ver Saldos', 'Registrar Ingreso/Egreso', 'Cerrar Caja'],
    CONFIGURACION: ['Acceso Configuración', 'Gestión Usuarios', 'Configurar Impresión']
};

const UserPrivilegesModule: React.FC<UserPrivilegesModuleProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<SystemUser>>({
        fullName: '', username: '', password: '', role: 'VENDEDOR', active: true, permissions: []
    });

    useEffect(() => {
        if (users.length > 0 && !selectedUser) setSelectedUser(users[0]);
    }, [users]);

    const handleOpenModal = (user?: SystemUser) => {
        if (user) {
            setIsEditing(true);
            setFormData({ ...user, password: '' }); // Don't show old password
        } else {
            setIsEditing(false);
            setFormData({ fullName: '', username: '', password: '', role: 'VENDEDOR', active: true, permissions: [] });
        }
        setShowModal(true);
    };

    const handleSaveUser = () => {
        if (!formData.username || !formData.fullName || (!isEditing && !formData.password)) {
            alert("Complete los campos obligatorios");
            return;
        }

        if (isEditing && selectedUser) {
            onUpdateUser({
                ...selectedUser,
                fullName: formData.fullName!,
                username: formData.username!,
                role: formData.role!,
                password: formData.password ? formData.password : selectedUser.password // Keep old pass if empty
            });
        } else {
            onAddUser({
                id: Math.random().toString(),
                fullName: formData.fullName!,
                username: formData.username!,
                password: formData.password!,
                role: formData.role!,
                active: true,
                permissions: formData.role === 'ADMIN' ? Object.values(ALL_PERMISSIONS).flat() : [] // Default perms
            } as SystemUser);
        }
        setShowModal(false);
    };

    const togglePermission = (perm: string) => {
        if (!selectedUser) return;
        if (selectedUser.role === 'ADMIN') return; 

        const hasPerm = selectedUser.permissions.includes(perm);
        const newPerms = hasPerm 
            ? selectedUser.permissions.filter(p => p !== perm)
            : [...selectedUser.permissions, perm];
        
        onUpdateUser({ ...selectedUser, permissions: newPerms });
    };

    return (
        <div className="flex h-full gap-6">
            
            {/* Left: User List */}
            <div className="w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <Users size={18}/> Usuarios del Sistema
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                        <input 
                            type="text" 
                            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-white placeholder-slate-400"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <button 
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedUser?.id === user.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${user.role === 'ADMIN' ? 'bg-indigo-600' : user.role === 'TECNICO' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                {user.fullName.substring(0,1)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{user.fullName}</div>
                                <div className="text-xs text-slate-400 font-medium flex justify-between">
                                    <span>{user.role}</span>
                                    <span className="opacity-70">@{user.username}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => handleOpenModal()} className="w-full py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
                        <Plus size={16}/> Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Right: Permissions Matrix */}
            {selectedUser && (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg ${selectedUser.role === 'ADMIN' ? 'bg-indigo-600' : selectedUser.role === 'TECNICO' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                                {selectedUser.fullName.substring(0,1)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedUser.fullName}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded uppercase">{selectedUser.role}</span>
                                    {selectedUser.role === 'ADMIN' && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1"><Shield size={12}/> Acceso Total</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {selectedUser.role !== 'ADMIN' && (
                                <>
                                    <button onClick={() => handleOpenModal(selectedUser)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                        <Edit2 size={16}/> Editar Datos
                                    </button>
                                    <button onClick={() => onDeleteUser(selectedUser.id)} className="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center gap-2">
                                        <Trash2 size={16}/> Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(ALL_PERMISSIONS).map(([module, perms]) => (
                                <div key={module} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                                    <h4 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2 uppercase text-xs tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                                        {module === 'VENTAS' ? <ShoppingCart size={14}/> : 
                                        module === 'COMPRAS' ? <ShoppingBag size={14}/> :
                                        module === 'SERVICIOS' ? <Wrench size={14}/> : 
                                        <Lock size={14}/>} 
                                        {module}
                                    </h4>
                                    <div className="space-y-2">
                                        {perms.map(perm => {
                                            const isChecked = selectedUser.permissions.includes(perm) || selectedUser.role === 'ADMIN';
                                            const isDisabled = selectedUser.role === 'ADMIN'; 
                                            return (
                                                <label key={perm} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        {isChecked && <Check size={12} className="text-white"/>}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={isChecked} 
                                                        onChange={() => togglePermission(perm)}
                                                        disabled={isDisabled}
                                                    />
                                                    <span className={`text-sm ${isChecked ? 'font-bold text-indigo-900 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>{perm}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-[400px] animate-in fade-in zoom-in-95 border border-slate-200 dark:border-slate-700">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nombre Completo</label>
                                <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Ej. Juan Perez"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Usuario (Login)</label>
                                <input type="text" className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Ej. juanp"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contraseña</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                    <input type="password" className="w-full pl-9 pr-3 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? 'Dejar en blanco para mantener' : '****'}/>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Rol / Cargo</label>
                                <select className="w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="VENDEDOR">Vendedor</option>
                                    <option value="TECNICO">Técnico</option>
                                    <option value="CAJERO">Cajero</option>
                                </select>
                            </div>
                            <button onClick={handleSaveUser} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">Guardar Usuario</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPrivilegesModule;
