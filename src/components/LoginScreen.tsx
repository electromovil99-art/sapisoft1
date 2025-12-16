
import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { SystemUser, Tenant } from '../types';

interface LoginScreenProps { onLogin: (user: SystemUser) => void; users: SystemUser[]; tenants: Tenant[]; onResetPassword?: any; }

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const found = users.find(u => u.username === username && u.password === password);
        if (found) onLogin(found);
        else setError('Credenciales inválidas (Prueba: admin / 123)');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-white">SapiSoft ERP</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-400">Usuario</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18}/><input type="text" className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin"/></div></div>
                    <div><label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-400">Contraseña</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400" size={18}/><input type="password" className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" value={password} onChange={e => setPassword(e.target.value)} placeholder="123"/></div></div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex justify-center items-center gap-2">Ingresar <ArrowRight size={18}/></button>
                </form>
            </div>
        </div>
    );
};
export default LoginScreen;
