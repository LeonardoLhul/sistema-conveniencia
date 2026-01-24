
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Product, Sale } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalSalesValue = sales.reduce((sum, s) => sum + s.total, 0);
  const avgTicket = sales.length > 0 ? totalSalesValue / sales.length : 0;

  // Process data for charts
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const total = sales
      .filter(s => new Date(s.timestamp).toDateString() === d.toDateString())
      .reduce((sum, s) => sum + s.total, 0);
    return { name: dayStr, value: total };
  });

  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Visão Geral</h2>
        <p className="text-slate-500">Acompanhe o desempenho da sua loja em tempo real.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-medium text-emerald-600">+12.5%</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Vendas Totais</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ {totalSalesValue.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-blue-600">85 hoje</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Médio</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ {avgTicket.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Package size={20} />
            </div>
            <span className="text-xs font-medium text-amber-600">{products.length} itens</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Valor em Estoque</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ {inventoryValue.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-medium text-rose-600">Ação imediata</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Baixo Estoque</p>
          <h3 className="text-2xl font-bold text-slate-900">{lowStockItems.length} Itens</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-slate-800">Tendência de Vendas (7 dias)</h4>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-slate-800">Alertas de Reposição</h4>
            <button className="text-indigo-600 text-sm font-medium hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? lowStockItems.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-rose-500">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-600">{item.stock} un.</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Crítico: {item.minStock}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Package size={48} className="mb-2 opacity-20" />
                <p>Estoque em conformidade.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
