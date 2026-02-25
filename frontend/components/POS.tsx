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
  const [paymentMethod, setPaymentMethod] = useState <'DINHEIRO' | 'CREDITO' | 'PIX' | 'DEBITO'> ('PIX');

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
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none text-lg"
            onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(217, 164, 65, 0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto max-h-[600px] p-1">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-amber-400 hover:ring-1 transition-all text-left"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d9a441'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: '#48733e' }}>{product.category}</div>
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
        <div className="p-6 text-white flex items-center gap-3" style={{ backgroundColor: '#48733e' }}>
          <ShoppingCart />
          <h3 className="text-xl font-bold">Carrinho</h3>
          <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#d9a441', color: '#48733e' }}>{cart.length} itens</span>
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
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setPaymentMethod('DEBITO')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'DEBITO' ? 'text-white border' : 'bg-white border-slate-200 text-slate-500'}`}
                style={paymentMethod === 'DEBITO' ? { backgroundColor: '#d9a441', borderColor: '#d9a441', color: '#48733e' } : {}}
              >
                <CreditCard size={18} />
                <span className="text-[10px] font-bold uppercase">Débito</span>
              </button>
               <button
                onClick={() => setPaymentMethod('CREDITO')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'CREDITO' ? 'text-white border' : 'bg-white border-slate-200 text-slate-500'}`}
                style={paymentMethod === 'CREDITO' ? { backgroundColor: '#d9a441', borderColor: '#d9a441', color: '#48733e' } : {}}
              >
                <CreditCard size={18} />
                <span className="text-[10px] font-bold uppercase">Crédito</span>
              </button>
              <button
                onClick={() => setPaymentMethod('DINHEIRO')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'DINHEIRO' ? 'text-white border' : 'bg-white border-slate-200 text-slate-500'}`}
                style={paymentMethod === 'DINHEIRO' ? { backgroundColor: '#d9a441', borderColor: '#d9a441', color: '#48733e' } : {}}
              >
                
                <Banknote size={18} />
                <span className="text-[10px] font-bold uppercase">Dinheiro</span>
              </button>
              <button
                onClick={() => setPaymentMethod('PIX')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${paymentMethod === 'PIX' ? 'text-white border' : 'bg-white border-slate-200 text-slate-500'}`}
                style={paymentMethod === 'PIX' ? { backgroundColor: '#d9a441', borderColor: '#d9a441', color: '#48733e' } : {}}
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
              <span className="text-3xl font-black" style={{ color: '#d9a441' }}>R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-4 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#d9a441' }}
              onMouseEnter={(e) => { if (!cart.length) return; e.currentTarget.style.backgroundColor = '#c99338'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d9a441'; }}
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