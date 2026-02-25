import React from 'react';
import { FileText, Download, Calendar, ArrowRight } from 'lucide-react';
import { Sale } from '../types';

interface HistoryProps {
  sales: Sale[];
}

const History: React.FC<HistoryProps> = ({ sales }) => {

  const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

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

  const mostUsedPaymentMethod = React.useMemo(() => {
    if (!sales.length) return null;

    const count = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod.toUpperCase(); // NORMALIZA AQUI
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(count).reduce((a, b) =>
      count[a] > count[b] ? a : b
    );
  }, [sales]);

  return (
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

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-all shadow-sm">
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Total de Hoje
          </p>
          <p className="text-2xl font-bold text-slate-900">
            R$ {sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Vendas Concluídas
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {sales.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Mais Utilizado
          </p>
          <p className="text-2xl font-bold text-slate-900 flex items-center gap-2 uppercase">
            {mostUsedPaymentMethod ? (
              <>
                {getPaymentIcon(mostUsedPaymentMethod)}
                {mostUsedPaymentMethod}
              </>
            ) : (
              '—'
            )}
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
  );
};

export default History;
