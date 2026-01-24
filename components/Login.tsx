
import React, { useState } from 'react';
import { ShoppingBag, Lock, User as UserIcon, Loader2, LogIn } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulando chamada ao Backend (Node.js + JWT)
    // Em um sistema real, o backend verificaria as credenciais e retornaria o cargo (Role)
    setTimeout(() => {
      const isAdmin = username.toLowerCase() === 'admin';
      
      const mockUser: User = {
        id: isAdmin ? '1' : '2',
        name: isAdmin ? 'Gerente Geral' : `Vendedor ${username}`,
        email: isAdmin ? 'admin@loja.com' : `${username}@loja.com`,
        role: isAdmin ? 'ADMIN' : 'SALES',
        token: 'fake-jwt-token'
      };

      onLogin(mockUser);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/40 mb-6 transform -rotate-3">
            <ShoppingBag className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Flow<span className="text-indigo-400">Store</span>
          </h1>
          <p className="text-slate-400 mt-3 font-medium">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-4 tracking-widest">Usuário ou Login</label>
            <div className="relative group">
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Ex: admin ou joao"
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-4 tracking-widest">Senha de Acesso</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <LogIn size={22} />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4 text-center">
          <p className="text-slate-500 text-sm italic">
            Dica: use <span className="text-indigo-400 font-mono">admin</span> para acesso completo.
          </p>
          <button className="text-slate-500 text-xs font-semibold hover:text-white transition-colors uppercase tracking-widest">
            Suporte Técnico
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
