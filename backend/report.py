from db import get_connection

def generate_sales_report(start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                o.id,
                o.created_id AS timestamp,
                o.payment_method,
                o.total,
                p.name AS product_name,
                si.quantity,
                si.unit_price
            FROM orders o
            JOIN sales_items si ON o.id = si.sale_id
            JOIN products p ON p.id = si.product_id
            WHERE o.created_id BETWEEN %s AND %s
            ORDER BY o.created_id DESC
        """, (start_date, end_date))

        rows = cursor.fetchall()
        sales = {}

        payment_map = {
            "DEBITO": "DÉBITO",
            "CREDITO": "CRÉDITO",
            "PIX": "PIX",
            "DINHEIRO": "DINHEIRO"
        }

        for row in rows:
            sale_id = row["id"]

            if sale_id not in sales:
                sales[sale_id] = {
                    "id": sale_id,
                    "timestamp": row["timestamp"].timestamp() * 1000,  # JS friendly
                    "paymentMethod": payment_map.get(
                        row["payment_method"],
                        row["payment_method"]
                    ),
                    "items": [],
                    "total": float(row["total"])
                }

            sales[sale_id]["items"].append({
                "name": row["product_name"],
                "quantity": row["quantity"],
                "price": float(row["unit_price"])
            })

        return {
            "success": True,
            "data": list(sales.values())
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cursor.close()
        conn.close()
