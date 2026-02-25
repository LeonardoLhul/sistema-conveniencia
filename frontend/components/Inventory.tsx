
import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { Product } from '../types';
import { useEffect } from 'react';

interface InventoryProps {
  products: Product[];
  onUpdate: (product: Product) => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
  onDelete: (id: string) => void;
}
const Inventory: React.FC<InventoryProps> = ({ products, onUpdate, onAdd, onDelete }) => {

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    barcode: ''
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: 0, costPrice: 0, stock: 0, minStock: 5, barcode: '' });
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({ ...product });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Controle de Estoque</h2>
          <p className="text-slate-500">Gerencie produtos e níveis de reposição.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
          style={{ backgroundColor: '#d9a441' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c99338'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d9a441'; }}
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none text-sm"
              onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isLow = product.stock <= product.minStock;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{product.barcode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-700'}`}>
                          {product.stock}
                        </span>
                        {isLow ? <ArrowDownRight size={14} className="text-rose-500" /> : <ArrowUpRight size={14} className="text-emerald-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isLow ? (
                        <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase">Reposição Necessária</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">Ok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 rounded-lg transition-colors" style={{ color: '#d9a441', backgroundColor: 'rgba(217, 164, 65, 0.1)' }}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => onDelete(product.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Package size={64} className="opacity-10 mb-4" />
              <p>Nenhum produto cadastrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-white flex justify-between items-center" style={{ backgroundColor: '#48733e' }}>
              <h3 className="text-lg font-bold">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-white/80" style={{ color: 'inherit' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto</label>
                <input
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Estoque Inicial</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Margem de Lucro</label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed"
                    value={formData.costPrice > 0 ? `${(((formData.price - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%` : '-'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mínimo para Alerta</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                    onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Categoria
                  </label>

                  <select
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value
                      })
                    }
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.categoria}>
                        {cat.categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Código de Barras</label>
                <input
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none font-mono"
                  onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg"
                  style={{ backgroundColor: '#d9a441' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c99338'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d9a441'; }}
                >Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
