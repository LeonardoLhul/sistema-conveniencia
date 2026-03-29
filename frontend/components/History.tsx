import React, { useState, useMemo } from 'react';
import { FileText, Calendar, ArrowRight, X } from 'lucide-react';
import { Sale } from '../types';

interface HistoryProps {
  sales: Sale[];
}

const History: React.FC<HistoryProps> = ({ sales }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(3, 0, 0, 0);
    return d;
  });
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

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

  const filteredSales = useMemo(() => 
    sales.filter(s => isSameBusinessDay(new Date(s.timestamp), selectedDate)),
    [sales, selectedDate]
  );

  const sortedSales = [...filteredSales].sort((a, b) => b.timestamp - a.timestamp);

  const getPaymentIcon = (method: string) => {
    switch (method.toUpperCase()) {
      case 'DEBITO':
        return '💳';
      case 'CREDITO':
        return '💳';
      case 'DINHEIRO':
        return '💵';
      case 'PIX':
        return '📱';
      default:
        return '💰';
    }
  };

  return (
    <>
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Histórico de Vendas
          </h2>
          <p className="text-slate-500">
            Relatório detalhado de todas as transações.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-500 font-medium">Data:</label>
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
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Total de {selectedDate.toLocaleDateString()}
          </p>
          <p className="text-2xl font-bold text-slate-900">
            R$ {filteredSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Vendas Concluídas
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {filteredSales.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Mais Utilizado
          </p>
          <p className="text-2xl font-bold text-slate-900 flex items-center gap-2 uppercase">
            {(() => {
              const count = filteredSales.reduce((acc, sale) => {
                const method = sale.paymentMethod.toUpperCase();
                acc[method] = (acc[method] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              const mostUsed = Object.keys(count).length > 0
                ? Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b)
                : null;

              return mostUsed ? (
                <>
                  {getPaymentIcon(mostUsed)}
                  {mostUsed}
                </>
              ) : (
                '—'
              );
            })()}
          </p>
        </div>

      </div>

      {/* TABELA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-left">

            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-center">Data / Hora</th>
                <th className="px-6 py-4 font-semibold text-center">ID Transação</th>
                <th className="px-6 py-4 font-semibold text-center">Itens</th>
                <th className="px-6 py-4 font-semibold text-center">Pagamento</th>
                <th className="px-6 py-4 font-semibold text-center">Total</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedSales.map((sale) => {
                const normalizedMethod = sale.paymentMethod.toUpperCase();

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50 group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-900 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(sale.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </td>

                    <td className="px-6 py-2 text-center">
                      <span className="font-mono text-xs text-slate-500 uppercase">
                        {sale.id}
                      </span>
                    </td>

                    <td className="px-6 py-2 text-center">
                      <div className="text-slate-600 text-sm">
                        {sale.items.length} itens{' '}
                        {sale.items.length > 0 &&
                          `(${sale.items[0].name}${
                            sale.items.length > 1 ? '...' : ''
                          })`}
                      </div>
                    </td>

                    <td className="px-6 py-2 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-tight">
                        <span>{getPaymentIcon(normalizedMethod)}</span>
                        {normalizedMethod}
                      </span>
                    </td>

                    <td className="px-6 py-2 text-center">
                      <div
                        className="flex items-center justify-end gap-2 font-bold"
                        style={{ color: '#d9a441' }}
                      >
                        R$ {sale.total.toFixed(2)}
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-2 text-center">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>

          {sortedSales.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <FileText size={64} className="opacity-10 mb-4" />
              <p>Nenhuma venda registrada até o momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    {selectedSale && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
        onClick={() => setSelectedSale(null)}
      >
        <div
          className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-500">Detalhes da venda</p>
              <h3 className="text-2xl font-bold text-slate-900">Transação {selectedSale.id}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {new Date(selectedSale.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => setSelectedSale(null)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-96px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pagamento</p>
                <p className="mt-2 text-lg font-bold text-slate-900 uppercase">
                  {getPaymentIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Itens</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)} unidade(s)
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                <p className="mt-2 text-lg font-bold" style={{ color: '#d9a441' }}>
                  R$ {selectedSale.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <span>Produto</span>
                <span>Qtd.</span>
                <span>Total</span>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedSale.items.map((item) => (
                  <div key={`${selectedSale.id}-${item.productId}`} className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-4 items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">R$ {item.price.toFixed(2)} por unidade</p>
                    </div>
                    <span className="font-bold text-slate-700 text-center">{item.quantity}</span>
                    <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default History;
