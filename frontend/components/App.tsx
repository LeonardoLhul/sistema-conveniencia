
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import POS from './POS';
import Inventory from './Inventory';
import History from './History';
import Login from './Login';
import { View, Product, Sale, User } from '../types';
import { apiClient } from '../services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('app_view');
    return saved as View || 'dashboard';
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados e sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'SALES' && view === 'dashboard') setView('pos');
      loadProducts();
    }
    setIsLoading(false);
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiClient.getProducts();
      if (response.success && response.data) {
        // Converter dados do banco para o formato do app
        const formattedProducts: Product[] = response.data.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          category: p.category || 'Sem Categoria',
          price: parseFloat(p.price),
          costPrice: parseFloat(p.cost_price) || 0,
          stock: p.quantity || 0,
          minStock: p.min_quantity || 0,
          barcode: p.barcode || ''
        }));
        setProducts(formattedProducts);
        localStorage.setItem('products', JSON.stringify(formattedProducts));
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  useEffect(() => {
    if (products.length > 0) localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // quando o usuário mudar, recarrega histórico do servidor
  useEffect(() => {
    if (!user) return;
    apiClient.getSales(user.token)
      .then(res => {
        if (res.success && res.data) {
          setSales(res.data);
        }
      })
      .catch(err => console.error('Erro carregando vendas:', err));
  }, [user]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('user_session', JSON.stringify(loggedUser));
    const initialView = loggedUser.role === 'ADMIN' ? 'dashboard' : 'pos';
    setView(initialView);
    localStorage.setItem('app_view', initialView);

    // Buscar produtos do backend após login
    loadProducts();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_view');
    localStorage.removeItem('user_session');
  };

  const handleUpdateProduct = async (updated: Product) => {
    if (!user) return;
    try {
      console.log('Atualizando produto:', updated.id, updated);

      // Atualizar produto no backend
      const prodRes = await apiClient.updateProduct(parseInt(updated.id), {
        name: updated.name,
        barcode: updated.barcode,
        price: updated.price,
        cost_price: updated.costPrice || 0,
        category: updated.category
      }, user.token);


      // atualizar estoque (tratando falhas separadamente)
      let stockRes: any = { success: true };
      try {
        stockRes = await apiClient.updateStock(parseInt(updated.id), updated.stock, user.token);
      } catch (e) {
        console.warn('updateStock falhou:', e);
        // tentar carregar a resposta do servidor se existir
        stockRes = (e as any)?.message ? { success: false, message: (e as any).message } : { success: false, message: 'Erro ao atualizar estoque' };
      }

      let minRes: any = { success: true };
      try {
        minRes = await apiClient.setMinQuantity(parseInt(updated.id), updated.minStock, user.token);
      } catch (e) {
        console.warn('setMinQuantity falhou:', e);
        minRes = (e as any)?.message ? { success: false, message: (e as any).message } : { success: false, message: 'Erro ao atualizar quantidade mínima' };
      }

      // Sincronizar estado local com backend (se alguma operação parcial falhar, recarregamos)
      if (!stockRes.success || !minRes.success) {
        await loadProducts();
        const messages = [] as string[];
        if (!stockRes.success) messages.push(`Estoque: ${stockRes.message || 'falha'}`);
        if (!minRes.success) messages.push(`Mínimo: ${minRes.message || 'falha'}`);
        alert(`Atualizado parcialmente. ${messages.join(' | ')}`);
        return;
      }

      // atualizar estado local
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      // garantir sincronização da UI com o backend
      try { await loadProducts(); } catch { }
      const message = (error as any)?.message || 'Erro ao salvar produto. Tente novamente.';
      alert(message);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!user) return;

    try {
      // Criar produto no backend
      const result = await apiClient.createProduct(
        {
          name: newProduct.name,
          barcode: newProduct.barcode,
          price: newProduct.price,
          cost_price: newProduct.costPrice || 0,
          category: newProduct.category || 'Sem Categoria',
          stock: newProduct.stock,
          min_stock: newProduct.minStock
        },
        user.token
      );

      if (result.success) {
        const product: Product = { ...newProduct, id: result.product_id.toString() };
        setProducts(prev => [...prev, product]);
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto. Tente novamente.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;

    if (window.confirm("Deseja excluir este produto?")) {
      try {
        await apiClient.deleteProduct(parseInt(id), user.token);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto. Tente novamente.');
      }
    }
  };

  const handleCompleteSale = async (saleData: Omit<Sale, 'userId'>) => {
    if (!user) return;
    const sale: Sale = { ...saleData, userId: user.id };

    try {
      const result = await apiClient.createSale(sale, user.token);
      if (!result.success) {
        // mostre a mensagem do servidor se houver
        const msg = result.message || 'Erro desconhecido';
        throw new Error(msg);
      }

      // atualizar id gerado pelo servidor, se houver
      if (result.sale_id) {
        sale.id = result.sale_id.toString();
      }

      // adicionar à lista local
      setSales(prev => [...prev, sale]);

      // ajustar estoque localmente
      setProducts(prev => prev.map(product => {
        const soldItem = sale.items.find(item => item.productId === product.id);
        if (soldItem) {
          return { ...product, stock: Math.max(0, product.stock - soldItem.quantity) };
        }
        return product;
      }));
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert(`Erro ao registrar venda: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  };

  const handleInternalConsumption = async (items: Sale['items']) => {
    if (!user) return;

    try {
      const result = await apiClient.consumeInternal(items, user.token);
      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido');
      }

      setProducts(prev => prev.map(product => {
        const consumedItem = items.find(item => item.productId === product.id);
        if (consumedItem) {
          return { ...product, stock: Math.max(0, product.stock - consumedItem.quantity) };
        }
        return product;
      }));
    } catch (error) {
      console.error('Erro ao registrar consumo interno:', error);
      alert(`Erro ao registrar consumo interno: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f2ea' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300" style={{ borderTopColor: '#d9a441' }}></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    // Verificação de segurança adicional para o render
    const isAdmin = user.role === 'ADMIN';
    const isGerente = user.role === 'GERENTE';
    const isCaixa = user.role === 'CAIXA';

    switch (view) {
      case 'dashboard': return isAdmin || isGerente ? <Dashboard products={products} sales={sales} /> : <POS products={products} onCompleteSale={handleCompleteSale} onInternalConsumption={handleInternalConsumption} />;
      case 'pos': return <POS products={products} onCompleteSale={handleCompleteSale} onInternalConsumption={handleInternalConsumption} />;
      case 'inventory': return isAdmin || isGerente ? <Inventory products={products} onUpdate={handleUpdateProduct} onAdd={handleAddProduct} onDelete={handleDeleteProduct} /> : null;
      case 'history':
        // apenas ADMIN vê tudo; vendedores veem só suas vendas
        return <History sales={isAdmin || isGerente ? sales : sales.filter(s => s.userId === user.id)} />;
      default: return <POS products={products} onCompleteSale={handleCompleteSale} onInternalConsumption={handleInternalConsumption} />;
    }
  };

  return (
    <Layout activeView={view} onNavigate={setView} user={user} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
