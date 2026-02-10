
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
  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados e sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Vendedores começam direto no POS
      if (parsedUser.role === 'SALES') setView('pos');
      
      // Buscar produtos do backend
      loadProducts();
    }

    const savedSales = localStorage.getItem('sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
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
          category: 'Geral',
          price: parseFloat(p.price),
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

  useEffect(() => {
    if (sales.length > 0) localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('user_session', JSON.stringify(loggedUser));
    setView(loggedUser.role === 'ADMIN' || 'GERENTE' ? 'dashboard' : 'pos');
    
    // Buscar produtos do backend após login
    loadProducts();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  const handleUpdateProduct = async (updated: Product) => {
    if (!user) return;
    
    try {
      console.log('Atualizando produto:', updated.id, updated);
      
      // Atualizar produto no backend
      await apiClient.updateProduct(
        parseInt(updated.id),
        {
          name: updated.name,
          barcode: updated.barcode,
          price: updated.price
        },
        user.token
      );

      // Atualizar estoque no backend
      await apiClient.updateStock(
        parseInt(updated.id),
        updated.stock,
        user.token
      );

      // Atualizar quantidade mínima no backend
      await apiClient.setMinQuantity(
        parseInt(updated.id),
        updated.minStock,
        user.token
      );

      // Atualizar estado local
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao salvar produto. Tente novamente.');
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
          price: newProduct.price
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

  const handleCompleteSale = (saleData: Omit<Sale, 'userId'>) => {
    if (!user) return;
    const sale: Sale = { ...saleData, userId: user.id };
    setSales(prev => [...prev, sale]);
    
    setProducts(prev => prev.map(product => {
      const soldItem = sale.items.find(item => item.productId === product.id);
      if (soldItem) {
        return { ...product, stock: Math.max(0, product.stock - soldItem.quantity) };
      }
      return product;
    }));
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
      case 'dashboard': return isAdmin || isGerente ? <Dashboard products={products} sales={sales} /> : <POS products={products} onCompleteSale={handleCompleteSale} />;
      case 'pos': return <POS products={products} onCompleteSale={handleCompleteSale} />;
      case 'inventory': return isAdmin || isGerente ? <Inventory products={products} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} /> : null;
      case 'history': return <History sales={user.role === 'ADMIN' || user.role === 'CAIXA' ? sales : sales.filter(s => s.userId === user.id)} />;
      default: return <POS products={products} onCompleteSale={handleCompleteSale} />;
    }
  };

  return (
    <Layout activeView={view} onNavigate={setView} user={user} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
