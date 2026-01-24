
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import History from './components/History';
import AIInsights from './components/AIInsights';
import Login from './components/Login';
import { View, Product, Sale, User } from './types';
import { INITIAL_PRODUCTS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Carregar dados e sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      // Vendedores começam direto no POS
      if (parsedUser.role === 'SALES') setView('pos');
    }

    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
    
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (sales.length > 0) localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('user_session', JSON.stringify(loggedUser));
    setView(loggedUser.role === 'ADMIN' ? 'dashboard' : 'pos');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = { ...newProduct, id: Math.random().toString(36).substr(2, 9) };
    setProducts(prev => [...prev, product]);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Deseja excluir este produto?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
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

  const renderView = () => {
    // Verificação de segurança adicional para o render
    const isAdmin = user.role === 'ADMIN';

    switch (view) {
      case 'dashboard': return isAdmin ? <Dashboard products={products} sales={sales} /> : <POS products={products} onCompleteSale={handleCompleteSale} />;
      case 'pos': return <POS products={products} onCompleteSale={handleCompleteSale} />;
      case 'inventory': return isAdmin ? <Inventory products={products} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} /> : null;
      case 'history': return <History sales={user.role === 'ADMIN' ? sales : sales.filter(s => s.userId === user.id)} />;
      case 'ai': return isAdmin ? <AIInsights products={products} sales={sales} /> : null;
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
