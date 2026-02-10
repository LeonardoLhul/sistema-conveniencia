const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const apiClient = {
  // ========== AUTH ==========

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    return data;
  },

  async verifyToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token inválido');
    }

    return data;
  },

  // ========== PRODUCTS ==========

  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar produtos');
    }

    return data;
  },

  async searchProducts(search: string) {
    const response = await fetch(
      `${API_BASE_URL}/products?search=${encodeURIComponent(search)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar produtos');
    }

    return data;
  },

  async getProductById(productId: number) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar produto');
    }

    return data;
  },

  async createProduct(product: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar produto');
    }

    return data;
  },

  async updateProduct(productId: number, product: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar produto');
    }

    return data;
  },

  async deleteProduct(productId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao deletar produto');
    }

    return data;
  },

  // ========== STOCK ==========

  async getStock() {
    const response = await fetch(`${API_BASE_URL}/stock`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar estoque');
    }

    return data;
  },

  async getProductStock(productId: number) {
    const response = await fetch(`${API_BASE_URL}/stock/product/${productId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar estoque do produto');
    }

    return data;
  },

  async getLowStockProducts() {
    const response = await fetch(`${API_BASE_URL}/stock/low`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar produtos com estoque baixo');
    }

    return data;
  },

  async updateStock(productId: number, quantity: number, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/stock/product/${productId}/update`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar estoque');
    }

    return data;
  },

  async addStock(productId: number, quantity: number, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/stock/product/${productId}/add`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao adicionar ao estoque');
    }

    return data;
  },

  async removeStock(productId: number, quantity: number, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/stock/product/${productId}/remove`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao remover do estoque');
    }

    return data;
  },

  async setMinQuantity(productId: number, minQuantity: number, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/stock/product/${productId}/min`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ min_quantity: minQuantity }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar quantidade mínima');
    }

    return data;
  },

  // ========== SALES ==========

  async createSale(sale: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(sale),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar venda');
    }

    return data;
  },

  async getSalesReport(startDate: string, endDate: string, token: string) {
    const response = await fetch(
      `${API_BASE_URL}/reports/sales?start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar relatório de vendas');
    }

    return data;
  },
};