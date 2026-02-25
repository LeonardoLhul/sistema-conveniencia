from db import get_connection
from datetime import datetime


def to_epoch_ms(ts):
    """Converte diferentes formatos de timestamp para milliseconds since epoch (int).
    Aceita datetime, string no formato MySQL '%Y-%m-%d %H:%M:%S' ou ISO, ou inteiro já em ms/s.
    """
    if ts is None:
        return None
    if isinstance(ts, (int, float)):
        # presumir que já são ms se maior que 1e12, senão segundos
        val = int(ts)
        if val > 1e12:
            return val
        if val > 1e9:
            return val * 1000
        return val
    if hasattr(ts, 'timestamp'):
        return int(ts.timestamp() * 1000)
    if isinstance(ts, str):
        # tentar formatos comuns
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(ts, fmt)
                return int(dt.timestamp() * 1000)
            except Exception:
                continue
        # último recurso: deixar como None
        return None
    return None

def get_all_sales():
    """Retorna todas as vendas"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT
                s.id,
                s.user_id AS userId,
                s.created_id AS timestamp,
                s.total,
                s.payment_method AS paymentMethod,
                si.product_id AS productId,
                si.quantity,
                si.unit_price AS price,
                p.name AS product_name
            FROM sales s
            LEFT JOIN sales_items si ON s.id = si.sale_id
            LEFT JOIN products p ON p.id = si.product_id
            ORDER BY s.created_id DESC
        """)
        rows = cursor.fetchall()
        sales = {}
        for row in rows:
            sid = row['id']
            if sid not in sales:
                sales[sid] = {
                    "id": sid,
                    "userId": row['userId'],
                    "timestamp": to_epoch_ms(row['timestamp']),
                    "total": float(row['total']),
                    "paymentMethod": row['paymentMethod'],
                    "items": []
                }
            if row.get('productId') is not None:
                sales[sid]['items'].append({
                    "productId": row['productId'],
                    "name": row['product_name'],
                    "quantity": row['quantity'],
                    "price": float(row['price'])
                })
        return {"success": True, "data": list(sales.values())}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def get_sales_by_user(user_id):
    """Retorna vendas feitas por um usuário específico"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT
                s.id,
                s.user_id AS userId,
                s.created_id AS timestamp,
                s.total,
                s.payment_method AS paymentMethod,
                si.product_id AS productId,
                si.quantity,
                si.unit_price AS price,
                p.name AS product_name
            FROM sales s
            LEFT JOIN sales_items si ON s.id = si.sale_id
            LEFT JOIN products p ON p.id = si.product_id
            WHERE s.user_id = %s
            ORDER BY s.created_id DESC
        """, (user_id,))
        rows = cursor.fetchall()
        print(f"[DEBUG] get_sales_by_user({user_id}) fetched {len(rows)} rows")
        sales = {}
        for row in rows:
            sid = row['id']
            if sid not in sales:
                sales[sid] = {
                    "id": sid,
                    "userId": row['userId'],
                    "timestamp": to_epoch_ms(row['timestamp']),
                    "total": float(row['total']),
                    "paymentMethod": row['paymentMethod'],
                    "items": []
                }
            if row.get('productId') is not None:
                sales[sid]['items'].append({
                    "productId": row['productId'],
                    "name": row['product_name'],
                    "quantity": row['quantity'],
                    "price": float(row['price'])
                })
        return {"success": True, "data": list(sales.values())}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def create_sale(user_id, timestamp, total, payment_method, items):
    """Registra uma venda e seus itens"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # note: tabela usa snake_case; usamos o timestamp fornecido (não deixamos auto-generar)
        cursor.execute("""
            INSERT INTO sales (user_id, created_id, total, payment_method)
            VALUES (%s, %s, %s, %s)
        """, (user_id, timestamp, total, payment_method))
        sale_id = cursor.lastrowid
        print(f"[DEBUG] created sale id={sale_id} user_id={user_id} total={total} timestamp={timestamp}")
        
        # assumir que items contem productId, quantity, price (pode ser dict ou object)
        for item in items:
            # extrair campos de forma robusta
            pid = item.get('productId') if isinstance(item, dict) else getattr(item, 'productId', None)
            qty = item.get('quantity') if isinstance(item, dict) else getattr(item, 'quantity', None)
            prc = item.get('price') if isinstance(item, dict) else getattr(item, 'price', None)

            if pid is None or qty is None or prc is None:
                raise ValueError(f"Item inválido na venda: {item}")

            # diminui automaticamente o estoque
            cursor.execute("""
                UPDATE stock
                SET quantity = GREATEST(0, quantity - %s)
                WHERE product_id = %s
            """, (qty, pid))

            cursor.execute("""
                INSERT INTO sales_items (sale_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """, (sale_id, pid, qty, prc))
        
        conn.commit()
        return {"success": True, "sale_id": sale_id}
    except Exception as e:
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()
