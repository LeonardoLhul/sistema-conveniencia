
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Sparkles, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { View, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { id: 'pos', label: 'Vendas (POS)', icon: ShoppingCart, roles: ['ADMIN', 'SALES'] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: ['ADMIN'] },
    { id: 'history', label: 'Relatórios', icon: History, roles: ['ADMIN', 'SALES'] },
    { id: 'ai', label: 'Insights AI', icon: Sparkles, roles: ['ADMIN'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-indigo-950 text-white border-r border-white/5">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Convenience<span className="text-indigo-400">Flow</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-indigo-200 hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-indigo-950 text-white p-4 flex justify-between items-center z-50">
        <h1 className="text-lg font-bold">ConvenienceFlow</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-indigo-950 text-white z-40 flex flex-col pt-20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id as View);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 px-8 py-5 text-xl font-medium border-b border-white/5"
            >
              <item.icon size={28} />
              {item.label}
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-8 py-5 text-xl font-medium text-rose-400 mt-auto"
          >
            <LogOut size={28} />
            Sair
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
