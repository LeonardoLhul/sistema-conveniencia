from db import get_connection

def get_stock_by_product(product_id):
    """Retorna o estoque de um produto"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id, product_id, quantity, min_quantity, updated_at 
            FROM stock 
            WHERE product_id = %s
        """, (product_id,))
        
        stock = cursor.fetchone()
        
        if stock:
            return {"success": True, "data": stock}
        else:
            return {"success": False, "message": "Estoque não encontrado"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def get_all_stock():
    """Retorna estoque de todos os produtos"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT s.id, s.product_id, p.name, s.quantity, s.min_quantity, s.updated_at 
            FROM stock s
            JOIN products p ON s.product_id = p.id
            ORDER BY p.name
        """)
        
        stock_list = cursor.fetchall()
        return {"success": True, "data": stock_list}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def update_stock(product_id, quantity):
    """Atualiza a quantidade em estoque"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE stock 
            SET quantity = %s 
            WHERE product_id = %s
        """, (quantity, product_id))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "message": "Estoque não encontrado"}
        
        return {"success": True, "message": "Estoque atualizado com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def add_stock(product_id, quantity):
    """Adiciona quantidade ao estoque"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE stock 
            SET quantity = quantity + %s 
            WHERE product_id = %s
        """, (quantity, product_id))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "message": "Estoque não encontrado"}
        
        return {"success": True, "message": "Estoque adicionado com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def remove_stock(product_id, quantity):
    """Remove quantidade do estoque"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Verificar se tem quantidade suficiente
        cursor.execute("SELECT quantity FROM stock WHERE product_id = %s", (product_id,))
        result = cursor.fetchone()
        
        if not result:
            return {"success": False, "message": "Estoque não encontrado"}
        
        current_qty = result[0]
        if current_qty < quantity:
            return {"success": False, "message": f"Quantidade insuficiente. Disponível: {current_qty}"}
        
        cursor.execute("""
            UPDATE stock 
            SET quantity = quantity - %s 
            WHERE product_id = %s
        """, (quantity, product_id))
        
        conn.commit()
        
        return {"success": True, "message": "Estoque removido com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def set_min_quantity(product_id, min_quantity):
    """Define a quantidade mínima de estoque"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE stock 
            SET min_quantity = %s 
            WHERE product_id = %s
        """, (min_quantity, product_id))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "message": "Estoque não encontrado"}
        
        return {"success": True, "message": "Quantidade mínima atualizada com sucesso"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def get_low_stock_products():
    """Retorna produtos com estoque baixo"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT s.id, s.product_id, p.name, s.quantity, s.min_quantity 
            FROM stock s
            JOIN products p ON s.product_id = p.id
            WHERE s.quantity <= s.min_quantity AND p.active = 1
            ORDER BY s.quantity ASC
        """)
        
        low_stock = cursor.fetchall()
        return {"success": True, "data": low_stock}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()
