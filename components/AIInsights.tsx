
import React, { useState } from 'react';
import { Sparkles, Loader2, BrainCircuit, Lightbulb, TrendingUp, ShoppingBag } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { Product, Sale } from '../types';

interface AIInsightsProps {
  products: Product[];
  sales: Sale[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ products, sales }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    const result = await geminiService.analyzeInventory(products, sales);
    setAnalysis(result || "Erro ao gerar análise.");
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex p-4 rounded-3xl bg-indigo-100 text-indigo-600">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900">Insights Inteligentes</h2>
        <p className="text-lg text-slate-500 mx-auto max-w-2xl">
          Nossa inteligência artificial analisa seu estoque e histórico de vendas para sugerir as melhores estratégias de lucro.
        </p>
      </div>

      {!analysis && !loading && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-700 flex flex-col items-center gap-2">
              <Lightbulb size={24} />
              <p className="text-sm font-bold uppercase tracking-wide">Promoções</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-700 flex flex-col items-center gap-2">
              <TrendingUp size={24} />
              <p className="text-sm font-bold uppercase tracking-wide">Tendências</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 flex flex-col items-center gap-2">
              <ShoppingBag size={24} />
              <p className="text-sm font-bold uppercase tracking-wide">Mix de Produtos</p>
            </div>
          </div>
          <button
            onClick={generateInsights}
            className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 mx-auto"
          >
            <Sparkles size={24} />
            Gerar Análise Estratégica
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center justify-center gap-6">
          <Loader2 size={64} className="text-indigo-600 animate-spin" />
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900">Analisando dados da loja...</p>
            <p className="text-slate-500">Isso pode levar alguns segundos.</p>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl prose prose-invert max-w-none">
             <div className="flex items-center gap-3 mb-6">
               <Sparkles className="text-indigo-300" />
               <h3 className="text-2xl font-bold m-0">Recomendações da AI</h3>
             </div>
             <div className="text-indigo-100 leading-relaxed whitespace-pre-wrap">
               {analysis}
             </div>
          </div>
          <button
            onClick={() => setAnalysis(null)}
            className="w-full py-4 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
          >
            Limpar e refazer análise
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
