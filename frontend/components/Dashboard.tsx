
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { Product, Sale } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(3, 0, 0, 0);
    return d;
  });

  // Business day helper: store's business day starts at 03:00
  const BUSINESS_DAY_START_HOUR = 3;

  const getBusinessDate = (dt: Date) => {
    const shifted = new Date(dt.getTime() - BUSINESS_DAY_START_HOUR * 60 * 60 * 1000);
    return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate());
  };

  const isSameBusinessDay = (a: Date, b: Date) => {
    const da = getBusinessDate(a);
    const db = getBusinessDate(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
  };

  const formatDateInput = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedSales = useMemo(() => sales.filter(s => isSameBusinessDay(new Date(s.timestamp), selectedDate)), [sales, selectedDate]);
  const selectedTotal = useMemo(() => selectedSales.reduce((sum, s) => sum + s.total, 0), [selectedSales]);
  const selectedAvgTicket = selectedSales.length > 0 ? selectedTotal / selectedSales.length : 0;

  const prevDate = useMemo(() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); return d; }, [selectedDate]);
  const prevSales = useMemo(() => sales.filter(s => isSameBusinessDay(new Date(s.timestamp), prevDate)), [sales, prevDate]);
  const prevTotal = useMemo(() => prevSales.reduce((sum, s) => sum + s.total, 0), [prevSales]);
  const percentChange = prevTotal > 0 ? ((selectedTotal - prevTotal) / prevTotal) * 100 : 0;

  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalSalesValue = sales.reduce((sum, s) => sum + s.total, 0);
  const avgTicket = sales.length > 0 ? totalSalesValue / sales.length : 0;

  // Process data for charts
  const salesByDay = (() => {
    const base = getBusinessDate(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(base);
      day.setDate(base.getDate() - (6 - i));
      const dayStr = day.toLocaleDateString('pt-BR', { weekday: 'short' });
      const total = sales
        .filter(s => isSameBusinessDay(new Date(s.timestamp), day))
        .reduce((sum, s) => sum + s.total, 0);
      return { name: dayStr, value: total };
    });
  })();

  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Visão Geral</h2>
          <p className="text-slate-500">Acompanhe o desempenho da sua loja em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">Data:</label>
          <input
            type="date"
            className="px-3 py-2 rounded-lg border border-slate-200"
            value={formatDateInput(selectedDate)}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-');
              const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 3, 0, 0, 0);
              setSelectedDate(date);
            }}
          />
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
            {(() => {
              const positive = percentChange >= 0;
              return (
                <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {positive ? '+' : ''}{percentChange.toFixed(1)}%
                </span>
              );
            })()}
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Vendas em {selectedDate.toLocaleDateString()}</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ {selectedTotal.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-blue-600">{selectedSales.length} hoje</span>
          </div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ticket Médio ({selectedDate.toLocaleDateString()})</p>
          <h3 className="text-2xl font-bold text-slate-900">R$ {selectedAvgTicket.toFixed(2)}</h3>
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
            <button className="text-sm font-medium hover:underline" style={{ color: '#d9a441' }}>Ver tudo</button>
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
