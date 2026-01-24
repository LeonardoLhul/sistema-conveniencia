import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, ShoppingCart } from 'lucide-react';
import { Product, SaleItem, Sale } from '../types';

interface POSProps {
  products: Product[];
  // Fix: changed onCompleteSale to accept a Sale without userId as it is added in the parent App component
  onCompleteSale: (sale: Omit<Sale, 'userId'>) => void;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('card');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.barcode.includes(term)
    );
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Produto sem estoque!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Fix: Updated type to Omit<Sale, 'userId'> to match the actual object structure at this stage
    const newSale: Omit<Sale, 'userId'> = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      items: [...cart],
      total,
      paymentMethod
    };

    onCompleteSale(newSale);
    setCart([]);
    alert("Venda realizada com sucesso!");
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Product Selection */}
      <div className="flex-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar produto ou bipar código..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto max-h-[600px] p-1">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left"
            >
              <div className="text-xs font-semibold text-indigo-600 mb-1">{product.category}</div>
              <div className="font-bold text-slate-800 line-clamp-2 min-h-[3rem]">{product.name}</div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-lg font-extrabold text-slate-900">R$ {product.price.toFixed(2)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.stock > product.minStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {product.stock} un.
                </span>
              </div>
            </button>
          ))}
          {searchTerm && filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Nenhum produto encontrado.
            </div>
          )}
          {!searchTerm && (
            <div className="col-span-full py-12 text-center text-slate-400 italic">
              Use a barra de busca para encontrar itens.
            </div>
          )}
        </div>
      </div>

      {/* Cart / Summary */}
      <div className="w-full md:w-96 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
          <ShoppingCart />
          <h3 className="text-xl font-bold">Carrinho</h3>
          <span className="ml-auto bg-indigo-500 text-xs px-2 py-1 rounded-full">{cart.length} itens</span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[300px]">
          {cart.map(item => (
            <div key={item.productId} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between font-semibold text-slate-800 mb-2">
                <span className="truncate pr-2">{item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"><Minus size={14} /></button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"><Plus size={14} /></button>
                </div>
                <button onClick={() => updateQuantity(item.productId, -999)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
              <ShoppingCart size={48} />
              <p>O carrinho está vazio</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Forma de Pagamento</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'card' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                <CreditCard size={18} />
                <span className="text-[10px] font-bold uppercase">Cartão</span>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'cash' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                <Banknote size={18} />
                <span className="text-[10px] font-bold uppercase">Dinheiro</span>
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'pix' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
              >
                <QrCode size={18} />
                <span className="text-[10px] font-bold uppercase">Pix</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-slate-400">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xl font-bold text-slate-900">Total</span>
              <span className="text-3xl font-black text-indigo-600">R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              FINALIZAR VENDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;