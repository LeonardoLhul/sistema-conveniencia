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
    """Atualiza ou cria estoque de forma segura"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO stock (product_id, quantity, min_quantity)
            VALUES (%s, %s, 0)
            ON DUPLICATE KEY UPDATE
                quantity = VALUES(quantity)
        """, (product_id, quantity))

        conn.commit()

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
            # tentar criar linha de estoque se não existir
            try:
                cursor.execute("""
                    INSERT INTO stock (product_id, quantity, min_quantity) VALUES (%s, %s, %s)
                """, (product_id, quantity, 0))
                conn.commit()
                return {"success": True, "message": "Estoque criado e adicionado com sucesso"}
            except Exception as ie:
                return {"success": False, "message": f"Estoque não encontrado e falha ao criar: {ie}"}

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

def consume_internal(items):
    """Remove vários itens do estoque em uma única transação, sem registrar venda."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        for item in items:
            product_id = item.get('productId')
            quantity = item.get('quantity')

            if product_id is None or quantity is None:
                raise ValueError("Cada item deve conter productId e quantity")

            cursor.execute("""
                SELECT s.quantity, p.name
                FROM stock s
                JOIN products p ON p.id = s.product_id
                WHERE s.product_id = %s
                FOR UPDATE
            """, (product_id,))
            stock_row = cursor.fetchone()

            if not stock_row:
                raise ValueError(f"Estoque não encontrado para o produto {product_id}")

            if stock_row['quantity'] < quantity:
                raise ValueError(f"Quantidade insuficiente para {stock_row['name']}. Disponível: {stock_row['quantity']}")

        for item in items:
            cursor.execute("""
                UPDATE stock
                SET quantity = quantity - %s
                WHERE product_id = %s
            """, (item['quantity'], item['productId']))

        conn.commit()
        return {"success": True, "message": "Consumo interno registrado com sucesso"}

    except Exception as e:
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def set_min_quantity(product_id, min_quantity):
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO stock (product_id, quantity, min_quantity)
            VALUES (%s, 0, %s)
            ON DUPLICATE KEY UPDATE
                min_quantity = VALUES(min_quantity)
        """, (product_id, min_quantity))

        conn.commit()

        return {"success": True, "message": "Quantidade mínima definida com sucesso"}
    
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
