
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
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
    { id: 'pos', label: 'Vendas', icon: ShoppingCart, roles: ['ADMIN', 'SALES'] },
    { id: 'inventory', label: 'Estoque', icon: Package, roles: ['ADMIN'] },
    { id: 'history', label: 'Relatórios', icon: History, roles: ['ADMIN', 'SALES'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 text-white border-r border-white/5" style={{ backgroundColor: '#48733e' }}>
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold tracking-tight">Conveniência    <span style={{ color: '#d9a441' }}>JAJA</span></h1>
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
                    ? 'text-white shadow-lg' 
                    : 'text-white/70 hover:bg-white/5'
                }`}
                style={activeView === item.id ? { backgroundColor: '#d9a441', color: '#48733e' } : { backgroundColor: 'transparent' }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#d9a441' }}>
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d9a441' }}>{user.role}</p>
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
      <div className="md:hidden fixed top-0 left-0 right-0 text-white p-4 flex justify-between items-center z-50" style={{ backgroundColor: '#48733e' }}>
        <h1 className="text-lg font-bold">ConvenienceFlow</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 text-white z-40 flex flex-col pt-20" style={{ backgroundColor: '#48733e' }}>
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
      <main className="flex-1 pt-16 md:pt-0">
        <div className="max-w-5xl mx-auto p-7 md:p-3">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
