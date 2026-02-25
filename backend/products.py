from db import get_connection

def get_all_products():
    """Retorna todos os produtos ativos com seus estoques"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
    SELECT 
        p.id, 
        p.name, 
        p.barcode, 
        p.price, 
        p.cost_price, 
        p.active, 
        p.created_at,
        p.category_id,
        c.categoria AS category,
        s.quantity, 
        s.min_quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.active = 1
    ORDER BY p.name
""")
        
        products = cursor.fetchall()
        return {"success": True, "data": products}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def get_product_by_id(product_id):
    """Retorna um produto específico pelo ID com estoque"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
    SELECT 
        p.id, 
        p.name, 
        p.barcode, 
        p.price, 
        p.cost_price, 
        p.active, 
        p.created_at,
        p.category_id,
        c.categoria AS category,
        s.quantity, 
        s.min_quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.id = %s
""", (product_id,))
        
        product = cursor.fetchone()
        
        if product:
            return {"success": True, "data": product}
        else:
            return {"success": False, "message": "Produto não encontrado"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def create_product(name, barcode, price, cost_price=None, active=1, category_id=None, category=None, stock=None, min_quantity=None):

    """Cria um novo produto e opcionalmente inicializa o estoque"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Se receber categoria como string (nome), resolver para category_id
        if category is not None and category_id is None:
            cursor.execute("SELECT id FROM categories WHERE categoria = %s", (category,))
            cat_row = cursor.fetchone()
            if cat_row:
                category_id = cat_row[0]
        
        cursor.execute("""
    INSERT INTO products (name, barcode, price, cost_price, active, category_id) 
    VALUES (%s, %s, %s, %s, %s, %s)
""", (name, barcode, price, cost_price, active, category_id))
        
        conn.commit()
        product_id = cursor.lastrowid

        # Se informado, criar linha em stock
        try:
            qty = int(stock) if stock is not None else 0
        except Exception:
            qty = 0

        try:
            min_q = int(min_quantity) if min_quantity is not None else 0
        except Exception:
            min_q = 0

        try:
            cursor.execute("""
                INSERT INTO stock (product_id, quantity, min_quantity) VALUES (%s, %s, %s)
            """, (product_id, qty, min_q))
            conn.commit()
        except Exception:
            # não falhar a criação do produto se a criação do estoque der problema
            pass
        
        return {
            "success": True,
            "message": "Produto criado com sucesso",
            "product_id": product_id
        }
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def update_product(product_id, name=None, barcode=None, price=None, cost_price=None, active=None, category_id=None, category=None):

    """Atualiza um produto existente"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Se receber categoria como string (nome), resolver para category_id
        if category is not None and category_id is None:
            cursor.execute("SELECT id FROM categories WHERE categoria = %s", (category,))
            cat_row = cursor.fetchone()
            if cat_row:
                category_id = cat_row[0]
        
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            return {"success": False, "message": f"Produto com ID {product_id} não encontrado"}
        
        # Construir query dinamicamente
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = %s")
            params.append(name)
        if barcode is not None:
            updates.append("barcode = %s")
            params.append(barcode)
        if price is not None:
            updates.append("price = %s")
            params.append(price)
        if cost_price is not None:
            updates.append("cost_price = %s")
            params.append(cost_price)
        if active is not None:
            updates.append("active = %s")
            params.append(active)

        if category_id is not None:
            updates.append("category_id = %s")
            params.append(category_id)
        
        if not updates:
            return {"success": False, "message": "Nenhum campo para atualizar"}
        
        params.append(product_id)
        
        cursor.execute(f"""
            UPDATE products 
            SET {', '.join(updates)} 
            WHERE id = %s
        """, params)
        
        conn.commit()
        
        return {"success": True, "message": "Produto atualizado com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def delete_product(product_id):
    """Deleta um produto (soft delete - apenas desativa)"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE products 
            SET active = 0 
            WHERE id = %s
        """, (product_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "message": "Produto não encontrado"}
        
        return {"success": True, "message": "Produto deletado com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def search_products(search_term):
    """Busca produtos por nome ou barcode com estoque"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        search_pattern = f"%{search_term}%"
        cursor.execute("""
    SELECT 
        p.id, 
        p.name, 
        p.barcode, 
        p.price, 
        p.cost_price, 
        p.active, 
        p.created_at,
        p.category_id,
        c.categoria AS category,
        s.quantity, 
        s.min_quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.active = 1 
    AND (p.name LIKE %s OR p.barcode LIKE %s)
    ORDER BY p.name
""", (search_pattern, search_pattern))
        
        products = cursor.fetchall()
        return {"success": True, "data": products}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()
